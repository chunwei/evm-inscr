/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-10 14:58:38
 * @LastEditTime: 2023-05-10 18:41:11
 * @LastEditors: luchunwei luchunwei@gmail.com
 */
import './style.scss'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function TokensLayout({ children }: Props) {
  return <section>{children}</section>
}
