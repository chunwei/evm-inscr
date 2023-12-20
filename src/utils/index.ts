export type AccessMode = 'standalone' | 'embeded'
export function checkIsInIframe(mode: AccessMode, referer?: string | null) {
  if (mode === 'embeded') {
    return true
  }
  if (referer && (referer.includes('localhost:3066') || referer.includes('element.market'))) {
    return true
  }
  return false
}
