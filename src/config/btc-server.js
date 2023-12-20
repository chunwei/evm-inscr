const TARGET_NETWORK = process.env.NEXT_PUBLIC_TARGET_NETWORK ?? 'testnet'

// BTC SERVERS
// 正式链外网地址： http://8.210.4.168:8083/swagger-ui/index.html
// 正式链内网地址： http://172.16.10.39:8083/swagger-ui/index.html
// 测试链外网地址：http://47.242.238.108:8083/swagger-ui/index.html
// 测试链内网地址：http://172.16.10.40:8083/swagger-ui/index.html
const BTC_SERVER_HOST_MAINNET_PUB = 'http://8.210.4.168:8083'
const BTC_SERVER_HOST_MAINNET_LAN = 'http://172.16.10.39:8083'
const BTC_SERVER_HOST_TESTNET_PUB = 'http://47.242.238.108:8083'
const BTC_SERVER_HOST_TESTNET_LAN = 'http://172.16.10.40:8083'

const isDev = process.env.NODE_ENV === 'development'
function getBTCServer(network = TARGET_NETWORK) {
  const isTestnet = network === 'testnet'
  if (isTestnet) {
    return isDev ? BTC_SERVER_HOST_TESTNET_PUB : BTC_SERVER_HOST_TESTNET_LAN
  } else {
    return isDev ? BTC_SERVER_HOST_MAINNET_PUB : BTC_SERVER_HOST_MAINNET_LAN
  }
}

const ORDERSERVER_HOST_TESTNET = isDev
  ? 'https://api-test.element.market'
  : 'http://172.16.10.157:8082' //
const ORDERSERVER_HOST_MAINNET = isDev
  ? 'https://api.element.market'
  : 'http://172.16.10.157:8081' //
const ORDERSERVER_HOST =
  TARGET_NETWORK === 'testnet'
    ? ORDERSERVER_HOST_TESTNET
    : ORDERSERVER_HOST_MAINNET
// console.log('ORDERSERVER_HOST', ORDERSERVER_HOST)

const ORDERSERVER_APIKEY =
  TARGET_NETWORK === 'testnet'
    ? 'ysBokbA3gKUzt61DmeHWjTFYZ07CGPQL'
    : 'zQbYj7RhC1VHIBdWU63ki5AJKXloamDT'
const ORDERSERVER_APISECRET =
  TARGET_NETWORK === 'testnet'
    ? 'a2PAJXRBChdpGvoyKEz3lLS5Yf1bM0NO'
    : 'UqCMpfGn3VyQEdsjLkzJv9tNlgbKFD7O'

// for CJS import
module.exports = {
  getBTCServer,
  TARGET_NETWORK,
  ORDERSERVER_HOST,
  ORDERSERVER_APIKEY,
  ORDERSERVER_APISECRET
}
