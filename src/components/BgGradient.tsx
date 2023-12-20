'use client'

import Image from 'next/image'

import bg_dark from '@public/images/docs-bgg-dark.png'
import bg from '@public/images/docs-bgg.png'
import useIsInIframe from 'src/hooks/useIsInIframe'

export function BgGradient() {
  const { isInIframe } = useIsInIframe()
  return isInIframe ? (
    <></>
  ) : (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center overflow-hidden">
      <div className="flex w-[108rem] flex-none justify-end">
        <Image src={bg} alt="" className="w-[71.75rem] max-w-none flex-none dark:hidden" />
        <Image src={bg_dark} alt="" className="hidden w-[90rem] max-w-none flex-none dark:block" />
      </div>
    </div>
  )
}
