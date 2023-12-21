'use client';

// import LocaleSwitcher from './LocaleSwitcher'
import { MainNav } from './MainNav';
import ThemeToggle from './ThemeToggle';
import ConnectButton from './wallet/ConnectButton';
import WalletButton from './wallet/WalletButton';
import { useWalletContext } from './wallet/context/WalletContext';
import { setParentLocation } from '@redux/slices/common';
import { useAppDispatch } from '@redux/store';
import { useTheme } from 'next-themes';
import { useCallback, useEffect } from 'react'
import useIsInIframe from 'src/hooks/useIsInIframe'

export function SiteHeader() {
  const { setTheme, theme } = useTheme()
  const dispatch = useAppDispatch()
  const { handleAccountsChanged, initWith } = useWalletContext()
  const { isInIframe } = useIsInIframe()
  // 在外层主站中定义一个函数来处理从 iframe 接收到的消息
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.source !== parent) {
        return
      }
      const message = event.data // 接收到的消息数据
      console.log('iframe handleMessage', message)
      switch (message.type) {
        case 'themeChange':
          setTheme(message.theme)
          break
        case 'accountChange':
          handleAccountsChanged([message.account])
          break
        case 'onIframeLoad':
          dispatch(setParentLocation(message.location))
          initWith(message.walletInfo)
          setTheme(message.theme)
          handleAccountsChanged([message.account])
          break
      }
    },
    [dispatch, handleAccountsChanged, initWith, setTheme]
  )

  const handleOnload = useCallback((event: Event) => {
    console.log('iframe handleOnload')
    window.parent.postMessage({ type: 'iframeOnload' }, '*')
  }, [])

  useEffect(() => {
    if (isInIframe) {
      window.document.body.classList.add('inIframe')
      // 在窗口加载时添加消息监听器
      window.addEventListener('message', handleMessage)
      // 双保险是因为react环境下window.onload触发时机无法确定
      window.parent.postMessage({ type: 'iframeOnload' }, '*')
      window.addEventListener('load', handleOnload)
    }

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('load', handleOnload)
    }
  }, [handleMessage, handleOnload, isInIframe])

  return isInIframe ? (
    <></>
  ) : (
    <header className="sticky top-0 z-40 w-full flex-none bg-white/95 backdrop-blur transition-colors duration-500 supports-[backdrop-filter]:bg-white/60 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] dark:bg-transparent">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {/* <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              <Icons.Github className="h-5 w-5" />
            </Link> */}
            {/* <LocaleSwitcher /> */}
            <ThemeToggle />
            <div className="inline w-6" />
            {/* <WalletButton /> */}
            <ConnectButton />
          </nav>
        </div>
      </div>
    </header>
  )
}