import { TextProps } from 'antd/es/typography/Text'

import './index.scss'

export default function DotLoading(props: TextProps) {
  const { className } = props
  return (
    <div className={`loading-dots ${className ?? ''}`}>
      <span className="dot dot1"></span>
      <span className="dot dot2"></span>
      <span className="dot dot3"></span>
    </div>
  )
}
