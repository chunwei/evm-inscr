'use client';

import { useEffect, useRef } from 'react';



import { chains } from '@config/chains';
import { Web3Modal } from '@web3modal/ethers/dist/types/src/client';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { useTheme } from 'next-themes';


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

export function Web3ModalProvider({ children }: { children: React.ReactElement }) {
  const { theme } = useTheme()
  const web3modal = useRef<Web3Modal>()

  useEffect(() => {
    if (web3modal.current) {
      web3modal.current.setThemeMode(theme as any)
    } else {
      web3modal.current = createWeb3Modal({
        ethersConfig: defaultConfig({ metadata }),
        chains: support_chains,
        projectId,
        themeMode: theme as any
      })
    }
  }, [theme])

  return children
}