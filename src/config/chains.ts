export const chains = {
  ethereum: {
    chainId: 1,
    name: 'ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
  },
  goerli: {
    chainId: 5,
    name: 'goerli',
    currency: 'ETH',
    explorerUrl: 'https://goerli.etherscan.io',
    rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
  },
  polygon: {
    chainId: 137,
    name: 'polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com/'
  },
  mumbai: {
    chainId: 80001,
    name: 'mumbai',
    currency: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://matic-mumbai.chainstacklabs.com'
  },
  bsc: {
    chainId: 56,
    name: 'bsc',
    currency: 'BNB',
    explorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed1.binance.org'
  },
  bsctest: {
    chainId: 97,
    name: 'bsctest',
    currency: 'BNB',
    explorerUrl: 'https://testnet.bscscan.com',
    rpcUrl: 'https://data-seed-prebsc-1-s3.binance.org:8545/'
  },
  avalanche: {
    chainId: 43114,
    name: 'avalanche',
    currency: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
  },
  avalanchetest: {
    chainId: 43113,
    name: 'avalanchetest',
    currency: 'AVAX',
    explorerUrl: 'https://testnet.snowtrace.io',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc'
  },
  arbitrum: {
    chainId: 42161,
    name: 'arbitrum',
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  },
  arbitrumtest: {
    chainId: 421613,
    name: 'arbitrumtest',
    currency: 'ETH',
    explorerUrl: 'https://goerli.arbiscan.io',
    rpcUrl: 'https://goerli-rollup.arbitrum.io/rpc'
  },
  zksync: {
    chainId: 324,
    name: 'zksync',
    currency: 'ETH',
    explorerUrl: 'https://explorer.zksync.io',
    rpcUrl: 'https://mainnet.era.zksync.io'
  },
  zksynctest: {
    chainId: 280,
    name: 'zksynctest',
    currency: 'ETH',
    explorerUrl: 'https://goerli.explorer.zksync.io',
    rpcUrl: 'https://zksync2-testnet.zksync.dev'
  },
  btc: {
    chainId: 3009,
    name: 'btc',
    currency: 'BTC',
    explorerUrl: 'https://mempool.space',
    rpcUrl: 'null'
  },
  btctest: {
    chainId: 3010,
    name: 'btctest',
    currency: 'BTC',
    explorerUrl: 'https://mempool.space/testnet',
    rpcUrl: 'null'
  },
  optimism: {
    chainId: 10,
    name: 'optimism',
    currency: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://optimism-mainnet.infura.io'
  },
  linea: {
    chainId: 59144,
    name: 'linea',
    currency: 'ETH',
    explorerUrl: 'https://explorer.linea.build',
    rpcUrl: 'https://rpc.linea.build'
  },
  lineatest: {
    chainId: 59140,
    name: 'lineatest',
    currency: 'ETH',
    explorerUrl: 'https://explorer.goerli.linea.build',
    rpcUrl: 'https://rpc.goerli.linea.build'
  },
  base: {
    chainId: 8453,
    name: 'base',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org'
  },
  basetest: {
    chainId: 84531,
    name: 'basetest',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://goerli.base.org'
  },
  opbnb: {
    chainId: 204,
    name: 'opbnb',
    currency: 'BNB',
    explorerUrl: 'http://mainnet.opbnbscan.com',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org'
  },
  starknet: {
    chainId: 700129,
    name: 'starknet',
    currency: 'ETH',
    explorerUrl: 'https://starkscan.co',
    rpcUrl: 'https://alpha-mainnet.starknet.io'
  },
  starknettest: {
    chainId: 700130,
    name: 'starknettest',
    currency: 'ETH',
    explorerUrl: 'https://testnet.starkscan.co',
    rpcUrl: 'https://alpha4.starknet.io'
  },
  scroll: {
    chainId: 534352,
    name: 'scroll',
    currency: 'ETH',
    explorerUrl: 'https://scrollscan.com',
    rpcUrl: 'https://rpc.scroll.io/'
  },
  'manta-pacific': {
    chainId: 169,
    name: 'manta-pacific',
    currency: 'ETH',
    explorerUrl: 'https://pacific-explorer.manta.network',
    rpcUrl: 'https://pacific-rpc.manta.network/http'
  }
}

export const chainsConfig = {
  // -----------------> ethereum <-----------------
  ethereum: {
    mainnet: true,
    chain: 'eth',
    chainId: '0x1',
    chainName: 'ethereum',
    chainMId: 1,
    title: 'Ethereum',
    netName: 'Mainnet',

    rpcUrl: '/api/v1/jsonrpc',
    rpcUrlOffical:
      'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorePrefixUrlCN: 'https://cn.etherscan.com',
    explorePrefixUrlEN: 'https://etherscan.io',
    primaryColor: '#3028BB',
    exploreName: 'Etherscan',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  goerli: {
    mainnet: false,
    chain: 'eth',
    chainId: '0x5',
    chainName: 'goerli',
    chainMId: 5,
    title: 'Goerli',
    netName: 'Goerli',

    rpcUrl: '/api/v1/jsonrpc',
    rpcUrlOffical:
      'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorePrefixUrlCN: 'https://goerli.etherscan.io',
    explorePrefixUrlEN: 'https://goerli.etherscan.io',
    primaryColor: '#3028BB',
    exploreName: 'Etherscan',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  // -----------------> polygon <-----------------
  polygon: {
    mainnet: true,
    chain: 'polygon',
    chainId: '0x89',
    chainName: 'polygon',
    chainMId: 101,
    title: 'Polygon',
    netName: 'Polygon',

    hideUrl: '',
    rpcUrl: '/api/polygon/jsonrpc',
    rpcUrlOffical: 'https://polygon-rpc.com/',
    explorePrefixUrlCN: 'https://polygonscan.com',
    explorePrefixUrlEN: 'https://polygonscan.com',
    primaryColor: '#773FDF',
    exploreName: 'Polygonscan',
    coin: {
      primary: 'matic',
      secondary: 'wmatic'
    }
  },
  mumbai: {
    mainnet: false,
    chain: 'polygon',
    chainId: '0x13881',
    chainName: 'mumbai',
    chainMId: 102,
    title: 'Mumbai',
    netName: 'Mumbai',

    hideUrl: '',
    rpcUrl: '/api/polygon/jsonrpc',
    rpcUrlOffical: 'https://matic-mumbai.chainstacklabs.com',
    explorePrefixUrlCN: 'https://mumbai.polygonscan.com',
    explorePrefixUrlEN: 'https://mumbai.polygonscan.com',
    primaryColor: '#773FDF',
    exploreName: 'Polygonscan',
    coin: {
      primary: 'matic',
      secondary: 'wmatic'
    }
  },
  // -----------------> bsc <-----------------
  bsc: {
    mainnet: true,
    chain: 'bsc',
    chainId: '0x38',
    chainName: 'bsc',
    chainMId: 201,
    title: 'BNB Chain',
    netName: 'BSC',

    hideUrl: '',
    rpcUrl: '/api/bsc/jsonrpc',
    rpcUrlOffical: 'https://bsc-dataseed1.binance.org',
    explorePrefixUrlCN: 'https://bscscan.com',
    explorePrefixUrlEN: 'https://bscscan.com',
    primaryColor: '#FFD600',
    exploreName: 'Bscscan',
    coin: {
      primary: 'bnb',
      secondary: 'wbnb'
    }
  },
  bsctest: {
    mainnet: false,
    chain: 'bsc',
    chainId: '0x61',
    chainName: 'bsctest',
    chainMId: 202,
    title: 'BNB Test',
    netName: 'BSC',

    hideUrl: '',
    rpcUrl: '/api/bsc/jsonrpc',
    rpcUrlOffical: 'https://data-seed-prebsc-1-s3.binance.org:8545/',
    explorePrefixUrlCN: 'https://testnet.bscscan.com',
    explorePrefixUrlEN: 'https://testnet.bscscan.com',
    primaryColor: '#FFD600',
    exploreName: 'Bscscan',
    coin: {
      primary: 'bnb',
      secondary: 'wbnb'
    }
  },
  // -----------------> avalanche <-----------------
  avalanche: {
    mainnet: true,
    chain: 'avalanche',
    chainId: '0xa86a',
    chainName: 'avalanche',
    chainMId: 401,
    title: 'Avalanche',
    netName: 'Avalanche',

    hideUrl: '',
    rpcUrl: '/api/avalanche/jsonrpc',
    rpcUrlOffical: 'https://api.avax.network/ext/bc/C/rpc',
    explorePrefixUrlCN: 'https://snowtrace.io',
    explorePrefixUrlEN: 'https://snowtrace.io',
    primaryColor: '#E32C42',
    exploreName: 'Snowtrace',
    coin: {
      primary: 'avax',
      secondary: 'wavax'
    }
  },
  avalanchetest: {
    mainnet: false,
    chain: 'avalanche',
    chainId: '0xa869',
    chainName: 'avalanchetest',
    chainMId: 402,
    title: 'Avalanche Test',
    netName: 'Avalanche',

    hideUrl: '',
    rpcUrl: '/api/avalanche/jsonrpc',
    rpcUrlOffical: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorePrefixUrlCN: 'https://testnet.snowtrace.io',
    explorePrefixUrlEN: 'https://testnet.snowtrace.io',
    primaryColor: '#E32C42',
    exploreName: 'Snowtrace',
    coin: {
      primary: 'avax',
      secondary: 'wavax'
    }
  },
  // -----------------> arbitrum <-----------------
  arbitrum: {
    mainnet: true,
    chain: 'arbitrum',
    chainId: '0xa4b1',
    chainName: 'arbitrum',
    chainMId: 601,
    title: 'Arbitrum',
    netName: 'Arbitrum',

    hideUrl: '',
    rpcUrl: '/api/arbitrum/jsonrpc',
    rpcUrlOffical: 'https://arb1.arbitrum.io/rpc',
    explorePrefixUrlCN: 'https://arbiscan.io',
    explorePrefixUrlEN: 'https://arbiscan.io',
    primaryColor: '#E32C42',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  arbitrumtest: {
    mainnet: false,
    chain: 'arbitrum',
    chainId: '0x66eed',
    chainName: 'arbitrumtest',
    chainMId: 602,
    title: 'Arbitrum Goerli',
    netName: 'Arbitrum Goerli',

    hideUrl: '',
    rpcUrl: '/api/arbitrum/jsonrpc',
    rpcUrlOffical: 'https://goerli-rollup.arbitrum.io/rpc',
    explorePrefixUrlCN: 'https://goerli.arbiscan.io',
    explorePrefixUrlEN: 'https://goerli.arbiscan.io',
    primaryColor: '#E32C42',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  // -----------------> zksync <-----------------
  zksync: {
    mainnet: true,
    chain: 'zksync',
    chainId: '0x144',
    chainName: 'zksync',
    chainMId: 701,
    title: 'zkSync Era',
    netName: 'zksync',

    hideUrl: '',
    rpcUrl: '/api/zksync/jsonrpc',
    rpcUrlOffical: 'https://mainnet.era.zksync.io',
    explorePrefixUrlCN: 'https://explorer.zksync.io',
    explorePrefixUrlEN: 'https://explorer.zksync.io',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  zksynctest: {
    mainnet: false,
    chain: 'zksync',
    chainId: '0x118',
    chainName: 'zksynctest',
    chainMId: 702,
    title: 'zksynctest',
    netName: 'zksynctest',

    hideUrl: '',
    rpcUrl: '/api/zksync/jsonrpc',
    rpcUrlOffical: 'https://zksync2-testnet.zksync.dev',
    explorePrefixUrlCN: 'https://goerli.explorer.zksync.io',
    explorePrefixUrlEN: 'https://goerli.explorer.zksync.io',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  // -----------------> btc <-----------------
  btc: {
    mainnet: true,
    chain: 'btc',
    chainId: '0xbc1', // 10
    chainName: 'btc',
    chainMId: 801,
    title: 'Bitcoin',
    netName: 'btc',

    hideUrl: '',
    rpcUrl: 'null',
    rpcUrlOffical: 'null',
    explorePrefixUrlCN: 'https://mempool.space',
    explorePrefixUrlEN: 'https://mempool.space',
    primaryColor: '',
    exploreName: 'Mempool',
    coin: {
      primary: 'btc',
      secondary: 'wbtc'
    }
  },
  btctest: {
    mainnet: false,
    chain: 'btc',
    chainId: '0xbc2',
    chainName: 'btctest',
    chainMId: 802,
    title: 'Bitcoin Test',
    netName: 'btctest',

    hideUrl: '',
    rpcUrl: 'null',
    rpcUrlOffical: 'null',
    explorePrefixUrlCN: `https://mempool.space/testnet`,
    explorePrefixUrlEN: `https://mempool.space/testnet`,
    primaryColor: '',
    exploreName: 'Mempool',
    coin: {
      primary: 'btc',
      secondary: 'wbtc'
    }
  },
  // -----------------> optimism <-----------------
  optimism: {
    mainnet: true,
    chain: 'optimism',
    chainId: '0xa', // 10
    chainName: 'optimism',
    chainMId: 1501,
    title: 'Optimism',
    netName: 'optimism',

    hideUrl: '',
    rpcUrl: '/api/optimism/jsonrpc',
    rpcUrlOffical: 'https://optimism-mainnet.infura.io',
    explorePrefixUrlCN: 'https://optimistic.etherscan.io',
    explorePrefixUrlEN: 'https://optimistic.etherscan.io',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  // optimismtest: {
  //   mainnet: false,
  //   chain: 'optimism',
  //   chainId: '0x1a4',
  //   chainName: 'optimismtest',
  //   chainMId: 802,
  //   title: 'OptimismTestnet',
  //   netName: 'optimismtest',
  //
  //   hideUrl: '',
  //   rpcUrl: '/api/optimism/jsonrpc',
  //   rpcUrlOffical: 'https://goerli.optimism.io',
  //   explorePrefixUrlCN: 'https://goerli-explorer.optimism.io',
  //   explorePrefixUrlEN: 'https://goerli-explorer.optimism.io',
  //   primaryColor: '',
  //   exploreName: '',
  //   coin: {
  //     primary: 'eth',
  //     secondary: 'weth'
  //   },
  //   standards: [ExSchemaName.ElementExV3]
  // },
  // -----------------> linea <-----------------
  linea: {
    mainnet: true,
    chain: 'linea',
    chainId: '0xe708', // 10
    chainName: 'linea',
    chainMId: 901,
    title: 'Linea',
    netName: 'Linea',

    hideUrl: '',
    rpcUrl: '/api/linea/jsonrpc',
    rpcUrlOffical: 'https://rpc.linea.build',
    explorePrefixUrlCN: 'https://explorer.linea.build',
    explorePrefixUrlEN: 'https://explorer.linea.build',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  lineatest: {
    mainnet: false,
    chain: 'linea',
    chainId: '0xe704',
    chainName: 'lineatest',
    chainMId: 902,
    title: 'Linea Test',
    netName: 'Lineatest',

    hideUrl: '',
    rpcUrl: '/api/linea/jsonrpc',
    rpcUrlOffical: 'https://rpc.goerli.linea.build',
    explorePrefixUrlCN: 'https://explorer.goerli.linea.build',
    explorePrefixUrlEN: 'https://explorer.goerli.linea.build',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  // -----------------> base <-----------------
  base: {
    mainnet: true,
    chain: 'base',
    chainId: '0x2105', // 10
    chainName: 'base',
    chainMId: 1201,
    title: 'Base',
    netName: 'Base',

    hideUrl: '',
    rpcUrl: '/api/base/jsonrpc',
    rpcUrlOffical: 'https://mainnet.base.org',
    explorePrefixUrlCN: 'https://basescan.org',
    explorePrefixUrlEN: 'https://basescan.org',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  basetest: {
    mainnet: false,
    chain: 'base',
    chainId: '0x14a33',
    chainName: 'basetest',
    chainMId: 1202,
    title: 'Base Test',
    netName: 'Basetest',

    hideUrl: '',
    rpcUrl: '/api/base/jsonrpc',
    rpcUrlOffical: 'https://goerli.base.org',
    explorePrefixUrlCN: 'https://basescan.org',
    explorePrefixUrlEN: 'https://basescan.org',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  // -----------------> opbnb <-----------------
  opbnb: {
    mainnet: true,
    chain: 'opbnb',
    chainId: '0xcc', // 10
    chainName: 'opbnb',
    chainMId: 1101,
    title: 'opBNB',
    netName: 'opBNB',

    hideUrl: '',
    rpcUrl: '',
    rpcUrlOffical: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorePrefixUrlCN: 'http://mainnet.opbnbscan.com',
    explorePrefixUrlEN: 'http://mainnet.opbnbscan.com',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'bnb',
      secondary: 'wbnb'
    }
  },
  // -----------------> starknet <-----------------
  starknet: {
    mainnet: true,
    chain: 'starknet',
    chainId: '0xaaee1', // '0x534e5f4d41494e',
    chainName: 'starknet',
    chainMId: 1001,
    title: 'Starknet',
    netName: 'Starknet',

    hideUrl: '',
    rpcUrl: '/api/starknet/jsonrpc',
    rpcUrlOffical: 'https://alpha-mainnet.starknet.io',
    explorePrefixUrlCN: 'https://starkscan.co',
    explorePrefixUrlEN: 'https://starkscan.co',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'eth' // eth本身就是 wrapped
    }
  },
  starknettest: {
    mainnet: false,
    chain: 'starknet',
    chainId: '0xaaee2', // '0x534e5f474f45524c49',
    chainName: 'starknettest',
    chainMId: 1002,
    title: 'Starknet Goerli',
    netName: 'StarknetGoerli',

    hideUrl: '',
    rpcUrl: '/api/starknet/jsonrpc',
    rpcUrlOffical: 'https://alpha4.starknet.io',
    explorePrefixUrlCN: 'https://testnet.starkscan.co',
    explorePrefixUrlEN: 'https://testnet.starkscan.co',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'eth' // eth本身就是 wrapped
    }
  },
  // -----------------> scroll <-----------------
  scroll: {
    mainnet: true,
    chain: 'scroll',
    chainId: '0x82750', // '0x534e5f4d41494e',
    chainName: 'scroll',
    chainMId: 1301,
    title: 'Scroll',
    netName: 'Scroll',

    hideUrl: '',
    rpcUrl: '',
    rpcUrlOffical: 'https://rpc.scroll.io/',
    explorePrefixUrlCN: 'https://scrollscan.com',
    explorePrefixUrlEN: 'https://scrollscan.com',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  },
  // -----------------> Manta Pacific <-----------------
  'manta-pacific': {
    mainnet: true,
    chain: 'manta_pacific',
    chainId: '0xa9', // '0x534e5f4d41494e',
    chainName: 'manta-pacific',
    chainMId: 1401,
    title: 'Manta Pacific',
    netName: 'Manta Pacific',

    hideUrl: '',
    rpcUrl: '',
    rpcUrlOffical: 'https://pacific-rpc.manta.network/http',
    explorePrefixUrlCN: 'https://pacific-explorer.manta.network',
    explorePrefixUrlEN: 'https://pacific-explorer.manta.network',
    primaryColor: '',
    exploreName: '',
    coin: {
      primary: 'eth',
      secondary: 'weth'
    }
  }
  // -----------------> solana <-----------------
  // solana: {
  //   mainnet: true,
  //   chain: 'solana',
  //   chainId: '0x301',
  //   chainName: 'solana',
  //   chainMId: 301,
  //   title: 'Solana',
  //   netName: 'Solana',
  //
  //   hideUrl: '',
  //   explorePrefixUrlCN: 'https://solanascan.io',
  //   explorePrefixUrlEN: 'https://solanascan.io',
  //   primaryColor: '#E32C42',
  //   exploreName: 'Solanascan',
  //   coin: {
  //     primary: 'sol',
  //     secondary: 'wsol'
  //   }
  // },
  // solanatest: {
  //   mainnet: false,
  //   chain: 'solana',
  //   chainId: '0x302',
  //   chainName: 'solanatest',
  //   chainMId: 302,
  //   title: 'SolanaTest',
  //   netName: 'Solana',
  //
  //   hideUrl: '',
  //   explorePrefixUrlCN: 'https://solanascan.io',
  //   explorePrefixUrlEN: 'https://solanascan.io',
  //   primaryColor: '#E32C42',
  //   exploreName: 'Solanascan',
  //   coin: {
  //     primary: 'sol',
  //     secondary: 'wsol'
  //   }
  // }
}
