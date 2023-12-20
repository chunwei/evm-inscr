'use client'

/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-09 20:01:53
 * @LastEditTime: 2023-05-09 23:42:18
 * @LastEditors: Chunwei Lu
 */
// import FormComponent from '@components/FormComponent'
import GradientButton from '@components/GradientButton'
import DeployModal from '@components/inscribe/evm/DeployModal'
import Link from 'next/link'
import { useState } from 'react'

export default function Page() {
  const NavItems: any[] = [
    {
      title: 'Inscribe',
      href: '/inscribe'
    },
    {
      title: 'Tokens',
      href: '/ordinals'
    }
    // {
    // 	title: t('nav.orders'),
    // 	href: '/orders'
    // }
  ]

  const [showDeployModal, setShowDeployModal] = useState(false)
  const openDeployModal = () => {
    setShowDeployModal(true)
  }
  const onModalClose = () => {
    setShowDeployModal(false)
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <h1 className="text-center text-4xl font-extrabold !leading-tight tracking-tighter">
        deploy
      </h1>
      <div>
        <GradientButton
          color="framer"
          className=" shadow-framer"
          onClick={openDeployModal}
        >
          <span>Deploy</span>
        </GradientButton>
        <DeployModal open={showDeployModal} onClose={onModalClose} />
      </div>
      {/* {NavItems?.map(
        (item, index) =>
          item.href && (
            <Link
              key={index}
              href={item.href}
              // className="flex items-center space-x-2 font-sans font-bold text-slate-600 hover:text-slate-900 dark:text-slate-100"
            >
              <GradientButton color="framer" className=" shadow-framer">
                <span>{item.title}</span>
              </GradientButton>
            </Link>
          )
      )} */}
    </section>
  )
}
