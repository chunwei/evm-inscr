import { ADDRESSSERVER_HOST, BASEURL_MEMPOOL, MEMPOOL_NETWORK, ORDERSERVER_APIKEY, ORDERSERVER_APISECRET, ORDERSERVER_HOST, QUOTEERVER_HOST, USE_ORDERSERVER, getBTCServer } from '@config/btc-config';
import { CreateOrderParams, IBalance, IOrder, RecommendedFeeRates, SignTxJSParams, SignTxParams, UTXO } from '@types';
import hmacSHA256 from 'crypto-js/hmac-sha256';


/**
 * 访问限制
 * 添加API签名
 * X-Api-Key appKey
 * X-Api-Sign	验证签名
 * key：独立api 不传默认 config appKeyTmp
 * secret 独立secret 不传默认 config appSecretTmp
 */
export const getAPISign = (key?: string, secret?: string): { 'X-Api-Key': string; 'X-Api-Sign': string } => {
  const AppKey = key || ORDERSERVER_APIKEY
  const AppSecret = secret || ORDERSERVER_APISECRET

  // 随机数字字母，建议4位
  const nonce = Number.parseInt((Math.random() * (9999 - 1000 + 1) + 1000).toString(), 10)
  // 当前时间戳（秒）
  const timestamp = Number.parseInt((Date.now() / 1000).toString(), 10)
  // 使用appSecret进行HMacSha256加密函数
  const hmac256 = hmacSHA256(`${AppKey}${nonce}${timestamp}`, AppSecret)

  const headers = {
    'X-Api-Key': AppKey,
    'X-Api-Sign': `${hmac256}.${nonce}.${timestamp}`
  }

  return headers
}

export async function get(url: string, headersInit: HeadersInit = {}) {
  console.log('url', url)
  // handle local dev environment
  // if (!url.startsWith('http')) url = 'http://localhost:3000' + url
  const headers = new Headers(headersInit)
  // if (!headers.has('Content-Type')) {
  //   headers.set('Content-Type', 'application/json')
  // }

  const response = await fetch(url, { method: 'GET', headers })

  if (response.status !== 200) {
    throw Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const data = await response.json()
  if (!(data.code === 200 || data.code === 0)) {
    const msg = data.msg || data.message || data.error
    throw Error(`${msg}`)
  }

  return data.data
}

export async function post(url: string, postData: any, headersInit: HeadersInit = {}) {
  const headers = new Headers(headersInit)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(postData),
    next: { revalidate: 10 }
  })

  if (response.status !== 200) {
    throw Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const data = await response.json()
  if (!(data.code === 200 || data.code === 0)) {
    const msg = data.msg || data.message || data.error
    throw Error(`${msg}`)
  }
  console.log(url)
  console.log(data)
  return data.data
}

export async function getRecommendedFeeRates() {
  const res = await fetch(BASEURL_MEMPOOL + '/api/v1/fees/recommended')
  const feeRates = (await res.json()) as RecommendedFeeRates
  return feeRates
}

export async function getUTXOsOfAddress(address: string) {
  const res = await fetch(BASEURL_MEMPOOL + `/api/address/${address}/utxo`)
  const utxos: UTXO[] = await res.json()
  return utxos
}

export async function calculateBalance(address: string): Promise<IBalance> {
  const utxos: UTXO[] = await getUTXOsOfAddress(address)

  let confirmed = 0
  let unconfirmed = 0
  let total = 0
  for (const utxo of utxos) {
    if (utxo.status.confirmed) {
      confirmed += utxo.value
    }
    if (!utxo.status.confirmed) {
      unconfirmed += utxo.value
    }
    total += utxo.value
  }

  return { confirmed, unconfirmed, total }
}

export async function _fetch(url: string, postData: any) {
  // s.auth = T
  // s.key = T + 'ai7zii7gQHJM2j8YO9'

  // ;(function (e) {
  // 	e.key += 'CY5347b1gxBcFwLVu5rJsgfVjeWuAGa'
  // 	e.timestamp = Date.now()
  // 	e.random = Math.floor(1e7 + 9e7 * Math.random()) + ''

  // 	let keys = []
  // 	for (let prop in e) {
  // 		if (e.hasOwnProperty(prop) && e[prop]) {
  // 			keys.push(prop)
  // 		}
  // 	}
  // 	keys.sort()

  // 	let str = ''
  // 	for (let i = 0; i < keys.length; i++) {
  // 		const prop = keys[i]
  // 		if (typeof e[prop] === 'string') {
  // 			str += prop + e[prop]
  // 		} else {
  // 			str += prop + JSON.stringify(e[prop])
  // 		}
  // 	}

  // 	e.sign = sha256(str)
  // 	delete e.key
  // })(s)

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(postData)
  })

  if (response.status !== 200) {
    throw Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const data = await response.json()
  if (data.code !== 200 || data.code !== 0) {
    throw Error(`${data.msg}`)
  }

  return data.data
}

export async function queryConfig() {
  if (USE_ORDERSERVER) {
    return get('/api/oapi/global/ordinal/config', getAPISign())
  } else {
    return get('/api/inscribe/config')
  }
}

// TODO: 翻页处理
export async function queryOrders(receiveAddress: string[]): Promise<IOrder[]> {
  if (USE_ORDERSERVER) {
    const data = await post('/api/oapi/order/ordinal/orderList', receiveAddress, getAPISign())
    return data.orderList ?? []
  } else {
    return get('/api/inscribe/order')
  }
}
export async function queryOrder(orderId: string) {
  if (USE_ORDERSERVER) {
    return get('/api/oapi/order/ordinal/orderDetail?orderId=' + orderId, getAPISign())
  } else {
    return get('/api/inscribe/order/' + orderId)
  }
}
export async function createOrder(orderParams: CreateOrderParams) {
  if (USE_ORDERSERVER) {
    return post('/api/oapi/order/ordinal/orderSubmit', orderParams, getAPISign())
  } else {
    return post('/api/inscribe/order', orderParams)
  }
}
export async function paymentCompleted(orderId: string) {
  if (USE_ORDERSERVER) {
    return post('/api/oapi/order/ordinal/orderPaidMark', { orderId }, getAPISign())
  } else {
    return post('/api/inscribe/paid', { orderId })
  }
}
export async function canRefund(orderId: string) {
  return post('/order/can_refund', {
    orderId
  })
}

export async function simpleRefund(orderId: string) {
  return post('/order/simple_refund', {
    orderId
  })
}

export async function signTxJS(params: SignTxJSParams) {
  const signServer = 'http://localhost:7989'
  return post(signServer + '/sign/taproot/hash', params)
}

export async function signTx(params: SignTxParams) {
  const searchParams = new URLSearchParams(params)
  return get(ADDRESSSERVER_HOST + '/v1/btc/sign/taproot-hash' + '?' + searchParams.toString())
}
interface BatchQueryQuoteParams {
  chainMId: number
  addresses: string[]
}
export async function batchQueryQuote(params?: BatchQueryQuoteParams) {
  const chainMId = MEMPOOL_NETWORK === 'testnet' ? 802 : 801
  const addresses = ['0x0000000000000000000000000000000000000000']
  return post(QUOTEERVER_HOST + '/v1/quote/batchquery', { chainMId, addresses, ...(params ?? {}) })
}

export async function getPrivateInfo(address: string, chain: 'btc-testnet' | 'btc-mainnet' = 'btc-testnet') {
  const searchParams = new URLSearchParams({ address, chain })
  return get(ADDRESSSERVER_HOST + '/v1/btc/address/query-private-info' + '?' + searchParams.toString())
}

/**
 *
 * @param insid txid+'i0'
 * @returns Inscription
 */
export async function queryInscription(insid: string) {
  const btcserver = getBTCServer()
  const url = `${btcserver}/btc/v1/inscr/queryByTokenId`
  return post(url, { tokenId: insid })
}
/**
 *
 * @param address p2tr address
 * @returns Inscriptions owned by the address
 */
export async function queryOrdinalsByAddress(address: string, limit = 50) {
  const url = `/api/btc/v1/inscr/queryByOwner`
  return post(url, { owner: address, limit })
}
/**
 *
 * @param names domains to query
 * @returns number[] array of the check results corresponding to names, 
 *          value 1: existed, 0: not existed
 */
export async function isSnsExist(names: string[]) {
  const url = `/api/btc/v1/sns/exist`
  return post(url, { names })
}

export async function queryInscriptionContent(txid: string, mimetype = 'text/plain;charset=utf-8'): Promise<string> {
  const net = MEMPOOL_NETWORK === 'testnet' ? '802' : '8'
  // /2023/05/${txid.slice(-1)}
  const url = `http://8.210.4.168:9283/inscr/${net}/${txid}?t=${mimetype}`
  const res = await fetch(url, { next: { revalidate: 10 } })
  return res.text()
}

export function getInscriptionContentUrl(txid: string): string {
  const index = 0
  // const url = `/api/btc/v1/inscr/queryInscrContent?txid=${txid}`
  const url = `/api/btc/v1/inscr/inscrContent?id=${txid}i${index}`
  return url
}