import { PublicKey } from '@cmdcode/crypto-utils';
import { Address, Signer, Tap, Transaction, Tx, TxData } from '@cmdcode/tapscript';
import { getServiceFeeAddress } from '@config/btc-config';
import { nanoid } from '@reduxjs/toolkit';
import { signTx } from '@services/rest/api';
import { CreateOrderParams, IOrder, Inscription, OrderTxs, RefundTxParams, TxInfo } from '@types';



import { addressReceivedMoneyInThisTx, calcFees_as_unisat, calcFees_launchpad, createDummyTx, getOutputBytes, pushBTCpmt } from './inscription';
import { createInscription, createInscriptions, createTempFundingAddress, getInitTapkey, // createTempP2TRAddress,
getTapkey, inscribe, signInitTxOnServer, signedWitness, signedWitnessInitOnServer, signedWitnessOnServer } from './inscription-server';


/** 创建order */
export async function createOrder(params: CreateOrderParams): Promise<IOrder> {
  const { files, receiveAddress, feeRate, inscriptionBalance = 546, fees } = params
  const orderId = nanoid()
  const [payAddress, payAddressPubkey] = await createTempFundingAddress(files[0])
  return {
    orderId,
    status: 'wait_for_payment',
    receiveAddress,
    payAddress,
    payAddressPubkey,
    inscriptionBalance,
    createTimestamp: Date.now(),
    isPaidOffchain: false,
    feeRate,
    amount: fees.totalFee,
    minerFee: fees.networkFee,
    serviceFee: fees.discountedFee,
    files: files.map((file, idx) => ({ ...file, id: 'fid-' + idx, broadcastState: 0, txidFromResp: '' })),
    count: files.length,
    minted: 0,
    payTxInfo: []
  }
}

export async function createInscribeTx(inscription: Inscription, txinfo: TxInfo) {
  // const txinfo2 = await addressReceivedMoneyInThisTx(inscription.inscriptionAddress)
  // const txid2 = txinfo.txid
  // const amt2 = txinfo.amt
  console.log('createInscribeTx txinfo', txinfo)
  const { txid, amt, vout } = txinfo

  const redeemtx = Tx.create({
    vin: [
      {
        txid: txid,
        vout: vout,
        prevout: {
          value: amt,
          scriptPubKey: ['OP_1', inscription.tapkey]
        }
      }
    ],
    vout: [
      {
        value: amt - inscription.fee,
        scriptPubKey: Address.toScriptPubKey(inscription.toAddress)
        // scriptPubKey: ['OP_1', Address.p2tr.decode(inscription.toAddress).hex]
      }
    ]
  })
  return redeemtx
  // const sig = await Signer.taproot.sign(inscription.seckey.raw, redeemtx, 0, { extension: inscription.leaf })
  // redeemtx.vin[0].witness = [sig.hex, inscription.script_orig, inscription.cblock]

  // console.dir(redeemtx, { depth: null })

  // const rawtx2 = Tx.encode(redeemtx).hex
  // return rawtx2
}

export async function createInitRedeemTx(order: IOrder, inscriptions: Inscription[], txinfo: TxInfo) {
  const { payAddress, inscriptionBalance, serviceFee, feeRate, serviceFeeAddress } = order
  // TODO: tapkey 改成从sign server获取
  // const [init_tapkey, pubkey] = await getTapkey(payAddress)
  // TOOD: txinfo 改成从order server 传入
  // const txinfo = await addressReceivedMoneyInThisTx(payAddress)
  // const txinfo = { txid: '01346bf96090ff41e424cdb8c24e4a52643abecaf00db9fede2e0501995b43d1', vout: 0, amt: 8228 }
  console.log('funding txinfo', txinfo)
  const { txid, vout, amt, refund_address } = txinfo
  if (!txid) {
    const errormsg = 'check payment status failed, funding txinfo not found'
    console.log(errormsg)
    throw errormsg
  }
  const outputs = []

  // 第一个铭文,直接铭刻，不能预留矿工费
  outputs.push({
    value: inscriptionBalance, // + inscriptions[0].fee,
    scriptPubKey: ['OP_1', Address.decode(inscriptions[0].toAddress).data.hex]
    // scriptPubKey: ['OP_1', Address.p2tr.decode(inscriptions[0].toAddress).hex]
  })
  // 第二个至第N个铭文
  for (let i = 1; i < inscriptions.length; i++) {
    outputs.push({
      value: inscriptionBalance + inscriptions[i].fee,
      scriptPubKey: ['OP_1', inscriptions[i].tapkey]
    })
  }
  // 服务费
  if (!isNaN(serviceFee) && serviceFee >= 546) {
    outputs.push({
      value: serviceFee,
      scriptPubKey: Address.toScriptPubKey(serviceFeeAddress ?? getServiceFeeAddress())
      // scriptPubKey: ['OP_1', Address.decode(serviceFeeAddress ?? getServiceFeeAddress()).data.hex]
    })
  }
  // 找零，多付金额-gas超过灰尘金额时退回给付款账号
  const overpayment = amt - order.amount
  if (overpayment >= 577 && refund_address) {
    try {
      const refundAddressData = Address.decode(refund_address)
      const refundTxGas = getOutputBytes(refundAddressData.type) * feeRate
      const refundAmt = overpayment - refundTxGas
      if (refundAmt >= 546) {
        outputs.push({
          value: refundAmt,
          scriptPubKey: Address.toScriptPubKey(refund_address)
          // scriptPubKey: ['OP_1', refundAddressData.data.hex]
        })
      }
    } catch (error) {
      // 记录错误日志，但不中断流程
      console.log('create refund output fail:', error)
    }
  }
  //

  const init_redeemtx = Tx.create({
    vin: [
      {
        txid: txid,
        vout: vout,
        prevout: {
          value: amt,
          scriptPubKey: ['OP_1', Address.p2tr.decode(payAddress).hex]
          // scriptPubKey: ['OP_1', init_tapkey]
        }
      }
    ],
    vout: outputs
  })

  return init_redeemtx
  // console.log('init_redeemtx txid', new Transaction(init_redeemtx).txid)
  // // const init_sig = await Signer.taproot.sign(seckey.raw, init_redeemtx, 0, { extension: init_leaf })
  // // init_redeemtx.vin[0].witness = [init_sig.hex, init_script, init_cblock]

  // init_redeemtx.vin[0].witness = await signedWitness(init_redeemtx, payAddress)

  // // 验证签名
  // const isValid = await Signer.taproot.verify(init_redeemtx, 0, { pubkey })

  // console.log('isValid', isValid)

  // console.dir(init_redeemtx, { depth: null })
  // const rawtx: string = Tx.encode(init_redeemtx).hex
  // return rawtx
}

export async function createInitRedeemTxSeg(order: IOrder, inscriptions: Inscription[], txinfo: TxInfo) {
  const { payAddress, payAddressPubkey, inscriptionBalance, serviceFeeAddress, feeRate } = order
  // TODO: tapkey 改成从sign server获取
  const { init_tapkey, ...other } = getInitTapkey(payAddressPubkey)
  console.log('createInitRedeemTxSeg init_tapkey', init_tapkey)
  // TOOD: txinfo 改成从order server 传入
  // const txinfo = await addressReceivedMoneyInThisTx(payAddress)
  // const txinfo = { txid: '01346bf96090ff41e424cdb8c24e4a52643abecaf00db9fede2e0501995b43d1', vout: 0, amt: 8228 }
  console.log('funding txinfo', txinfo)
  const { txid, vout, amt, refund_address } = txinfo
  if (!txid) {
    const errormsg = 'check payment status failed, funding txinfo not found'
    console.log(errormsg)
    throw errormsg
  }
  // 根据实际锁定的files重新计算费用
  const fees = calcFees_launchpad(order)
  console.log('calcFees_launchpad', fees)

  const outputs = []

  // // 第一个铭文,直接铭刻，不能预留矿工费
  // outputs.push({
  //   value: inscriptionBalance, // + inscriptions[0].fee,
  //   scriptPubKey: ['OP_1', Address.decode(inscriptions[0].toAddress).data.hex]
  //   // scriptPubKey: ['OP_1', Address.p2tr.decode(inscriptions[0].toAddress).hex]
  // })
  // 第一个至第N个铭文
  for (let i = 0; i < inscriptions.length; i++) {
    outputs.push({
      value: inscriptionBalance + inscriptions[i].fee,
      scriptPubKey: ['OP_1', inscriptions[i].tapkey]
    })
  }
  // 服务费
  if (!isNaN(fees.serviceFee) && fees.serviceFee >= 546) {
    outputs.push({
      value: fees.serviceFee,
      scriptPubKey: Address.toScriptPubKey(serviceFeeAddress ?? getServiceFeeAddress())
      // scriptPubKey: ['OP_1', Address.decode(serviceFeeAddress ?? getServiceFeeAddress()).data.hex]
    })
  }
  // 找零，多付金额-gas超过灰尘金额时退回给付款账号
  const overpayment = amt - fees.totalFee
  console.log(`overpayment:${overpayment} = ${amt} - ${fees.totalFee}`)
  if (overpayment >= 577 && refund_address) {
    try {
      const refundAddressData = Address.decode(refund_address)
      const refundTxGas = getOutputBytes(refundAddressData.type) * feeRate
      const refundAmt = overpayment - refundTxGas
      if (refundAmt >= 546) {
        outputs.push({
          value: refundAmt,
          scriptPubKey: Address.toScriptPubKey(refund_address)
          // scriptPubKey: ['OP_1', refundAddressData.data.hex]
        })
      }
    } catch (error) {
      // 记录错误日志，但不中断流程
      console.log('create refund output fail:', error)
    }
  }

  const init_redeemtx = Tx.create({
    vin: [
      {
        txid: txid,
        vout: vout,
        prevout: {
          value: amt,
          scriptPubKey: ['OP_1', Address.decode(payAddress).data.hex]
          // scriptPubKey: ['OP_1', init_tapkey]
        }
      }
    ],
    vout: outputs
  })

  return init_redeemtx
  // console.log('init_redeemtx txid', new Transaction(init_redeemtx).txid)
  // // const init_sig = await Signer.taproot.sign(seckey.raw, init_redeemtx, 0, { extension: init_leaf })
  // // init_redeemtx.vin[0].witness = [init_sig.hex, init_script, init_cblock]

  // init_redeemtx.vin[0].witness = await signedWitness(init_redeemtx, payAddress)

  // // 验证签名
  // const isValid = await Signer.taproot.verify(init_redeemtx, 0, { pubkey })

  // console.log('isValid', isValid)

  // console.dir(init_redeemtx, { depth: null })
  // const rawtx: string = Tx.encode(init_redeemtx).hex
  // return rawtx
}

export async function createRefundTx(txinfo: RefundTxParams) {
  console.log('start createRefundTx with params', txinfo)
  const { txid, vout, amt, refund_address, pay_address, feeRate } = txinfo

  const refundAddressData = Address.decode(refund_address)
  const dummyTx = createDummyTx('refund', { pay_address, refund_address })
  const txSize = dummyTx ? Tx.util.getTxSize(dummyTx).vsize : 68 + getOutputBytes(refundAddressData.type)
  const refundTxGas = txSize * feeRate
  const refundAmt = amt - refundTxGas
  if (refundAmt < 546) {
    throw `Refund amout should not higher than bitcon dust (546).`
  }
  console.log(`refundAmt: ${refundAmt} = ${amt} - ${refundTxGas}, txSize:${txSize}`)
  const unsignedTx0 = Tx.create({
    vin: [
      {
        txid: txid,
        vout: vout,
        prevout: {
          value: amt,
          scriptPubKey: ['OP_1', Address.decode(pay_address).data.hex]
        }
      }
    ],
    vout: [
      {
        value: refundAmt,
        scriptPubKey: Address.toScriptPubKey(refund_address)
        // scriptPubKey: ['OP_1', refundAddressData.data.hex]
      }
    ]
  })

  const tx = new Transaction(unsignedTx0)
  console.log('txSize:unsigned RefundTx', Tx.util.getTxSize(unsignedTx0))
  console.log('RefundTx', JSON.stringify(unsignedTx0, null, 2))
  // const signedTx0= _.cloneDeep(unsignedTx0)
  const signedTx0 = structuredClone(unsignedTx0)
  signedTx0.vin[0].witness = await signInitTxOnServer(unsignedTx0, pay_address)
  const isValid_signedTx0 = Signer.taproot.verify(signedTx0, 0)
  console.log('signed RefundTx isValid', isValid_signedTx0)

  const rawtx0: string = Tx.encode(signedTx0).hex
  console.log('txSize:signed RefundTx', Tx.util.getTxSize(signedTx0))

  const result: OrderTxs = {
    orderId: '',
    txs: [{ txid: tx.txid, txHex: rawtx0, fileId: '0' }]
  }
  return result
}

export async function createInitRedeemTxAndSign(order: IOrder, inscriptions: Inscription[], txinfo?: TxInfo) {
  const { payAddress, inscriptionBalance, serviceFee, serviceFeeAddress } = order
  // TODO: tapkey 改成从sign server获取
  const [init_tapkey, pubkey] = await getTapkey(payAddress)
  // TOOD: txinfo 改成从order server 传入
  txinfo = txinfo ? txinfo : await addressReceivedMoneyInThisTx(payAddress)
  // const txinfo = { txid: '01346bf96090ff41e424cdb8c24e4a52643abecaf00db9fede2e0501995b43d1', vout: 0, amt: 8228 }
  console.log('funding txinfo', txinfo)
  const { txid, vout, amt } = txinfo
  if (!txid) {
    const errormsg = 'check payment status failed, funding txinfo not found'
    console.log(errormsg)
    throw errormsg
  }
  const outputs = []

  // 第一个铭文,直接铭刻，不能预留矿工费
  outputs.push({
    value: inscriptionBalance, // + inscriptions[0].fee,
    scriptPubKey: ['OP_1', Address.decode(inscriptions[0].toAddress).data.hex]
  })
  // 第二个至第N个铭文
  for (let i = 1; i < inscriptions.length; i++) {
    outputs.push({
      value: inscriptionBalance + inscriptions[i].fee,
      scriptPubKey: ['OP_1', inscriptions[i].tapkey]
    })
  }
  // 服务费
  if (!isNaN(serviceFee) /* && serviceFee >= 500 */) {
    outputs.push({
      value: serviceFee,
      scriptPubKey: Address.toScriptPubKey(serviceFeeAddress ?? getServiceFeeAddress())
      // scriptPubKey: ['OP_1', Address.decode(serviceFeeAddress ?? getServiceFeeAddress()).data.hex]
    })
  }

  const init_redeemtx = Tx.create({
    vin: [
      {
        txid: txid,
        vout: vout,
        prevout: {
          value: amt,
          scriptPubKey: ['OP_1', Address.p2tr.decode(payAddress).hex]
          // scriptPubKey: ['OP_1', inscriptions[0].tapkey]
        }
      }
    ],
    vout: outputs
  })

  console.log('init_redeemtx txid', new Transaction(init_redeemtx).txid)
  // const init_sig = await Signer.taproot.sign(seckey.raw, init_redeemtx, 0, { extension: init_leaf })
  // init_redeemtx.vin[0].witness = [init_sig.hex, init_script, init_cblock]

  init_redeemtx.vin[0].witness = await signedWitness(init_redeemtx, payAddress, inscriptions[0])

  // 验证签名
  const isValid = await Signer.taproot.verify(init_redeemtx, 0, { pubkey })

  console.log('isValid', isValid)

  console.dir(init_redeemtx, { depth: null })
  // const rawtx: string = Tx.encode(init_redeemtx).hex
  // return rawtx
  return init_redeemtx
}

export async function createTransactions(order: IOrder, payTxInfo: TxInfo): Promise<OrderTxs> {
  const { orderId, payAddress, payAddressPubkey, inscriptionBalance } = order
  const pubkey = new PublicKey(payAddressPubkey, { type: 'taproot' })
  const result: OrderTxs = {
    orderId,
    txs: []
  }
  const inscriptions = createInscriptions(order)
  // const inscriptions = await createInscriptions(order).catch((error) => {
  //   console.log(error)
  //   return error
  // })
  if (inscriptions) {
    const unsignedTx0: TxData = await createInitRedeemTx(order, inscriptions, payTxInfo)
    const tx = new Transaction(unsignedTx0)
    const txid = tx.txid
    console.log('txSize', Tx.util.getTxSize(unsignedTx0))
    // const signedTx0= _.cloneDeep(unsignedTx0)
    const signedTx0 = structuredClone(unsignedTx0)
    signedTx0.vin[0].witness = await signedWitnessOnServer(unsignedTx0, payAddress, inscriptions[0])
    const isValid_signedTx0 = Signer.taproot.verify(signedTx0, 0, { pubkey })
    console.log('signedTx0 isValid', isValid_signedTx0)
    console.log('pubkey', pubkey.hex)
    console.log('payAddressPubkey', payAddressPubkey)
    const rawtx0: string = Tx.encode(signedTx0).hex
    console.log('Tx0 txSize', Tx.util.getTxSize(signedTx0))
    result.txs.push({ txid, txHex: rawtx0, fileId: inscriptions[0].fileId ?? '0' })

    if (inscriptions.length > 1) {
      for (let i = 1; i < inscriptions.length; i++) {
        const inscription = inscriptions[i]
        const txinfo = { txid, vout: i, amt: inscriptionBalance + inscription.fee }
        const unsignedTxN = await createInscribeTx(inscriptions[i], txinfo)
        const txN = new Transaction(unsignedTxN)
        // const txidN = txN.txid
        const signedTxN = structuredClone(unsignedTxN)
        signedTxN.vin[0].witness = await signedWitnessOnServer(unsignedTxN, payAddress, inscription)
        const isValid_signedTxN = Signer.taproot.verify(signedTxN, 0, { pubkey })
        console.log('signedTxN isValid', isValid_signedTxN)
        console.log('TxN txSize', Tx.util.getTxSize(signedTxN))
        const rawTxN: string = Tx.encode(signedTxN).hex
        result.txs.push({ txid: txN.txid, txHex: rawTxN, fileId: inscriptions[i].fileId ?? '' + i })
      }
    }
  }

  return result
}

/**
 * payAddress不含script, 分账和铭刻分开单独处理
 * @param order
 * @param payTxInfo
 * @returns
 */
export async function createTransactionsSeg(order: IOrder, payTxInfo: TxInfo): Promise<OrderTxs> {
  const { orderId, payAddress, payAddressPubkey, inscriptionBalance } = order
  const pubkey = new PublicKey(payAddressPubkey, { type: 'taproot' })
  const result: OrderTxs = {
    orderId,
    txs: []
  }
  const inscriptions = createInscriptions(order)
  // const inscriptions = await createInscriptions(order).catch((error) => {
  //   console.log(error)
  //   return error
  // })
  if (inscriptions) {
    const unsignedTx0: TxData = await createInitRedeemTxSeg(order, inscriptions, payTxInfo)
    const tx = new Transaction(unsignedTx0)
    const txid = tx.txid
    console.log('txSize:unsignedTx0', Tx.util.getTxSize(unsignedTx0))
    console.log('Tx0', JSON.stringify(unsignedTx0, null, 2))
    // const signedTx0= _.cloneDeep(unsignedTx0)
    const signedTx0 = structuredClone(unsignedTx0)
    signedTx0.vin[0].witness = await signInitTxOnServer(unsignedTx0, payAddress)
    const isValid_signedTx0 = Signer.taproot.verify(signedTx0, 0)
    console.log('signedTx0 isValid', isValid_signedTx0)
    console.log('pubkey', pubkey.hex)
    console.log('payAddressPubkey', payAddressPubkey)
    const rawtx0: string = Tx.encode(signedTx0).hex
    console.log('txSize:signedTx0', Tx.util.getTxSize(signedTx0))
    result.txs.push({ txid, txHex: rawtx0, fileId: '0' })

    if (inscriptions.length > 0) {
      for (let i = 0; i < inscriptions.length; i++) {
        const inscription = inscriptions[i]
        const txinfo = { txid, vout: i, amt: inscriptionBalance + inscription.fee }
        const unsignedTxN = await createInscribeTx(inscriptions[i], txinfo)
        console.log('txSize:unsignedTxN', Tx.util.getTxSize(unsignedTxN))
        console.log('TxN', JSON.stringify(unsignedTxN, null, 2))
        const txN = new Transaction(unsignedTxN)

        const signedTxN = structuredClone(unsignedTxN)
        signedTxN.vin[0].witness = await signedWitnessOnServer(unsignedTxN, payAddress, inscription)
        const isValid_signedTxN = Signer.taproot.verify(signedTxN, 0, { pubkey })
        console.log('signedTxN isValid', isValid_signedTxN)
        console.log('txSize:signedTxN', Tx.util.getTxSize(signedTxN))
        const rawTxN: string = Tx.encode(signedTxN).hex
        result.txs.push({ txid: txN.txid, txHex: rawTxN, fileId: inscriptions[i].fileId ?? '' + i })
      }
    }
  }

  return result
}

/**
 * 铭刻第一个inscription给toAddress
 * 转第二至N个inscription给回payAddress，目的是拆分tx，以便后续铭刻
 * 转serviceFee给服务商收费地址
 * @param order
 * @param inscriptions
 */
export async function performInitRedeemTx(order: IOrder, inscriptions: Inscription[]) {
  console.log('createInitRedeemTx...')
  // const txinfo ={
  // 	txid:'1a56e4d723bf9a3fa47b22d77f1f18d8a5f803908976e387988de2ade1711440',
  // 	vout:0,
  // 	amt:4031
  // }
  const init_redeemtx = await createInitRedeemTxAndSign(order, inscriptions /*, txinfo */)
  const rawtx: string = Tx.encode(init_redeemtx).hex
  console.log('sendTx...')
  const txid = await pushBTCpmt(rawtx)

  console.log('Init TX', txid)
  return { txid, txData: init_redeemtx }
}

/**
 * 铭刻第二至N个inscription给toAddress
 * @param inscriptions
 */
export async function performInscribeTx(inscriptions: Inscription[], initTx: { txid: string; txData: TxData }) {
  if (inscriptions.length < 2) return
  const inscribeResults = []
  for (let i = 1; i < inscriptions.length; i++) {
    const amt_i = Number(initTx.txData.vout[i].value)
    const txinfo: TxInfo = { txid: initTx.txid, vout: i, amt: amt_i }
    const ir = await inscribe(inscriptions[i], txinfo)
    console.log(`[${i}] inscribe result: ${JSON.stringify(ir)}`)
    inscribeResults.push({ ir })
  }
  return inscribeResults
}

/** 执行order
 *  分两大步：
 *  1. 从payAddress转到 服务商收费地址serviceAddress 及每个inscription代理地址（为将铭文写到每个交易的第一sat）
 *  2. 每个inscription代理地址转到receiveAddress
 */
export async function perform(order: IOrder) {
  console.log('perform order', order)
  // TODO： 参数改成orderId,从数据库查询order
  const { files, feeRate, receiveAddress, payAddress, payAddressPubkey } = order

  const inscriptions: Inscription[] = files.map((file) =>
    createInscription(file, feeRate, receiveAddress, payAddress, payAddressPubkey)
  )

  // const promises: Promise<Inscription>[] = []
  // files.forEach((file) => {
  //   promises.push(
  //     createInscription(file, feeRate, receiveAddress, payAddress, payAddressPubkey).catch((error) => {
  //       console.error(error)
  //       return Promise.reject(error)
  //     })
  //   )
  // })
  // const allSettled = await Promise.allSettled(promises).catch((error) => {
  //   console.log('createInscription allSettled error', error)
  // })
  // const inscriptions: Inscription[] = []

  // allSettled?.forEach((settled) => {
  //   if (settled.status === 'fulfilled') {
  //     inscriptions.push(settled.value)
  //   }
  // })

  console.log('inscriptions', inscriptions)
  if (inscriptions.length !== files.length) throw 'createInscription failed: inscriptions.length !== files.length'
  const initTx = await performInitRedeemTx(order, inscriptions)
  const inscribeResults = await performInscribeTx(inscriptions, initTx)
  return { initTx, inscriptionTxs: inscribeResults }
}