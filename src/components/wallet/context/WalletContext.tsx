'use client';

import { Dispatch, SetStateAction, cache, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';



import { LOCALSTORAGE_KEYS } from '@config/btc-config';
import { batchQueryQuote, calculateBalance } from '@services/rest/api';
import { useQuery } from '@tanstack/react-query';
import { IBalance, SignPsbtHexParams } from '@types';
import { message, notification } from 'antd';
import BigNumber from 'bignumber.js';
import { add } from 'date-fns';
import { flushSync } from 'react-dom';
import { AddressPurposes, GetAddressResponse, SendBtcTransactionOptions, SignTransactionOptions, Address as XverseAddress, getAddress, sendBtcTransaction, signTransaction } from 'xverse-connect';



import detectWalletProvider from '../detect-provider';


export interface IQuote {
  name: string
  address: string
  icon: string
  symbol: string
  decimal: number
  accuracy: number
  ethPrice: number
  usdPrice: number
}
export type XverseAddresses = Record<AddressPurposes, XverseAddress>

export enum HiroAddressType {
  p2tr = 'p2tr',
  p2wpkh = 'p2wpkh',
  STX = 'STX'
}
export interface HiroAddress {
  address: string
  symbol: string
  publicKey?: string
  derivationPath?: string
  type?: HiroAddressType
}
export type HiroAddresses = Record<HiroAddressType, HiroAddress>
export interface WalletContextState {
  // wallet: any // unisat
  // isInstalled: boolean
  walletName: string // 当前选择的钱包
  network: string
  unisat: any
  hiro: any
  xverse: any
  xverseAddresses?: XverseAddresses
  hiroAddresses?: HiroAddresses
  unisatInstalled: boolean
  hiroInstalled: boolean
  xverseInstalled: boolean
  btckit: any
  connected: boolean
  accounts: string[]
  address: string
  publicKey: string
  balance: IBalance
  usdBalance: string
  quote: IQuote[]
  setWalletName: Dispatch<SetStateAction<string>>
  setNetwork: Dispatch<SetStateAction<string>>
  setUnisat: Dispatch<SetStateAction<any>>
  setHiro: Dispatch<SetStateAction<any>>
  setXverse: Dispatch<SetStateAction<any>>
  setUnisatInstalled: Dispatch<SetStateAction<boolean>>
  setHiroInstalled: Dispatch<SetStateAction<boolean>>
  setXverseInstalled: Dispatch<SetStateAction<boolean>>
  // setInstalled: Dispatch<SetStateAction<boolean>>
  setConnected: Dispatch<SetStateAction<boolean>>
  setAccounts: Dispatch<SetStateAction<string[]>>
  setBalance: Dispatch<SetStateAction<IBalance>>
  setAddress: Dispatch<SetStateAction<string>>
  setPublicKey: Dispatch<SetStateAction<string>>
  connect: (walletName: string) => Promise<void>
  disconnect: (walletName?: string) => Promise<void>
  sats2usd: (sats: number) => string
  sendTransfer: (
    toAddress: string,
    amount: number,
    options?: { feeRate?: number; psbtParams?: SignPsbtHexParams }
  ) => Promise<string>
  getBasicInfo: () => Promise<void>
  handleAccountsChanged: (accounts: string[]) => void
  initWith: (walletInfo: any) => void
}
export interface WalletProviderProps {
  children: React.ReactNode
}
export const WalletContext = createContext<WalletContextState>({
  network: 'testnet',
  unisat: null,
  hiro: null,
  xverse: null,
  unisatInstalled: false,
  hiroInstalled: false,
  xverseInstalled: false,
  connected: false,
  accounts: [],
  address: '',
  balance: {
    confirmed: 0,
    unconfirmed: 0,
    total: 0
  }
} as unknown as WalletContextState)
export const useWalletContext = () => useContext(WalletContext)

function getWalletInfoFromCache() {
  const cache = window?.localStorage.getItem(LOCALSTORAGE_KEYS.btc_wallet)
  if (cache) {
    try {
      const walletInfo = JSON.parse(cache)
      return walletInfo
    } catch (e) {
      console.error('parse btc wallet cache error', e)
    }
  }
  return {}
}
/**
 * 允许部分字段更新
 * @param walletInfo 部分字段
 */
function setWalletInfoToCache(walletInfo: any) {
  const cached = getWalletInfoFromCache()
  walletInfo = { ...cached, ...walletInfo }
  window?.localStorage.setItem(LOCALSTORAGE_KEYS.btc_wallet, JSON.stringify(walletInfo))
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [unisatInstalled, setUnisatInstalled] = useState(false)
  const [hiroInstalled, setHiroInstalled] = useState(false)
  const [xverseInstalled, setXverseInstalled] = useState(false)
  const [connected, setConnected] = useState(false)
  const [accounts, setAccounts] = useState<string[]>([])
  const [publicKey, setPublicKey] = useState('')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0
  })
  const [network, setNetwork] = useState('testnet') // 'testnet','livenet'
  const [walletName, setWalletName] = useState('')
  const [unisat, setUnisat] = useState<any>()
  const [xverse, setXverse] = useState<any>()
  const [hiro, setHiro] = useState<any>()
  const [btckit, setBtckit] = useState<any>()
  const [xverseAddresses, setXverseAddresses] = useState<XverseAddresses>()
  const [hiroAddresses, setHiroAddresses] = useState<HiroAddresses>()

  const walletNameRef = useRef('')
  const addressRef = useRef('')

  const xverseNetwork: 'Testnet' | 'Mainnet' = useMemo(() => (network === 'testnet' ? 'Testnet' : 'Mainnet'), [network])

  const initWith = useCallback((walletInfo: any) => {
    const { network, address, balance, walletName, connected, xverseAddresses, hiroAddresses } = walletInfo
    if (walletName) {
      setWalletName(walletName)
      walletNameRef.current = walletName
    }
    if (network) {
      setNetwork(network)
    }
    if (connected !== undefined) {
      setConnected(connected)
    }
    if (address) {
      setAddress(address)
      addressRef.current = address
    }
    if (xverseAddresses) {
      setXverseAddresses(xverseAddresses)
    }
    if (hiroAddresses) {
      setHiroAddresses(hiroAddresses)
    }
    if (balance) {
      setBalance(balance)
    }
  }, [])

  useEffect(() => {
    const walletInfo = getWalletInfoFromCache()
    initWith(walletInfo)
  }, [initWith])

  const { data: quote } = useQuery({
    queryKey: ['batchQueryQuote'],
    queryFn: () => batchQueryQuote()
  })

  const xverseSignTransaction = useCallback(
    ({ psbtBase64, signingIndexes, signAddress, sigHash, broadcast = false }: SignPsbtHexParams): Promise<string> =>
      new Promise((resolve, reject) => {
        const address = signAddress //  || window.reduxStore.getState().common.account

        const signPsbtOptions = {
          payload: {
            network: {
              type: xverseNetwork
            },
            message: 'Sign Transaction',
            psbtBase64,
            broadcast,
            inputsToSign: [
              {
                address,
                signingIndexes,
                sigHash
              }
            ]
          },
          onFinish: (res: { psbtBase64: string; txId?: string }) => {
            if (broadcast) {
              resolve(res.txId || '')
            } else {
              resolve(res.psbtBase64)
            }
          },
          onCancel: () => reject(new Error('Sign transaction canceled'))
        }

        ;(async () => {
          await signTransaction(signPsbtOptions).catch((error: Error) => {
            reject(error)
          })
        })()
      }),
    [xverseNetwork]
  )

  const sendTransfer = useCallback(
    async (toAddress: string, amount: number, options?: { feeRate?: number; psbtParams?: SignPsbtHexParams }) => {
      if (walletName === 'hiro') {
        if (!hiro || !btckit) {
          message.warning('install and connect hiro wallet first!')
          return
        }

        const resp = await btckit.request('sendTransfer', {
          address: toAddress,
          amount: `${amount}`
        })

        console.log(resp.result.txid)
        return resp.result.txid as string
      } else if (walletName === 'unisat') {
        if (!unisat) {
          message.warning('install and connect unisat wallet first!')
          return
        }
        const txid = await unisat.sendBitcoin(toAddress, amount)
        return txid
      } else if (walletName === 'xverse') {
        if (!xverse) {
          message.warning('install and connect xverse wallet first!')
          return
        }
        if (!options?.psbtParams) {
          message.warning('SignPsbtHexParams is invalid!')
          return
        }

        const txid = await xverseSignTransaction(options.psbtParams)
        return txid

        // const sendBtcTransactionOptions: SendBtcTransactionOptions = {
        //   payload: {
        //     amountSats: `${amount}`,
        //     recipientAddress: toAddress,
        //     message: 'Send Btc Transaction',
        //     network: {
        //       type: 'Testnet'
        //     }
        //   },
        //   onFinish: (response: string) => {
        //     const txid = response
        //     console.log('txid', txid)
        //     return txid
        //   },
        //   onCancel: () => {
        //     notification.error({
        //       message: 'Request canceled.',
        //       description: `'sendBtcTransaction function is not implemented by Xverse Wallet`,
        //       placement: 'top'
        //     })
        //   }
        // }
        // await sendBtcTransaction(sendBtcTransactionOptions)
      } else {
        message.warning('install and connect a wallet first!')
      }
    },
    [btckit, hiro, unisat, walletName, xverse, xverseSignTransaction]
  )

  const getBasicInfo = useCallback(async () => {
    console.log('getBasicInfo', /* walletName, */ walletNameRef.current)
    // 钱包按钮下来菜单调用此函数时，walletNameRef.current可能是空
    const _walletName = walletNameRef.current
    if (_walletName === 'hiro' && hiro && btckit) {
      const balance = await calculateBalance(
        hiroAddresses ? hiroAddresses[HiroAddressType.p2wpkh].address : addressRef.current
      )
      setBalance(balance)
      setWalletInfoToCache({ balance })
      console.log('hiro calculateBalance', balance)
    } else if (_walletName === 'xverse' && xverse) {
      const balance = await calculateBalance(
        xverseAddresses ? xverseAddresses[AddressPurposes.PAYMENT].address : addressRef.current
      )
      setBalance(balance)
      setWalletInfoToCache({ balance })
      console.log('xverse calculateBalance', balance)
    } else if (_walletName === 'unisat' && unisat) {
      const [address] = await unisat.getAccounts()
      setAddress(address)
      addressRef.current = address

      const publicKey = await unisat.getPublicKey()
      setPublicKey(publicKey)

      const balance = await unisat.getBalance()
      setBalance(balance)
      console.log('unisat getBalance', balance)

      const network = await unisat.getNetwork()
      setNetwork(network)

      setWalletInfoToCache({ address, balance, network })
    }
  }, [btckit, hiro, hiroAddresses, unisat, xverse, xverseAddresses])

  const selfRef = useRef<{ accounts: string[] }>({
    accounts: []
  })
  const self = selfRef.current
  const handleAccountsChanged = useCallback(
    (_accounts: string[]) => {
      console.log('handleAccountsChanged', _accounts)
      if (connected && self.accounts[0] === _accounts[0]) {
        console.log('equals to prev account')
        // prevent from triggering twice
        return
      }
      self.accounts = _accounts
      if (_accounts.length > 0) {
        setAccounts(_accounts)
        setConnected(true)
        setAddress(_accounts[0])
        addressRef.current = _accounts[0]
        setWalletInfoToCache({ address: _accounts[0], connected: true })
        getBasicInfo()
      } else {
        setConnected(false)
        setWalletInfoToCache({ address: '', connected: false })
      }
    },
    [connected, getBasicInfo, self]
  )

  const handleNetworkChanged = useCallback(
    (network: string) => {
      setNetwork(network)
      setWalletInfoToCache({ network })
      getBasicInfo()
    },
    [getBasicInfo]
  )

  const usdBalance = useMemo(() => {
    if (quote && quote[0] && quote[0].usdPrice && balance) {
      const usdB = new BigNumber(balance.total).times(quote[0].usdPrice).div(1e8)
      return usdB.toFixed(2)
    }
    return '0.00'
  }, [balance, quote])

  const sats2usd = useCallback(
    (sats: number) => {
      if (quote && quote[0] && quote[0].usdPrice && sats) {
        const usdB = new BigNumber(sats).times(quote[0].usdPrice).div(1e8)
        return usdB.toFixed(2)
      }
      return '0.00'
    },
    [quote]
  )
  const connect_unisat = useCallback(async () => {
    console.log('connect_unisat, is unisat exist:', !!unisat)
    if (!unisat) {
      message.warning('install unisat wallet first!')
      return
    }
    const result = await unisat.requestAccounts()
    setWalletName('unisat')
    walletNameRef.current = 'unisat'
    setWalletInfoToCache({ walletName: 'unisat' })

    console.log('unisat.requestAccounts', result)
    handleAccountsChanged(result)
    unisat.on('accountsChanged', handleAccountsChanged)
    unisat.on('networkChanged', handleNetworkChanged)
  }, [handleAccountsChanged, handleNetworkChanged, unisat])

  const connect_hiro = useCallback(async () => {
    console.log('connect_hiro, is hiro exist:', !!hiro)
    if (!hiro) {
      message.warning('install hiro wallet first!')
      return
    }
    const unlistenAccountsChanged = btckit.listen('accountsChanged', handleAccountsChanged)
    const unlistenNetworkChanged = btckit.listen('networkChanged', handleNetworkChanged)

    const userAddresses = await hiro?.request('getAddresses')
    const userP2TRAddress = userAddresses.result.addresses.find((address: any) => address.type === HiroAddressType.p2tr)

    const hiroAddresses = {} as HiroAddresses
    userAddresses.result.addresses.forEach((item: HiroAddress) => {
      const type = item.type ?? HiroAddressType.STX
      hiroAddresses[type] = item
    })

    setHiroAddresses(hiroAddresses)
    setWalletInfoToCache({ hiroAddresses })

    setWalletName('hiro')
    walletNameRef.current = 'hiro'
    setWalletInfoToCache({ walletName: 'hiro' })
    handleAccountsChanged([userP2TRAddress.address])
    console.log('userAddresses', userAddresses)
  }, [btckit, handleAccountsChanged, handleNetworkChanged, hiro])

  const connect_xverse = useCallback(async () => {
    console.log('connect_xverse, is xverse exist:', !!xverse)
    if (!xverse) {
      message.warning('install xverse wallet first!')
      return
    }
    // const unlistenAccountsChanged = btckit.listen('accountsChanged', handleAccountsChanged)
    // const unlistenNetworkChanged = btckit.listen('networkChanged', handleNetworkChanged)
    const getAddressOptions = {
      payload: {
        purposes: [AddressPurposes.ORDINALS, AddressPurposes.PAYMENT],
        message: 'Address for receiving Ordinals and payments',
        network: {
          type: 'Testnet' as 'Mainnet' | 'Testnet'
        }
      },
      onFinish: (response: GetAddressResponse) => {
        console.log('xverse GetAddressResponse', response)
        const xverseAddresses = {} as XverseAddresses
        response.addresses.forEach((item) => {
          xverseAddresses[item.purpose] = item
        })

        setXverseAddresses(xverseAddresses)
        setWalletInfoToCache({ xverseAddresses })
        const userP2TRAddress = xverseAddresses[AddressPurposes.ORDINALS]
        // const userP2TRAddress = response.addresses.find((address) => address.purpose === AddressPurposes.ORDINALS)
        if (userP2TRAddress) handleAccountsChanged([userP2TRAddress.address])
        console.log('userP2TRAddress', userP2TRAddress)
      },
      onCancel: () => message.warning('Request canceled')
    }

    setWalletName('xverse')
    walletNameRef.current = 'xverse'
    setWalletInfoToCache({ walletName: 'xverse' })

    await getAddress(getAddressOptions)
  }, [handleAccountsChanged, xverse])

  // 检测 unisat 钱包注入
  useEffect(() => {
    // unisat注入可能延迟，发送在useEffect之后
    // This returns the provider, or null if it wasn't detected.
    detectWalletProvider().then((provider) => {
      if (provider) {
        setUnisatInstalled(true)
        setUnisat(provider)
      }
    })
  }, [])

  // useEffect(() => {
  //   if (!unisat) return
  //   unisat.getAccounts().then((accounts: string[]) => {
  //     console.log('getAccounts', accounts)
  //     if (!accounts || accounts.length === 0) {
  //       message.warning('Please login to unlock wallet.')
  //     }
  //     handleAccountsChanged(accounts)
  //   })

  //   unisat.on('accountsChanged', handleAccountsChanged)
  //   unisat.on('networkChanged', handleNetworkChanged)

  //   return () => {
  //     unisat.removeListener('accountsChanged', handleAccountsChanged)
  //     unisat.removeListener('networkChanged', handleNetworkChanged)
  //   }
  // }, [handleAccountsChanged, handleNetworkChanged, unisat])

  const detectHiro = useCallback(() => {
    const provider = window.HiroWalletProvider
    if (provider) {
      setHiroInstalled(true)
      setHiro(provider)
      setBtckit(window.btc)
    }
  }, [])
  // 检测 hiro 钱包注入
  useEffect(() => {
    if (hiro) return
    detectHiro()
    // const provider = window.HiroWalletProvider
    // if (provider) {
    //   setHiroInstalled(true)
    //   setHiro(provider)
    //   setBtckit(window.btc)
    // }
  }, [detectHiro, hiro])

  const detectXverse = useCallback(() => {
    const provider = window.BitcoinProvider
    if (provider) {
      setXverseInstalled(true)
      setXverse(provider)
    }
  }, [])

  // 检测 xverse 钱包注入
  useEffect(() => {
    if (xverse) return
    detectXverse()
    // const provider = window.BitcoinProvider
    // if (provider) {
    //   setXverseInstalled(true)
    //   setXverse(provider)
    // }
  }, [detectXverse, xverse])

  // const connectedHiro = useRef(false)
  // useEffect(() => {
  //   if (!hiro) return
  //   if (connectedHiro.current) return
  //   connect_hiro()
  //   connectedHiro.current = true

  //   const unlistenAccountsChanged = btckit.listen('accountsChanged', handleAccountsChanged)
  //   const unlistenNetworkChanged = btckit.listen('networkChanged', handleNetworkChanged)

  //   return () => {
  //     unlistenAccountsChanged()
  //     unlistenNetworkChanged()
  //   }
  // }, [btckit, connect_hiro, handleAccountsChanged, handleNetworkChanged, hiro])

  const disconnect_common = useCallback(async () => {
    setConnected(false)
    // setUnisat(null)
    // setHiro(null)
    setAccounts([])
    setAddress('')
    setXverseAddresses(undefined)
    setHiroAddresses(undefined)
    setWalletName('')
    setPublicKey('')
    setBalance({
      confirmed: 0,
      unconfirmed: 0,
      total: 0
    })
    setWalletInfoToCache({
      connected: false,
      walletName: '',
      network: '',
      address: '',
      balance: {
        confirmed: 0,
        unconfirmed: 0,
        total: 0
      }
    })
  }, [])

  const connect = useCallback(
    async (walletName: string) => {
      switch (walletName) {
        case 'unisat':
          connect_unisat()
          break
        case 'hiro':
          if (!hiro) {
            detectHiro()
          }
          setTimeout(() => connect_hiro(), 10)
          break
        case 'xverse':
          if (!xverse) {
            detectXverse()
          }
          setTimeout(() => connect_xverse(), 10)
          break
      }
    },
    [connect_hiro, connect_unisat, connect_xverse, detectHiro, detectXverse, hiro, xverse]
  )

  const disconnect = useCallback(
    async (walletName?: string) => {
      switch (walletName) {
        case 'unisat':
        // disconnect_unisat()
      }
      disconnect_common()
    },
    [disconnect_common]
  )

  const contextValue = {
    unisatInstalled,
    walletName,
    setWalletName,
    network,
    setNetwork,
    unisat,
    setUnisat,
    setUnisatInstalled,
    hiro,
    setHiro,
    hiroInstalled,
    setHiroInstalled,
    xverse,
    setXverse,
    xverseInstalled,
    setXverseInstalled,
    xverseAddresses,
    hiroAddresses,
    connected,
    setConnected,
    accounts,
    setAccounts,
    address,
    setAddress,
    publicKey,
    setPublicKey,
    balance,
    setBalance,
    connect,
    disconnect,
    quote,
    usdBalance,
    sats2usd,
    btckit,
    sendTransfer,
    getBasicInfo,
    handleAccountsChanged,
    initWith
  }
  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}