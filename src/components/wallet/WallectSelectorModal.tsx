'use client';

import { ReactNode, useEffect, useState } from 'react';



import Image, { ImageProps } from 'next/image';



import Icons from '@components/Icons';
import logo_hiro from '@public/images/logos/hiro.svg';
import logo_unisat from '@public/images/logos/unisat.svg';
import logo_xverse from '@public/images/logos/xverse.svg';
import { Modal, Typography } from 'antd';



import connect_hiro from './connect/connect_hiro';
import connect_unisat from './connect/connect_unisat';
import connect_xverse from './connect/connect_xverse';
import { useWalletContext } from './context/WalletContext';


const { Text, Title } = Typography

interface WallectSelectorModalProps {
  open?: boolean
  onClose?: () => void
}
type ImageSrc = ImageProps['src']
interface IWalletItem {
  name: string
  logo: ImageSrc
  connect: () => Promise<void>
  disabled?: boolean
}
export default function WallectSelectorModal({ open = false, onClose }: WallectSelectorModalProps) {
  const { connect, walletName } = useWalletContext()
  const [isModalOpen, setIsModalOpen] = useState(open)
  const [currentWallet, setCurrentWallet] = useState(walletName)
  useEffect(() => {
    setIsModalOpen(open)
  }, [open])

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }
  const afterOpenChange = (open: boolean) => {
    if (!open && onClose) onClose()
  }
  const connectWallet = (wallet: IWalletItem) => {
    if (wallet?.connect) {
      wallet.connect()
      setCurrentWallet(wallet.name)
      // 连接后关闭弹窗
      setIsModalOpen(false)
    }
  }

  const wallets: IWalletItem[] = [
    {
      name: 'Unisat',
      logo: logo_unisat,
      connect: () => connect('unisat'),
      disabled: false
    },
    {
      name: 'Hiro',
      logo: logo_hiro,
      connect: () => connect('hiro'),
      disabled: false
    },
    {
      name: 'Xverse',
      logo: logo_xverse,
      connect: () => connect('xverse'),
      disabled: false
    }
  ]

  return (
    <Modal
      width={368}
      centered
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      afterOpenChange={afterOpenChange}
      footer={''}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-3 rounded-full border-2 border-yellow-500 p-1">
          <div>
            <Icons.Bitcoin size={50} className="text-yellow-500 " />
          </div>
          <div className=" absolute left-4 top-6">{/* <Icons.Bitcoin size={50} className="text-yellow-500" /> */}</div>
        </div>
        <Title level={4}>Connect Wallet </Title>
        <Text type="secondary">
          {`Choose how you want to connect. If you don't have a wallet, you can select a provider and create one.`}
        </Text>
      </div>
      <div className="mb-1 mt-6 flex flex-col gap-3">
        {wallets.map((wallet) => {
          const { name, logo, disabled } = wallet
          const isConnect = name.toLowerCase() === currentWallet.toLowerCase()
          return (
            <div
              key={name}
              onClick={() => {
                if (!disabled) connectWallet(wallet)
              }}
              className={` flex items-center rounded-lg bg-slate-100 p-2 hover:bg-slate-200/70 dark:bg-neutral-700/50 hover:dark:bg-neutral-700/80 ${
                isConnect ? 'border border-blue-500' : ''
              } ${disabled ? 'cursor-not-allowed grayscale-[80%]' : 'cursor-pointer'}`}
            >
              <div className="rounded-lg bg-slate-200 p-2 dark:bg-neutral-600/60">
                <Image src={logo} alt="" width={28} height={28} />
              </div>
              <div className="ml-3">
                <Text strong className="text-lg">
                  {name}
                </Text>
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}