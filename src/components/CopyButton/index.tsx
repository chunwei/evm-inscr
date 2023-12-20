import { useState } from 'react'

import Icons from '@components/Icons'
import { Button, Tooltip } from 'antd'

import copy from './clipboard'

export default function CopyButton({ text = '', className }: { text?: string; className?: string }) {
  const [success, setSuccess] = useState(false)
  const onClick = async () => {
    await copy(text).catch((err) => {
      setSuccess(false)
    })
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
    }, 2000)
  }
  return (
    <Button
      onClick={onClick}
      size="small"
      type="link"
      className={`mx-1 flex items-center justify-center ${className ?? ''}`}
      icon={
        success ? (
          <Tooltip title="Copied">
            <Icons.ClipboardCheck size={16} className="inline text-emerald-500" />
          </Tooltip>
        ) : (
          <Icons.Copy size={16} className="inline" />
        )
      }
    />
  )
}
