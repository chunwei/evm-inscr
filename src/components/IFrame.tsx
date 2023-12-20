'use client';

import { useCallback, useEffect, useRef } from 'react';



import { useTheme } from 'next-themes';


interface IFrameProps
  extends React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> {
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' | 'initial' | 'inherit'
}
export default function IFrame(props: IFrameProps) {
  const { objectFit, ...otherProps } = props
  const { theme } = useTheme()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // flex 放前面的话，当图片/视频在加载过程中或者图片的高度由于其他原因发生变化时，可能会导致 scrollHeight 的差异。
  // useEffect(() => {
  //   const iframe = iframeRef.current

  //   if (iframe) {
  //     const iframeWindow = iframe.contentWindow
  //     const handleMediaLoaded = () => {
  //       const scrollHeight = iframeWindow?.document.body.scrollHeight
  //       console.log('Updated scrollHeight:', scrollHeight)
  //     }

  //     iframeWindow?.addEventListener('load', () => {
  //       const mediaElements = iframeWindow.document.querySelectorAll('img, video, audio')
  //       console.log('mediaElements', mediaElements)
  //       mediaElements.forEach((mediaElement) => {
  // 视频 应该监听 loadedmetadata
  //         mediaElement.addEventListener('load', handleMediaLoaded)
  //       })
  //     })
  //   }
  // }, [])

  const onLoad = useCallback(() => {
    const iframe = iframeRef.current
    const ifrmDoc = iframeRef.current?.contentWindow?.document
    if (ifrmDoc) {
      const head = ifrmDoc.querySelector('head')
      const meta = head?.querySelector("meta[name='color-scheme']") as HTMLMetaElement
      const colorSchemeMeta = meta ? meta : ifrmDoc.createElement('meta')
      colorSchemeMeta.name = 'color-scheme'
      colorSchemeMeta.content = theme || 'system'
      if (meta) head?.removeChild(meta)
      head?.appendChild(colorSchemeMeta)
      const htmlstyle = ifrmDoc.createElement('style')
      htmlstyle.innerHTML = 'html{height:100%}'
      head?.appendChild(htmlstyle)
    }
    const pre = ifrmDoc?.querySelector('pre')
    if (pre) {
      // pre.style.margin = '0'
      pre.style.backgroundImage = 'linear-gradient(135deg, rgb(2 235 226), rgb(2 71 255))'
      pre.style.webkitBackgroundClip = 'text'
      pre.style.backgroundClip = 'text'
      pre.style.webkitTextFillColor = 'transparent'
      pre.style.color = 'transparent'

      try {
        pre.innerText = JSON.stringify(JSON.parse(pre.innerText), null, 2)
      } catch (error) {
        // console.log(error)
        pre.style.wordBreak = 'break-all'
        pre.style.marginLeft = '1em'
        pre.style.marginRight = '1em'
      }
    }

    if (iframe && ifrmDoc && ifrmDoc.body) {
      // ifrmDoc.body.style.color = '#666' // token.colorTextLabel
      // ifrmDoc.body.style.backgroundColor = '#141414' // token.colorBgContainer

      ifrmDoc.body.style.margin = '0'
      const scrollHeight = ifrmDoc.body.scrollHeight
      let ttlHeight = scrollHeight
      if (pre) {
        const cs = window.getComputedStyle(pre)
        const mb = parseInt(cs.marginBottom)
        const mt = parseInt(cs.marginTop)
        ttlHeight = scrollHeight + mb + mt
      }
      // console.log('ttlHeight', ttlHeight)
      iframe.height = Math.min(Math.max(ttlHeight, 116), 600) + 'px'
      ifrmDoc.body.style.height = '100%'
      ifrmDoc.body.style.display = 'flex'
      ifrmDoc.body.style.justifyContent = 'center'
      ifrmDoc.body.style.alignItems = 'center'
    }

    const mediaElements = ifrmDoc?.querySelectorAll('img, svg, video, audio')
    if (mediaElements) {
      mediaElements.forEach((mediaElement) => {
        const mele = mediaElement as HTMLMediaElement
        // console.log('mediaElement size', mele.naturalWidth, mele.naturalHeight)
        // mele.style.minWidth = '100%'
        mele.style.width = '100%'
        mele.style.height = '100%'
        mele.style.maxWidth = '100%'
        mele.style.maxHeight = '100%'
        mele.style.objectFit = objectFit ?? 'cover'
      })
    }
  }, [objectFit, theme])

  return <iframe onLoad={onLoad} ref={iframeRef} {...otherProps} />
}