import { useEffect, useState } from 'react'

export default function useIsInIframe() {
  const [isInIframe, setIsInIframe] = useState(false)

  useEffect(() => {
    const isRunningInIframe = window.self !== window.top
    setIsInIframe(isRunningInIframe)
  }, [])

  return {
    isInIframe
  }
}
