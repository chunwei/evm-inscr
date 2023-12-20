import { Address, InputType, Transaction, Tx
/*  , Script, Signer, Tap,  Tx, TxData */
} from '@cmdcode/tapscript';
import { BASEURL_BLOCKSTREAM, BASEURL_MEMPOOL, DEFAULT_PADDING_546, // ENABLE_CPFP,
FEE_BY_SIZE_RATE, MEMPOOL_NETWORK, getEncodedAddressPrefix, mempoolNetwork } from '@config/btc-config';
import { CalcFeesParams, IOrder } from '@types';
import { Buffer } from 'buffer';



import { createInscriptions } from './inscription-server';


const encodedAddressPrefix = getEncodedAddressPrefix()

/** 检测是否能连上Mempool.space
 * https://mempool.space/docs/api/rest#get-address
 */
async function probeAddress(address: string) {
  const url = 'https://mempool.space/' + mempoolNetwork + 'api/address/' + address
  try {
    const res = await fetch(url)
    const json = await res.json()
    if (json) return true
  } catch (error) {
    console.warn(
      'Could not establish a connection to Mempool.space. Most likely you got rate limited. Please wait a few minutes before you try inscribing.'
    )
    console.warn('probeAddress', error)
    return false
  }
  return false
}

export function arrayBufferToBuffer(ab: ArrayBuffer) {
  const buffer = Buffer.alloc(ab.byteLength)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i]
  }
  return buffer
}

export function hexString(buffer: ArrayBufferLike) {
  const byteArray = new Uint8Array(buffer)
  const hexCodes = [...byteArray].map((value) => {
    return value.toString(16).padStart(2, '0')
  })

  return '0x' + hexCodes.join('')
}

export async function fileToArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error occurred while reading file.'))
    }

    reader.readAsArrayBuffer(file)
  })
}

export async function bufferToSha256(buffer: BufferSource) {
  return crypto.subtle.digest('SHA-256', buffer)
}

export async function fileToSha256Hex(file: File) {
  const buffer = await fileToArrayBuffer(file)
  const hash = await bufferToSha256(arrayBufferToBuffer(buffer))
  return hexString(hash)
}

export function encodeBase64(file: File) {
  return new Promise(function (resolve, reject) {
    const imgReader = new FileReader()
    imgReader.onloadend = function () {
      resolve(imgReader.result?.toString())
    }
    imgReader.readAsDataURL(file)
  })
}

export function base64ToHex(str: string) {
  // const raw = atob(str)
  const raw = Buffer.from(str, 'base64').toString('binary')
  let result = ''
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16)
    result += hex.length === 2 ? hex : '0' + hex
  }
  return result.toLowerCase()
}

export function buf2hex(buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export function hexToBytes(hex: string) {
  const matches = hex.match(/.{1,2}/g)
  if (matches) {
    return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)))
  } else {
    // 处理空值情况
    return new Uint8Array(0) // 返回空的 Uint8Array
  }
  // return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
}

export function bytesToHex(bytes: Uint8Array) {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
}

// function textToHex(text: string) {
// 	var encoder = new TextEncoder().encode(text)
// 	return [...new Uint8Array(encoder)].map((x) => x.toString(16).padStart(2, '0')).join('')
// }
export function textToHex(text: string): string {
  return Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function isValidTaprootAddress(address: string) {
  try {
    Address.p2tr.decode(address).hex
    return true
  } catch (e) {
    console.log(e)
    return false
  }
  return false
}

export function isValidJson(content?: string) {
  if (!content) return
  try {
    JSON.parse(content)
  } catch (e) {
    return
  }
  return true
}

export function satsToBitcoin(sats: number) {
  if (sats >= 100000000) sats = sats * 10
  let string = String(sats).padStart(8, '0').slice(0, -9) + '.' + String(sats).padStart(8, '0').slice(-9)
  if (string.substring(0, 1) == '.') string = '0' + string
  return string
}

export async function satsToDollars(sats: number) {
  if (sats >= 100000000) sats = sats * 10
  const bitcoin_price = sessionStorage['bitcoin_price']
  const value_in_dollars =
    Number(String(sats).padStart(8, '0').slice(0, -9) + '.' + String(sats).padStart(8, '0').slice(-9)) * bitcoin_price
  return value_in_dollars
}
/**
 * 生成dummy交易，用于精确计算vSize进而计算gasFee
 * @param txType
 * @param params
 * @returns
 */
export function createDummyTx(txType: 'refund' | 'init' | 'inscribe', params: Record<string, any>) {
  // 32字节交易hash
  const txid = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  // 4字节 output index
  const vout = 0
  // 长度固定8字节，
  const value = 10000
  // 64字节
  const signHex =
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  let txdata
  switch (txType) {
    // case 'init':
    //  TOOD:
    //   break
    case 'refund':
      txdata = Tx.create({
        vin: [
          {
            txid,
            vout,
            prevout: {
              value,
              scriptPubKey: ['OP_1', Address.decode(params.pay_address).data.hex]
            },
            witness: [signHex]
          }
        ],
        vout: [
          {
            value,
            scriptPubKey: Address.toScriptPubKey(params.refund_address)
          }
        ]
      })
      break
    case 'inscribe':
      txdata = Tx.create({
        vin: [
          {
            txid,
            vout,
            prevout: {
              value,
              scriptPubKey: ['OP_1', params.inscription.tapkey]
            },
            witness: [signHex, params.inscription.script_orig, params.inscription.cblock]
          }
        ],
        vout: [
          {
            value,
            scriptPubKey: Address.toScriptPubKey(params.inscription.toAddress)
          }
        ]
      })
      break
  }
  return txdata
}

// export function getTxSizeFromDummy(feeRate: number, byteLength: number, isBin: boolean) {
//   Tx.util.getTxSize(txdata)
//   return txsize
// }

export function getTxSize(feeRate: number, byteLength: number, isBin: boolean) {
  let prefix = 137.5
  if (isBin) {
    prefix = feeRate > 1 ? 546 : 700
  }

  const txsize = Math.ceil(prefix + byteLength / 2)

  console.log('TXSIZE(vB):' + txsize, 'byteLength:' + byteLength, 'prefix:' + prefix)
  return txsize
}

export function getTxSizex(feeRate: number, byteLength: number, isBin: boolean) {
  let prefix = 160
  if (isBin) {
    prefix = feeRate > 1 ? 546 : 700
  }

  const txsize = Math.ceil(prefix + byteLength / 4)

  console.log('TXSIZE(vB)', txsize)
  return txsize
}

export function getOutputBytes(addressType: InputType) {
  const baseBytes = 8 // 8bytes(value)
  switch (addressType) {
    case 'p2pkh':
      return baseBytes + 26
    case 'p2sh':
      return baseBytes + 24
    case 'p2w-pkh':
      return baseBytes + 23
    case 'p2tr':
      return baseBytes + 35
    default:
      throw Error(`unsupported addressType: ${addressType}`)
  }
}

/** 计算各项费用 */
export function calcFees(feeRate: number, padding: number = DEFAULT_PADDING_546, files: any[]) {
  const base_size = 160

  /** fixed */
  const serviceFee = 1999 // to service provider
  /**
   * networkFee = Math.ceil( (fileSize/4 +175 * fileCount)*feeRate )
   * */
  let networkFee = 0 // to miner
  let feeBySize = 0

  for (let i = 0; i < files.length; i++) {
    const isBin = !!files[i].sha256
    const hex = files[i].hex
    const bytes = hexToBytes(hex)

    const txSize = getTxSize(feeRate, bytes.length, isBin)
    const fee = feeRate * txSize
    networkFee += fee
  }

  // we are covering 2 times the same outputs, once for seeder, once for the inscribers
  let total_fees =
    networkFee + (69 + (files.length + 1) * 2 * 31 + 10) * feeRate + base_size * files.length + padding * files.length

  total_fees += 50 * feeRate + serviceFee

  feeBySize = Math.ceil((FEE_BY_SIZE_RATE * networkFee) / 100)

  return {
    serviceFee,
    networkFee,
    feeBySize,
    totalFee: total_fees,
    nw01: networkFee + 175 * feeRate,
    nw0: networkFee + (69 + (files.length + 1) * 1 * 31 + 10) * feeRate,
    nw1: networkFee + (69 + (files.length + 1) * 2 * 31 + 10) * feeRate,
    nw2: networkFee + base_size * files.length,
    nw21: networkFee + base_size * files.length + 50 * feeRate,
    nw3: networkFee + (69 + (files.length + 1) * 2 * 31 + 10) * feeRate + base_size * files.length
  }
}
/** unisat fees算法 */
export function calcFees_as_unisat(e: CalcFeesParams) {
  const serviceFeePerFile_default = MEMPOOL_NETWORK === 'testnet' ? 600 : 1999
  // fileSize 是所有文件大小的总和, sizePerFile*Count
  const { fileSize, mintRate, fileCount, inscriptionBalance, serviceFeePerFile: _serviceFeePerFile, discountRate } = e
  const serviceFeePerFile = typeof _serviceFeePerFile === 'undefined' ? serviceFeePerFile_default : _serviceFeePerFile
  const discount = 0, // discountRate.unisatFeeCutPercent + discountRate.ogPassFeeCutPercent,
    // to inscription recipient
    padding = inscriptionBalance * fileCount,
    // to miner
    networkFee = Math.ceil((fileSize / 2 + 181 * fileCount) * mintRate),
    // to service provider
    serviceFee = serviceFeePerFile * fileCount,
    feeBySize = Math.ceil(0.0499 * networkFee),
    discountedFee = Math.floor((serviceFee + feeBySize) * (1 - discount / 100)),
    // totalFee
    totalFee = padding + networkFee + discountedFee,
    // Any amount less than 1000 in the total sum is rounded down to zero.
    amount = 1e3 * Math.floor((padding + networkFee + discountedFee) / 1e3)
  return {
    networkFee,
    serviceFee,
    feeBySize,
    discountedFee,
    totalFee,
    amount
  }
}

/** unisat fees算法 */
export function calcFees_launchpad(order: IOrder) {
  const serviceFeePerFile_default = MEMPOOL_NETWORK === 'testnet' ? 600 : 1999
  const params = {
    fileSize: order.files.reduce((sum, cur) => sum + cur.size, 0),
    mintRate: order.feeRate,
    fileCount: order.files.length,
    inscriptionBalance: order.inscriptionBalance,
    serviceFeePerFile: serviceFeePerFile_default
  }
  // fileSize 是所有文件大小的总和, sizePerFile*Count
  const { fileSize, mintRate, fileCount, inscriptionBalance, serviceFeePerFile } = params
  const discount = 0 // discountRate.unisatFeeCutPercent + discountRate.ogPassFeeCutPercent,
  // to inscription recipient
  const padding = inscriptionBalance * fileCount
  // to miner  , fileCount+1 其中+1是第一笔分账
  // input:68, output = getOutputBytes(addressType),output取最大43来估算（p2tr类型）
  // vin：1个, vout：n个inscription + 1 service + 1 refund
  const initNetworkFee = (68 + 43 * (fileCount + 2)) * mintRate
  const inscriptions = createInscriptions(order)
  const inscribeNetworkFee = inscriptions.reduce((sum, cur) => sum + cur.fee, 0)
  // const inscribeNetworkFee = Math.ceil((fileSize / 2 + 181 * fileCount) * mintRate)
  const networkFee = initNetworkFee + inscribeNetworkFee
  // const networkFee = Math.ceil((fileSize / 2 + 181 * (fileCount + 1)) * mintRate)
  // to service provider
  // const serviceFee = serviceFeePerFile * fileCount
  const serviceFee = order.files.reduce((sum, cur) => sum + (cur.price ?? serviceFeePerFile), 0)
  const feeBySize = 0 // Math.ceil(0.0499 * networkFee)
  const discountedFee = Math.floor((serviceFee + feeBySize) * (1 - discount / 100))
  // totalFee
  const totalFee = padding + networkFee + discountedFee
  // Any amount less than 1000 in the total sum is rounded down to zero.
  const amount = 1e3 * Math.floor(totalFee / 1e3)

  return {
    initNetworkFee,
    inscribeNetworkFee,
    networkFee,
    serviceFee,
    feeBySize,
    discountedFee,
    totalFee,
    amount
  }
}

///////////////////////////////////////////////////////////

async function getData(url: string) {
  const res = await fetch(url)
  return await res.text()
}

async function postData(url: string, data: BodyInit | null, contextType = 'application/json', apiKey = '') {
  const headers: HeadersInit = { 'Content-Type': contextType }
  if (apiKey) headers['X-Api-Key'] = apiKey
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: data
  })
  return await res.text()
}

async function addressOnceHadMoney(address: string, includeMempool: boolean) {
  let url
  let nonjson = ''

  try {
    url = BASEURL_MEMPOOL + '/api/address/' + address
    nonjson = await getData(url)
    const lowerCaseText = nonjson.toLowerCase()
    if (
      lowerCaseText.includes('rpc error') ||
      lowerCaseText.includes('too many requests') ||
      lowerCaseText.includes('bad request')
    ) {
      if (encodedAddressPrefix == 'main') {
        url = BASEURL_BLOCKSTREAM + '/api/address/' + address
        nonjson = await getData(url)
      }
    }
  } catch (e) {
    if (encodedAddressPrefix == 'main') {
      url = BASEURL_BLOCKSTREAM + '/api/address/' + address
      nonjson = await getData(url)
    }
  }

  if (!isValidJson(nonjson)) return false
  const json = JSON.parse(nonjson)
  if (json['chain_stats']['tx_count'] > 0 || (includeMempool && json['mempool_stats']['tx_count'] > 0)) {
    return true
  }
  return false
}

export async function addressReceivedMoneyInThisTx(address: string) {
  let txid = ''
  let vout = 0
  let amt = 0
  let refund_address = '' // 改交易的付款地址，用于退回多付金额
  let nonjson = ''

  try {
    nonjson = await getData(BASEURL_MEMPOOL + '/api/address/' + address + '/txs')

    const lowerCaseText = nonjson.toLowerCase()
    if (
      lowerCaseText.includes('rpc error') ||
      lowerCaseText.includes('too many requests') ||
      lowerCaseText.includes('bad request')
    ) {
      if (encodedAddressPrefix == 'main') {
        nonjson = await getData(BASEURL_BLOCKSTREAM + '/api/address/' + address + '/txs')
      }
    }
  } catch (e) {
    if (encodedAddressPrefix == 'main') {
      nonjson = await getData(BASEURL_BLOCKSTREAM + '/api/address/' + address + '/txs')
    }
  }

  const json = JSON.parse(nonjson)
  // 这里是不是有问题，循环后取的是最早的那批交易
  json.forEach(function (tx: Transaction) {
    tx['vout'].forEach(function (output: any, index: number) {
      if (output['scriptpubkey_address'] === address) {
        txid = tx['txid']
        vout = index
        amt = output['value']
        const prevout = tx.vin[0].prevout as any
        refund_address = prevout['scriptpubkey_address']
      }
    })
  })

  return { txid, vout, amt }
}

export function loopTilAddressReceivesMoney(address: string, includeMempool: boolean, maxRetry?: number) {
  let itReceivedMoney = false
  let retryCount = 1
  let interval: any = null
  const MAX_RETRY = maxRetry === undefined ? Number.MAX_SAFE_INTEGER : maxRetry
  const p = new Promise((resolve) => {
    interval = setInterval(async () => {
      console.log('waiting for address to receive money...', 'retry', retryCount)
      try {
        itReceivedMoney = await addressOnceHadMoney(address, includeMempool)
        retryCount++
      } catch (e) {
        console.log('something went wrong : addressOnceHadMoney', e)
      }
      if (itReceivedMoney || retryCount > MAX_RETRY) {
        console.log(itReceivedMoney ? 'received' : 'reach max retry', ', stop checking mempool for receiving money ')
        if (interval) clearInterval(interval)
        resolve(itReceivedMoney)
      }
    }, 5000)
  })
  return [p, interval]
}

export function waitSomeSeconds(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

export async function pushBTCpmt(rawtx: string) {
  let txid = ''

  try {
    txid = await postData(BASEURL_MEMPOOL + '/api/tx', rawtx)
    const txidLC = txid.toLowerCase()
    if (
      (txidLC.includes('rpc error') || txidLC.includes('too many requests') || txidLC.includes('bad request')) &&
      !txid.includes('descendant')
    ) {
      if (encodedAddressPrefix == 'main') {
        console.log('USING BLOCKSTREAM FOR PUSHING INSTEAD')
        txid = await postData(BASEURL_BLOCKSTREAM + '/api/tx', rawtx)
      }
    }
  } catch (e) {
    if (encodedAddressPrefix == 'main') {
      console.log('USING BLOCKSTREAM FOR PUSHING INSTEAD')
      txid = await postData(BASEURL_BLOCKSTREAM + '/api/tx', rawtx)
    }
  }

  return txid
}