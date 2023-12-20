import './style.scss'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return <section>{children}</section>
}
