'use client';

import { languages } from '@i18n'
import { Link, usePathname } from '@navigation'
import { Dropdown } from 'antd'
import { useLocale } from 'next-intl'



import Icons from './Icons';


export default function LocaleSwitcher() {
  const pathname = usePathname()
  const locale = useLocale()

  return (
    <Dropdown
      menu={{
        selectable: true,
        selectedKeys: [locale],
        items: Object.entries(languages).map(([lang, setting]) => ({
          key: lang,
          label: (
            <Link href={pathname ?? '/'} locale={lang}>
              {setting.flag}&nbsp;&nbsp;{setting.name}
            </Link>
          )
        }))
      }}
    >
      <div className="btn" role={'button'} tabIndex={0}>
        <Icons.Languages className="h-5 w-5" />
      </div>
    </Dropdown>
  )
}