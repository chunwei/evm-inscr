import { useState } from 'react'

import { Card, CardProps, theme } from 'antd'

const { useToken } = theme

interface CardHoverProps extends CardProps {
  active?: boolean
}
export default function CardHover({ active, children, ...props }: CardHoverProps) {
  const { token } = useToken()
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }
  const cardStyle = {
    borderColor: active ? token.colorPrimary : isHovered ? token.colorPrimaryBorder : token.colorBorder
  }

  return (
    <Card {...props} style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
    </Card>
  )
}
