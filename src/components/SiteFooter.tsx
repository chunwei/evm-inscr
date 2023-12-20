'use client'

import useIsInIframe from 'src/hooks/useIsInIframe'

export default function SiteFooter() {
  const { isInIframe } = useIsInIframe()

  return isInIframe ? (
    <></>
  ) : (
    <footer className=" flex items-center justify-center py-14 opacity-60">
      ©Evm-inscr @ 2023
    </footer>
  )
}
