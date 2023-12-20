'use client'

import { chains } from '@config/chains'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'a09ff6fb36c0b5124cd391488f5ff587'

// 2. Set chains
const support_chains = [
  chains.avalanche,
  chains.zksync,
  chains.polygon,
  chains.bsc,
  chains.ethereum
]
// const mainnet = {
//   chainId: 1,
//   name: 'Ethereum',
//   currency: 'ETH',
//   explorerUrl: 'https://etherscan.io',
//   rpcUrl: 'https://cloudflare-eth.com'
// }

// 3. Create modal
const metadata = {
  name: 'Evm-Inscr',
  description: 'Evm-Inscriptions',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/']
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: support_chains,
  projectId
})

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return children
}