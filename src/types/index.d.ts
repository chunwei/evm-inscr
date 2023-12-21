export type User = {
  id: number
  name: string
  email: string
}

export type Network = 'main' | 'testnet' | 'signet' | 'regtest'

export interface FeeLevel {
  level: string //'Economy'｜'Normal'｜'Custom'
  feeRate: number // 费率
  estimate?: number // 预估时间
  est?: string // 预估时间文字说明
}

export type RecommendedFeeRates = {
  economyFee: number
  fastestFee: number
  halfHourFee: number
  hourFee: number
  minimumFee: number
}

export interface IFile {
  name: string
  text: string
  hex: string
  size: number
  mimetype: string
  sha256?: string
  id?: string
  price?: number // service fee of this file, unit sats
}
export interface Inscription {
  leaf: any
  tapkey: any
  cblock: any
  inscriptionAddress: string
  txsize: number
  fee: number
  script: any[]
  script_orig: any[]
  toAddress: string
  pubkey: any
  fileId?: string
}
export interface IFees {
  networkFee: number
  serviceFee: number
  feeBySize: number
  discountedFee: number
  totalFee: number
  amount: number
}

export interface CreateOrderParams {
  files: IFile[]
  feeRate: number
  inscriptionBalance?: number
  receiveAddress: string
  fees: IFees
}
export interface CreateTransactionsParams extends IOrder {
  payTxInfo: TxInfo[]
}

export interface SignTxParams extends Record<string, string> {
  address: string
  transactionHash: string
  chain: /*  string */ 'btc_mainnet' | 'btc_testnet'
  tweakPrivateKey: /* string */ 'true' | 'false'
}

export interface SignTxJSParams {
  privateKey: string
  hash: string
  tweakPrivateKey: boolean
}

export interface IOrder {
  orderId: string
  status: string
  payAddressPubkey: string
  payAddress: string
  receiveAddress: string
  serviceFeeAddress?: string
  inscriptionBalance: number
  createTimestamp: number
  isPaidOffchain: boolean
  feeRate: number
  minerFee: number
  serviceFee: number
  files: IFile[]
  amount: number
  count: number
  minted: number
  mintCount?: number
  payTxInfo?: TxInfo[]
  psbtParam?: { psbtBase64: string; signingIndexes: number[] }
}

export interface KeyInfo {
  address: string
  privkey: string
  // seckey: SecretKey
  // pubkey: Uint8Array
  // script: ScriptData
  // leaf: string
  // tapkey: string
  // cblock: string
}

export interface TxInfo {
  txid: string
  amt: number
  vout: number
  refund_address?: string
}
export interface RefundTxParams extends TxInfo {
  refund_address: string
  pay_address: string
  feeRate: number
}

export interface OrderTxs {
  orderId: string
  txs: { fileId: string; txHex: string; txid: string }[]
}

export interface InscriptionRes {
  inscrNo: number
  blockNumber: number
  mintTxHash: string
  contentType: string
  owner: string
  lastTxHash: string
  lastTxOut: number
  lastSatIndex: number
  timestamp: number
  memPoolSats: any[]
}

export interface UTXO {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
  value: number
}

export interface IBalance {
  confirmed: number
  unconfirmed: number
  total: number
}

export interface CalcFeesParams {
  fileSize: number // 所有文件总大小
  mintRate: number
  fileCount: number
  inscriptionBalance: number
  serviceFeePerFile?: number
  discountRate?: number
}

export interface SignPsbtHexParams {
  psbtBase64: string
  signingIndexes: number[]
  signAddress: string
  sigHash?: number
  broadcast?: boolean
}
