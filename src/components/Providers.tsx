'use client'

import { AntdProvider } from './AntdProvider'
import { ConfigProvider, theme } from 'antd'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { useTheme } from 'next-themes'
import { PropsWithChildren, useEffect, useState } from 'react'
import useIsInIframe from 'src/hooks/useIsInIframe'

/*
 * @Author: Chunwei Lu
 * @Date: 2023-04-05 16:12:12
 * @LastEditTime: 2023-05-09 23:24:27
 * @LastEditors: Chunwei Lu
 */

export type ProviderProps = PropsWithChildren<{
  locale: string
}>

export function AntdConfigProvider({ children, locale }: ProviderProps) {
  const { theme: nowTheme } = useTheme()
  const { isInIframe } = useIsInIframe()

  const iframeToken = {
    colorPrimary: '#02bc62'
  }
  return (
    <ConfigProvider
      theme={{
        algorithm:
          nowTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isInIframe ? iframeToken : theme.defaultConfig.token
      }}
    >
      <AntdProvider>{children}</AntdProvider>
    </ConfigProvider>
  )
}

export default function Providers(props: ProviderProps) {
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // use your loading page
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        Loading...
      </div>
    )
    // return <div className="hidden">{props.children}</div>
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AntdConfigProvider {...props} />
    </NextThemeProvider>
  )
}
