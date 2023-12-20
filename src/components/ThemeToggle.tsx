'use client'

import Icons from './Icons'
import { Dropdown, MenuProps } from 'antd'
import { useTheme } from 'next-themes'
import React from 'react'

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const onClick: MenuProps['onClick'] = ({ key }) => {
    setTheme(key)
  }

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: (
        <div className="flex items-center">
          <Icons.SunMedium className="mr-2 h-5 w-5 text-orange-500" />
          <span>Light</span>
        </div>
      )
    },
    {
      key: 'dark',
      label: (
        <div className="flex items-center">
          <Icons.Moon className="mr-2 h-5 w-5 text-blue-800" />
          <span>Dark</span>
        </div>
      )
    },
    {
      key: 'system',
      label: (
        <div className="flex items-center">
          <Icons.Laptop className="stroke-1.5 mr-2 h-5 w-5" />
          <span>System</span>
        </div>
      )
    }
  ]

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: [theme ?? 'system'],
        onClick
      }}
    >
      <button className="btn">
        <Icons.SunMedium className="rotate-0 scale-100 text-orange-500 transition-all dark:-rotate-90 dark:scale-0" />
        <Icons.Moon className="absolute rotate-90 scale-0  text-blue-500 transition-all dark:rotate-0 dark:scale-100" />
      </button>
    </Dropdown>
  )
}
