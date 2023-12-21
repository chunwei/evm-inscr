'use client';

import { MainNav } from './MainNav'
import ThemeToggle from './ThemeToggle'
import ConnectButton from './wallet/ConnectButton'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full flex-none bg-white/95 backdrop-blur transition-colors duration-500 supports-[backdrop-filter]:bg-white/60 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] dark:bg-transparent">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <div className="inline w-6" />
            <ConnectButton />
          </nav>
        </div>
      </div>
    </header>
  )
}