// export const localKeyStore = new Map<string, any>()
import { Buff } from '@cmdcode/buff-utils';
import { KeyPair, PublicKey, SecretKey, secp } from '@cmdcode/crypto-utils';
import tapscript, { Address, Script, Signer, Tap, Transaction, Tx, TxData } from '@cmdcode/tapscript';
import { ENABLE_CPFP, MEMPOOL_NETWORK, getEncodedAddressPrefix } from '@config/btc-config';
import LocalKeyStore from '@services/files/LocalKeyStore';
import { getPrivateInfo, signTx, signTxJS } from '@services/rest/api';
import { IFile, IOrder, Inscription, TxInfo } from '@types';



import { addressReceivedMoneyInThisTx, buf2hex, bytesToHex, createDummyTx, getTxSize, getTxSizex, hexToBytes, loopTilAddressReceivesMoney, pushBTCpmt, waitSomeSeconds } from './inscription';


const encodedAddressPrefix = getEncodedAddressPrefix()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let pushing = false
async function isPushing() {
  while (pushing) {
    await sleep(10)
  }
}
// pub.raw 可能是33位，rawX是32位
export function rawX(raw: Uint8Array) {
  return raw.length > 32 ? raw.slice(1, 33) : raw
}
export function getInitTapkey(_pubkey: string) {
  const pubkey = new PublicKey(_pubkey, { type: 'taproot' })
  const init_script = [pubkey, 'OP_CHECKSIG']
  // const init_script_backup = ['0x' + buf2hex(pubkey.buffer), 'OP_CHECKSIG']
  const init_leaf = Tap.tree.getLeaf(Script.encode(init_script))
  const [init_tapkey, init_cblock] = Tap.getPubKey(pubkey, { target: init_leaf })

  return { init_tapkey, init_cblock, init_leaf, init_script }
}
export async function getTapkey(address: string) {
  // const keyInfo = localKeyStore.get(address)
  const keyInfo = await LocalKeyStore.findKeyInfoByAddress(address)
  if (!keyInfo) throw 'getTapkey() error, no key info found for ' + address

  const { privkey } = keyInfo
  // const seckey = new KeyPair(privkey)
  // const pubkey = rawX(seckey.pub.raw)
  const seckey = new SecretKey(privkey, { type: 'taproot' })
  const pubkey = seckey.pub
  const script = [pubkey, 'OP_CHECKSIG']

  const leaf = Tap.tree.getLeaf(Script.encode(script))
  const [tapkey, cblock] = Tap.getPubKey(pubkey, { target: leaf })

  return [tapkey, pubkey]
}
export async function signedWitness(tx: TxData, address: string, inscription: Inscription) {
  // const keyInfo = localKeyStore.get(address)
  const keyInfo = await LocalKeyStore.findKeyInfoByAddress(address)
  if (!keyInfo) throw 'signedWitness() error, no key info found for ' + address
  const { privkey /* , leaf, cblock */ } = keyInfo
  // console.log('privkey:', privkey)
  const seckey = new KeyPair(privkey)
  // const pubkey = rawX(seckey.pub.raw)
  // const seckey = new SecretKey(privkey, { type: 'taproot' })
  // const pubkey = seckey.pub
  // const script = [pubkey, 'OP_CHECKSIG']

  // const leaf = Tap.tree.getLeaf(Script.encode(script))
  // const [tapkey, cblock] = Tap.getPubKey(pubkey, { target: leaf })

  // const hash = Signer.taproot.hash(tx, 0, { extension: leaf })
  // console.log('hex to sig:', hash.hex)

  // const sig = await Signer.taproot.sign(seckey.raw, tx, 0, { extension: leaf })

  // console.log('signTx sig.hex:', sig.hex)
  // const witness = [sig.hex, script, cblock]
  // console.log('privkey--',inscription.seckey.hex)
  // console.log('inscription.leaf ',inscription.leaf )
  // console.log('getPubKey ',Tap.getPubKey(pubkey, { target: inscription.leaf }) )
  const sig = await Signer.taproot.sign(seckey.raw, tx, 0, { extension: inscription.leaf })
  const witness = [sig.hex, inscription.script_orig, inscription.cblock]
  return witness
}

export async function signInitTxOnServer(unsignedTx: TxData, address: string) {
  console.log('sign init tx without script on server...')

  // 本地签名 验证签名
  // const privkey = '0c9181638b7c1c761651fe6bbc4786017eeedf881b25c393881a901c7c94752f' //'97664508676c110ff75f3b42cb128ecd8d6fd25a6e7be5779659419b36fe8a0f'
  // const seckey = new SecretKey(privkey, { type: 'taproot' })
  // const [tseckey] = Tap.getSecKey(seckey)
  // // const pubkey = rawX(seckey.pub.raw)
  // console.log('--local-----------------')
  // const sigLocal = Signer.taproot.sign(tseckey, unsignedTx, 0)
  // console.log('sigLocal', sigLocal.hex)
  // const witnessLocal = [sigLocal]
  // const signedTxLocal = structuredClone(unsignedTx)
  // signedTxLocal.vin[0].witness = witnessLocal
  // const isValidLocal = Signer.taproot.verify(signedTxLocal, 0)
  // console.log('isValidLocal', isValidLocal)

  const hash = Signer.taproot.hash(unsignedTx, 0)

  // JS服务器签名 验证签名
  // const sigJS = await signTxJS({
  //   tweakPrivateKey: false,
  //   privateKey: privkey,
  //   hash: hash.hex
  // }).catch((error) => {
  //   console.error(error)
  //   throw 'signTx error: ' + error
  // })
  // console.log('--js------------------')
  // console.log('sigJS.signedHex', sigJS.signedHex)
  // const witnessJS = [sigJS.signedHex]
  // const signedTxJS = structuredClone(unsignedTx)
  // signedTxJS.vin[0].witness = witnessJS
  // const isValidJS = Signer.taproot.verify(signedTxJS, 0)
  // console.log('isValidJS', isValidJS)

  // 服务器签名 验证签名
  const sig = await signTx({
    address,
    transactionHash: hash.hex,
    chain: MEMPOOL_NETWORK === '' ? 'btc_mainnet' : 'btc_testnet',
    tweakPrivateKey: 'true'
  }).catch((error) => {
    console.error(error)
    throw 'signTx error: ' + error
  })
  console.log('--go------------------')
  console.log('signTx address:', address)
  console.log('signTx txhash.hex:', hash.hex)
  console.log('signTx sig.signedHex:', sig.signedHex)
  const witness = [sig.signedHex]

  return witness
}

export async function signedWitnessInitOnServer(unsignedTx: TxData, address: string, payAddressPubkey: string) {
  console.log('sign init tx on server...')

  // const pubkey = new PublicKey(payAddressPubkey, { type: 'taproot' })
  // const pubkey = payAddressPubkey
  const { init_tapkey, init_cblock, init_leaf, init_script } = getInitTapkey(payAddressPubkey)

  // 本地签名 验证签名
  // const privkey = 'e8df3f377dd6eb7f3c1647e5c17853698e239545e4142315249e24f68c60e5f5' //'97664508676c110ff75f3b42cb128ecd8d6fd25a6e7be5779659419b36fe8a0f'
  // const seckey = new SecretKey(privkey, { type: 'taproot' })
  // const pubkey = rawX(seckey.pub.raw)
  // console.log('--local-----------------')
  // const sigLocal = await Signer.taproot.sign(seckey.raw, unsignedTx, 0, { extension: init_leaf })
  // console.log('sigLocal', sigLocal.hex)
  // const witnessLocal = [sigLocal.hex, init_script, init_cblock]
  // const signedTxLocal = structuredClone(unsignedTx)
  // signedTxLocal.vin[0].witness = witnessLocal
  // const isValidLocal = Signer.taproot.verify(signedTxLocal, 0, { pubkey })
  // console.log('isValidLocal', isValidLocal)

  const hash = Signer.taproot.hash(unsignedTx, 0, { extension: init_leaf })
  // JS服务器签名 验证签名
  // const sigJS = await signTxJS({
  // 	tweakPrivateKey: false,
  // 	privateKey: privkey,
  // 	hash: hash.hex
  // }).catch((error) => {
  // 	console.error(error)
  // 	throw 'signTx error: ' + error
  // })
  // console.log('--js------------------')
  // console.log('sigJS', sigJS.signedHex)
  // const witnessJS = [sigJS.signedHex, inscription.script_orig, inscription.cblock]
  // const signedTxJS = structuredClone(unsignedTx)
  // signedTxJS.vin[0].witness = witnessJS
  // const isValidJS = Signer.taproot.verify(signedTxJS, 0, { pubkey })
  // console.log('isValidJS', isValidJS)
  // 服务器签名 验证签名
  const sig = await signTx({
    address,
    transactionHash: hash.hex,
    chain: MEMPOOL_NETWORK === '' ? 'btc_mainnet' : 'btc_testnet',
    tweakPrivateKey: 'false'
  }).catch((error) => {
    console.error(error)
    throw 'signTx error: ' + error
  })
  console.log('--go------------------')
  console.log('signTx address:', address)
  console.log('signTx init_leaf:', init_leaf)
  console.log('signTx init_tapkey:', init_tapkey)
  console.log('signTx txhash.hex:', hash.hex)
  console.log('signTx sig.signedHex:', sig.signedHex)
  const witness = [sig.signedHex, init_script, init_cblock]

  // const signedTx = structuredClone(unsignedTx)
  // signedTx.vin[0].witness = witness
  // const isValid = Signer.taproot.verify(signedTx, 0, { pubkey })
  // console.log('isValid', isValid)

  return witness
}

export async function signedWitnessOnServer(unsignedTx: TxData, address: string, inscription: Inscription) {
  console.log('sign tx on server...')
  // const { /* seckey, tapkey, leaf, cblock,  */ script: script_orig, script_orig: script } = inscription
  // const keyInfo = await LocalKeyStore.findKeyInfoByAddress(address)
  // if (!keyInfo) throw 'signedWitness() error, no key info found for ' + address
  // const { privkey } = keyInfo
  // const keyInfo = await getPrivateInfo(address)
  // const { privateKey: privkey } = keyInfo

  // const privkey = 'e8df3f377dd6eb7f3c1647e5c17853698e239545e4142315249e24f68c60e5f5' //'97664508676c110ff75f3b42cb128ecd8d6fd25a6e7be5779659419b36fe8a0f'
  // const seckey = new SecretKey(privkey, { type: 'taproot' })
  // const pubkey = seckey.pub
  // console.log('privkey:', privkey)
  // console.log('pubkey local:', pubkey.hex)

  // 本地签名 验证签名
  // console.log('--local-----------------')
  // const sigLocal = await Signer.taproot.sign(seckey.raw, unsignedTx, 0, { extension: inscription.leaf })
  // console.log('sigLocal', sigLocal.hex)
  // const witnessLocal = [sigLocal.hex, inscription.script_orig, inscription.cblock]
  // const signedTxLocal = structuredClone(unsignedTx)
  // signedTxLocal.vin[0].witness = witnessLocal
  // const isValidLocal = Signer.taproot.verify(signedTxLocal, 0, { pubkey })
  // console.log('isValidLocal', isValidLocal)

  const hash = Signer.taproot.hash(unsignedTx, 0, { extension: inscription.leaf })
  // JS服务器签名 验证签名
  // const sigJS = await signTxJS({
  // 	tweakPrivateKey: false,
  // 	privateKey: privkey,
  // 	hash: hash.hex
  // }).catch((error) => {
  // 	console.error(error)
  // 	throw 'signTx error: ' + error
  // })
  // console.log('--js------------------')
  // console.log('sigJS', sigJS.signedHex)
  // const witnessJS = [sigJS.signedHex, inscription.script_orig, inscription.cblock]
  // const signedTxJS = structuredClone(unsignedTx)
  // signedTxJS.vin[0].witness = witnessJS
  // const isValidJS = Signer.taproot.verify(signedTxJS, 0, { pubkey })
  // console.log('isValidJS', isValidJS)
  // 服务器签名 验证签名
  const sig = await signTx({
    address,
    transactionHash: hash.hex,
    chain: MEMPOOL_NETWORK === '' ? 'btc_mainnet' : 'btc_testnet',
    tweakPrivateKey: 'false'
  }).catch((error) => {
    console.error(error)
    throw 'signTx error: ' + error
  })
  console.log('--go------------------')
  console.log('signTx address:', address)
  console.log('signTx leaf:', inscription.leaf)
  console.log('signTx txhash.hex:', hash.hex)
  console.log('signTx sig.signedHex:', sig.signedHex)
  const witness = [sig.signedHex, inscription.script_orig, inscription.cblock]

  // const signedTx = structuredClone(unsignedTx)
  // signedTx.vin[0].witness = witness
  // const isValid = Signer.taproot.verify(signedTx, 0, { pubkey })
  // console.log('isValid', isValid)

  return witness
}

export async function createTempP2TRAddress() {
  const privkey = bytesToHex(secp.utils.randomPrivateKey())
  console.log('privkey', privkey)
  // const privkey = '1abeb60666683a3db796b5d64afa229d16025b2cf512573129ddfa87d4847c36'
  // const seckey = new KeyPair(privkey)
  // const pubkey = rawX(seckey.pub.raw)
  const seckey = new SecretKey(privkey, { type: 'taproot' })
  const pubkey = seckey.pub
  // For key-spends, we need to tweak both the secret key and public key.
  const [tseckey] = Tap.getSecKey(seckey)
  const [tpubkey] = Tap.getPubKey(pubkey)

  // Our taproot address is the encoded version of our public tapkey.
  const address = Address.p2tr.encode(tpubkey, encodedAddressPrefix)
  LocalKeyStore.writeKeyInfo({ address, privkey })
  return address
}
export function createScript(file: IFile, pubkey: PublicKey) {
  // const ec = new TextEncoder()
  // const marker   = hexToBytes('ord')
  // const mimetype = ec.encode(file.mimetype)
  const marker = Buff.encode('ord')
  // const data = Buff.encode(file.text)
  const data = hexToBytes(file.hex)
  const mimetype = Buff.encode(file.mimetype)

  // console.log('Buff.encode(file.text) ', data)
  // console.log('hexToBytes(file.hex) ', hexToBytes(file.hex))

  const script_backup = [
    '0x' + buf2hex(pubkey.buffer),
    'OP_CHECKSIG',
    'OP_0',
    'OP_IF',
    '0x' + buf2hex(marker),
    '01',
    '0x' + buf2hex(mimetype),
    'OP_0',
    '0x' + buf2hex(data),
    'OP_ENDIF'
  ]

  const script = [pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', data, 'OP_ENDIF']
  return [script, script_backup]
}

export async function createTempFundingAddress(file: IFile) {
  console.log('createTempFundingAddress')
  console.log('file', file)
  const privkey = bytesToHex(secp.utils.randomPrivateKey())
  // const privkey = '1abeb60666683a3db796b5d64afa229d16025b2cf512573129ddfa87d4847c36'
  const seckey = new SecretKey(privkey, { type: 'taproot' })
  const pubkey = seckey.pub

  // const script = [pubkey, 'OP_CHECKSIG']
  const [script] = createScript(file, pubkey)

  // const script_backup = ['0x' + buf2hex(pubkey.buffer), 'OP_CHECKSIG']

  const leaf = Tap.tree.getLeaf(Script.encode(script))
  const [tapkey, cblock] = Tap.getPubKey(pubkey, { target: leaf })
  const fundingAddress = Address.p2tr.encode(tapkey, encodedAddressPrefix)

  console.log('privkey', privkey)
  console.log('pubkey', pubkey.hex)
  console.log('script', script)
  console.log('leaf', leaf)
  console.log('tapkey', tapkey)
  console.log('cblock', cblock)
  console.log('fundingAddress', fundingAddress)
  // localKeyStore.set(fundingAddress, { privkey, seckey, pubkey, script, leaf, tapkey, cblock })
  LocalKeyStore.writeKeyInfo({ address: fundingAddress, privkey /* seckey, pubkey, script,  leaf, tapkey, cblock */ })
  return [fundingAddress, pubkey.hex]
}

export function createInscription(
  file: IFile,
  feeRate: number,
  toAddress: string,
  payAddress: string,
  payAddressPubkey: string
): Inscription {
  console.log('start createInscription')

  const pubkey = new PublicKey(payAddressPubkey, { type: 'taproot' })

  const [script, script_backup] = createScript(file, pubkey)

  const leaf = Tap.tree.getLeaf(Script.encode(script))

  const [tapkey, cblock] = Tap.getPubKey(pubkey, { target: leaf })

  const inscriptionAddress = Address.p2tr.encode(tapkey, encodedAddressPrefix)

  const isBin = !!file.sha256
  const dummyTx = createDummyTx('inscribe', { inscription: { tapkey, cblock, toAddress, script_orig: script } })
  const txsize = dummyTx ? Tx.util.getTxSize(dummyTx).vsize : getTxSize(feeRate, file.size, isBin)
  console.log('txsize:', txsize)

  const fee = feeRate * txsize

  const inscription: Inscription = {
    leaf,
    tapkey,
    cblock,
    inscriptionAddress,
    txsize,
    fee,
    script: script_backup,
    script_orig: script,
    toAddress,
    pubkey,
    fileId: file.id
  }
  return inscription
}

export function createInscriptions(order: IOrder) {
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

  // console.log('inscriptions', inscriptions)
  if (inscriptions.length !== files.length) throw 'createInscription failed: inscriptions.length !== files.length'
  return inscriptions
}

export async function inscribe(inscription: Inscription, txinfo: TxInfo) {
  // we are running into an issue with 25 child transactions for unconfirmed parents.
  // so once the limit is reached, we wait for the parent tx to confirm.
  let include_mempool = ENABLE_CPFP
  const [loop, loopId] = loopTilAddressReceivesMoney(inscription.inscriptionAddress, include_mempool, 3)
  await loop
  await waitSomeSeconds(2)
  // ! txinfo 查询算法有问题，改成根据initTx的计算传入txinfo
  // const txinfo2 = await addressReceivedMoneyInThisTx(inscription.inscriptionAddress)
  const txinfo2 = txinfo
  console.log('txinfo2', txinfo2)
  const txid2 = txinfo2.txid
  const amt2 = txinfo2.amt
  const vout = txinfo2.vout

  const redeemtx = Tx.create({
    vin: [
      {
        txid: txid2,
        vout: vout,
        prevout: {
          value: amt2,
          scriptPubKey: ['OP_1', inscription.tapkey]
        }
      }
    ],
    vout: [
      {
        value: amt2 - inscription.fee,
        scriptPubKey: Address.toScriptPubKey(inscription.toAddress)
        // scriptPubKey: ['OP_1', Address.decode(inscription.toAddress).data.hex]
        // scriptPubKey: ['OP_1', Address.p2tr.decode(inscription.toAddress).hex]
      }
    ]
  })

  // TODO: inscription.inscriptionAddress 要改用payAddress，因为可能不一致
  const witness = await signedWitness(redeemtx, inscription.inscriptionAddress, inscription)
  redeemtx.vin[0].witness = witness
  // const sig = await Signer.taproot.sign(inscription.seckey.raw, redeemtx, 0, { extension: inscription.leaf })
  // redeemtx.vin[0].witness = [sig.hex, inscription.script_orig, inscription.cblock]

  console.dir(redeemtx, { depth: null })

  const rawtx2 = Tx.encode(redeemtx).hex
  // let _txid2

  // since we don't know any mempool space api rate limits, we will be careful with spamming
  await isPushing() // 确保没有其他push正在进行中
  pushing = true
  const _txid2 = await pushBTCpmt(rawtx2)
  await sleep(1000)
  pushing = false
  console.log('inscribe tx', vout, _txid2)
  if (_txid2.includes('descendant')) {
    include_mempool = false
    inscribe(inscription, txinfo2)
    // $('#descendants-warning').style.display = 'inline-block'
    return
  }

  try {
    JSON.parse(_txid2)

    // 出错了
    // let html = `<p style="background-color: white; color: black;">Error: ${_txid2}</p>`
    // html += '<hr/>'
    // $('.modal').innerHTML += html
  } catch (e) {
    // 成功了
    // let html = `<p style="background-color: white; color: black;">Inscription #${vout} transaction:</p><p style="word-wrap: break-word;"><a href="https://mempool.space/${mempoolNetwork}tx/${_txid2}" target="_blank">https://mempool.space/${mempoolNetwork}tx/${_txid2}</a></p>`
    // html += `<p style="background-color: white; color: black;">Ordinals explorer (after tx confirmation):</p><p style="word-wrap: break-word;"><a href="https://ordinals.com/inscription/${_txid2}i0" target="_blank">https://ordinals.com/inscription/${_txid2}i0</a></p>`
    // html += '<hr/>'
    // $('.modal-content').innerHTML += html
  }

  // $('.modal').style.display = 'block'
  // $('.black-bg').style.display = 'block'

  return {
    idx: vout,
    txid: _txid2,
    transaction: `https://mempool.space/${MEMPOOL_NETWORK}/tx/${_txid2}`,
    ordinal: 'https://ordinals.com/inscription/${_txid2}i0'
  }
}