/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-10 14:58:38
 * @LastEditTime: 2023-05-10 18:41:11
 * @LastEditors: luchunwei luchunwei@gmail.com
 */
import { ReactNode } from 'react'

import './style.scss'

type Props = {
  children: ReactNode
}

export default function InscribeLayout({ children }: Props) {
  return <section>{children}</section>
}
