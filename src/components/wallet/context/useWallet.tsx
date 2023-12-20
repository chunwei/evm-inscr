import { useContext } from 'react'

import { WalletContext, useWalletContext } from './WalletContext'

export default function useWallet() {
  const isInstalled = true
  const isConnected = true
  // const { wallet } = useWalletContext()
  const pay = () => {
    console.log('pay with wallet')
  }
  const connect = () => {
    console.log('connect to wallet')
  }
  return {
    isConnected,
    pay,
    connect,
    isInstalled
  }
}
