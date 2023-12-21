'use client'

import Icons from './Icons'
import { Dropdown } from 'antd'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

export interface NavItem {
  title: React.ReactNode
  href: string
  icon?: LucideIcon
}

export function MainNav() {
  const NavItems: NavItem[] = [
    {
      title: 'Inscriptions',
      href: '/inscriptions',
      icon: Icons.Ordi
    },
    {
      title: 'Tokens',
      href: '/tokens',
      icon: Icons.CurlyBracesIcon
    },
    {
      title: 'Inscribe',
      href: '/inscribe',
      icon: Icons.Slice
    },
    {
      title: 'Marketplace',
      href: '/marketplace',
      icon: Icons.ShoppingBag
    }
  ]

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/">
        <div className="hidden items-center space-x-2 md:flex">
          <Icons.logo className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">Evm-Inscr</span>
        </div>
      </Link>
      {NavItems?.map(
        (item) =>
          item.href && (
            <Link
              key={item.href}
              href={item.href}
              className="hidden items-center space-x-2 font-sans font-bold text-slate-600 hover:text-slate-900 sm:hidden md:flex dark:text-slate-100"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </Link>
          )
      )}
      <Dropdown
        menu={{
          items: NavItems?.map((item) => ({
            key: item.href,
            label: (
              <Link href={item.href} className="flex items-center">
                {item.icon && <item.icon className="mr-2 h-3 w-3" />}
                <span>{item.title}</span>
              </Link>
            )
          }))
        }}
      >
        <div className="btn md:hidden">
          <Icons.logo className="mr-2 h-6 w-6" />{' '}
          <span className="font-bold">Menu</span>
        </div>
      </Dropdown>
    </div>
  )
}
