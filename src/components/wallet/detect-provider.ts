import { EventEmitter } from 'events'

/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-06 17:06:21
 * @LastEditTime: 2023-05-07 19:14:19
 * @LastEditors: Chunwei Lu
 */
export interface Interceptor {
  onRequest?: (data: any) => any
  onResponse?: (res: any, data: any) => any
}
interface StateProvider {
  accounts: string[] | null
  isConnected: boolean
  isUnlocked: boolean
  initialized: boolean
  isPermanentlyDisconnected: boolean
}
export declare class UnisatProvider extends EventEmitter {
  _selectedAddress: string | null
  _network: string | null
  _isConnected: boolean
  _initialized: boolean
  _isUnlocked: boolean
  _state: StateProvider
  private _pushEventHandlers
  private _requestPromise
  private _bcm
  constructor({ maxListeners }?: { maxListeners?: number | undefined })
  initialize: () => Promise<void>
  /**
   * Sending a message to the extension to receive will keep the service worker alive.
   */
  private keepAlive
  private _requestPromiseCheckVisibility
  private _handleBackgroundMessage
  _request: (data: any) => Promise<any>
  requestAccounts: () => Promise<any>
  getNetwork: () => Promise<any>
  switchNetwork: (network: string) => Promise<any>
  getAccounts: () => Promise<any>
  getPublicKey: () => Promise<any>
  getBalance: () => Promise<any>
  getInscriptions: (cursor?: number, size?: number) => Promise<any>
  /**
   * @param text `string`: message to sign
   * @param type `string`(optional): "ecdsa" | "bip322-simple". default is "ecdsa" */
  signMessage: (text: string, type?: string) => Promise<any>
  sendBitcoin: (
    toAddress: string,
    satoshis: number,
    options?: {
      feeRate: number
    }
  ) => Promise<any>
  sendInscription: (
    toAddress: string,
    inscriptionId: string,
    options?: {
      feeRate: number
    }
  ) => Promise<any>
  /**
   * push transaction
   */
  pushTx: (rawtx: string) => Promise<any>
  signPsbt: (psbtHex: string, options?: any) => Promise<any>
  signPsbts: (psbtHexs: string[], options?: any[]) => Promise<any>
  pushPsbt: (psbtHex: string) => Promise<any>
  inscribeTransfer: (ticker: string, amount: string) => Promise<any>
}

// interface Window {
//   unisat?: UnisatProvider;
// }

declare global {
  interface Window {
    unisat: UnisatProvider
    HiroWalletProvider: any
    StacksProvider: any
    // BitcoinProvider: any
    btc: any
  }
}

/**
 * Returns a Promise that resolves to the value of window.unisat if it is
 * set within the given timeout, or null.
 * The Promise will not reject, but an error will be thrown if invalid options
 * are provided.
 *
 * @param options - Options bag.
 * @param options.silent - Whether to silence console errors. Does not affect
 * thrown errors. Default: false
 * @param options.timeout - Milliseconds to wait for 'unisat#initialized' to
 * be dispatched. Default: 3000
 * @returns A Promise that resolves with the Provider if it is detected within
 * given timeout, otherwise null.
 */
export default function detectWalletProvider<T = UnisatProvider>({
  silent = false,
  timeout = 3000
} = {}): Promise<T | null> {
  _validateInputs()

  let handled = false

  return new Promise((resolve) => {
    if ((window as Window).unisat) {
      handleProvider()
    } else {
      window.addEventListener('unisat#initialized', handleProvider, {
        once: true
      })

      setTimeout(() => {
        handleProvider()
      }, timeout)
    }

    function handleProvider() {
      if (handled) {
        return
      }
      handled = true

      window.removeEventListener('unisat#initialized', handleProvider)

      const { unisat } = window as Window

      if (unisat) {
        resolve(unisat as unknown as T)
      } else {
        const message = 'Unable to detect window.unisat.'

        !silent && console.error('detect-provider:', message)
        resolve(null)
      }
    }
  })

  function _validateInputs() {
    if (typeof silent !== 'boolean') {
      throw new Error(`detect-provider: Expected option 'silent' to be a boolean.`)
    }
    if (typeof timeout !== 'number') {
      throw new Error(`detect-provider: Expected option 'timeout' to be a number.`)
    }
  }
}
