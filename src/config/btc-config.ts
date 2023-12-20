// main: 'main', signet/testnet: 'tb'
// export const encodedAddressPrefix = 'main'
import { Network } from '@types';



import { ORDERSERVER_APIKEY, ORDERSERVER_APISECRET, ORDERSERVER_HOST, TARGET_NETWORK, getBTCServer } from './btc-server';


export { getBTCServer, ORDERSERVER_HOST,ORDERSERVER_APIKEY,ORDERSERVER_APISECRET }

// mainnet: '', 'signet/', 'testnet/'
export const mempoolNetwork = ''

export type MEMPOOL_NETWORK_TYPE = string // '' | 'testnet' | 'signet'
// 具体的api路径统一从 / 开始
// mainnet: '', signet: 'signet', testnet: 'testnet'
export const MEMPOOL_NETWORK: MEMPOOL_NETWORK_TYPE = TARGET_NETWORK === 'mainnet' ? '' : TARGET_NETWORK // 'testnet'
console.log('TARGET_NETWORK', TARGET_NETWORK)
console.log('MEMPOOL_NETWORK', MEMPOOL_NETWORK)
// main: 'main', signet/testnet: 'tb'
export function getEncodedAddressPrefix(): Network {
  let prefix: Network = 'main'
  switch (MEMPOOL_NETWORK as MEMPOOL_NETWORK_TYPE) {
    case 'testnet':
      prefix = 'testnet'
      break
    case 'signet':
      prefix = 'signet'
      break
  }
  return prefix
}

// CPFP（child-pays-for-parent）
// CPFP 的想法是接收方有一笔交易尚未在他想要花费的区块中得到确认。
// 因此，他将未确认的交易包含在新交易中，并支付足够高的费用以鼓励矿工将原始（父）交易和新（子）交易包含在一个区块中。
export const ENABLE_CPFP = true

/**
 * INSCRIPTIONS
 */

// default padding as of ord native walexport const
export const DEFAULT_PADDING = 10000
export const DEFAULT_PADDING_546 = 546

// % percent value , fee by size =  FEE_BY_SIZE_RATE / 100 * networkFee
export const FEE_BY_SIZE_RATE = 4.99

// signet
//export const tippingAddress = 'tb1pkjs7aww5m2muw5jpfxfrs4849dyjtp7camnqymlxt5mwmzy440xqe864rg';

// main
export const ServiceFeeAddress = 'bc1pxphap28969fy2k8t3a6d9zm5g57tx4ahrl5flcdnlnaj7m5ew94qrcs072'
// testnet
export const ServiceFeeAddress_testnet = 'tb1p3tus3zvg5srgdjmmfjp2awgvl80fx4qk9gertkr4ryjyav63fexs8qklqx'
export function getServiceFeeAddress(network: string = MEMPOOL_NETWORK) {
  return network === 'testnet' ? ServiceFeeAddress_testnet : ServiceFeeAddress
}

// base urls
// mempool.space
export const BASEURL_MEMPOOL = 'https://mempool.space' + (MEMPOOL_NETWORK ? '/' + MEMPOOL_NETWORK : '')
console.log('BASEURL_MEMPOOL', BASEURL_MEMPOOL)
// blockstream.info
export const BASEURL_BLOCKSTREAM = 'https://blockstream.info'

export const LOCALSTORAGE_KEYS = {
  orders: 'element_inscribe_orders',
  inscription: 'element_inscription_',
  btc_wallet: 'element_btc_wallet_'
}

export const USE_ORDERSERVER = true

// 内网地址
// test
export const ADDRESSSERVER_HOST_LAN_TESTNET = 'http://btc-addr-srv-s0.element.lan'
// main
export const ADDRESSSERVER_HOST_LAN_MAINNET = 'http://btc-addr-srv-s1.element.lan'
export const ADDRESSSERVER_HOST_LAN = MEMPOOL_NETWORK === 'testnet' ? ADDRESSSERVER_HOST_LAN_TESTNET : ADDRESSSERVER_HOST_LAN_MAINNET

// 只有公司ip能访问
export const ADDRESSSERVER_HOST_DEV = 'https://api-dev-test.element.market'

export const ADDRESSSERVER_HOST =
  process.env.NODE_ENV === 'development' ? ADDRESSSERVER_HOST_DEV : ADDRESSSERVER_HOST_LAN

// 汇率服务器
  export const QUOTEERVER_HOST_MAINNET = 'https://api.element.market'

export const QUOTEERVER_HOST_TESTNET = 'https://api-test2.element.market'

export const QUOTEERVER_HOST = MEMPOOL_NETWORK === 'testnet' ? QUOTEERVER_HOST_TESTNET : QUOTEERVER_HOST_MAINNET