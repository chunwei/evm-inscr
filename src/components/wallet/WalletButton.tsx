'use client'

import copy from '../CopyButton/clipboard'
import WallectSelectorModal from './WallectSelectorModal'
import { HiroAddressType, useWalletContext } from './context/WalletContext'
import detectWalletProvider from './detect-provider'
import walletIcons from './wallet_icons'
// import { UserOutlined } from '@ant-design/icons'
// import Icon from '@ant-design/icons/lib/components/Icon'
import CopyButton from '@components/CopyButton'
import Icons from '@components/Icons'
import {
  Button,
  Divider,
  Dropdown,
  MenuProps,
  Tooltip,
  Typography,
  message,
  theme
} from 'antd'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import React from 'react'
import { satsToBitcoin } from 'src/utils/inscription'
import { capital, ellipsisMid } from 'src/utils/string'
import { AddressPurposes } from 'xverse-connect'

const { Text } = Typography
const { useToken } = theme

export default function WalletButton() {
  const router = useRouter()

  const {
    walletName,
    connected,
    address,
    xverseAddresses,
    hiroAddresses,
    balance,
    usdBalance,
    getBasicInfo,
    disconnect
  } = useWalletContext()
  // const [walletInstalled, setWalletInstalled] = useState(false)
  // const [walletProvider, setWalletProvider] = useState<any>()
  // const [connected, setConnected] = useState(true)
  const paymentAddress = useMemo(() => {
    let addr
    switch (walletName) {
      case 'xverse':
        addr = !xverseAddresses
          ? undefined
          : xverseAddresses[AddressPurposes.PAYMENT].address
        break
      case 'hiro':
        addr = !hiroAddresses
          ? undefined
          : hiroAddresses[HiroAddressType.p2wpkh].address
        break
      default:
        break
    }
    return addr
  }, [hiroAddresses, walletName, xverseAddresses])

  const [showSelectorModal, setShowSelectorModal] = useState(false)
  const openSelectorModal = () => {
    setShowSelectorModal(true)
  }
  const onModalClose = () => {
    setShowSelectorModal(false)
  }

  // useEffect(() => {
  //   // unisat注入可能延迟，发送在useEffect之后
  //   // This returns the provider, or null if it wasn't detected.
  //   detectWalletProvider().then((provider) => {
  //     if (provider) {
  //       setWalletInstalled(true)
  //       setWalletProvider(provider)
  //     }
  //   })
  // }, [])

  const handleLeftButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // message.info('Click on left button.')
      // console.log('click left button', e)
      router.push(`/ordinals/${address}`)
    },
    [address, router]
  )
  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        console.log('wallet button dropdown menu open')
        getBasicInfo()
      }
    },
    [getBasicInfo]
  )

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e)
    switch (e.key) {
      case '0':
        break
      case '1':
        copy(address)
          .then(() => {
            message.info('Copied to clipboard')
          })
          .catch(console.error)
        break
      case '2':
        {
          router.push(`/ordinals/${address}`)
        }
        break
      case '3':
        openSelectorModal()
        break
      case '4':
        disconnect()
        break
      default:
        message.info('Click on menu item.')
    }
  }

  const items: MenuProps['items'] = [
    // {
    // 	label: 'Balance 0.0010 BTC',
    // 	key: '0',
    // 	icon: <Icons.Bitcoin className="inline" size={18} />
    // 	// disabled: true
    // },
    // {
    // 	label: 'Copy wallet address',
    // 	key: '1',
    // 	icon: <Icons.Copy className="inline" size={18} />
    // 	// disabled: true
    // },
    {
      label: 'My ordinals',
      key: '2',
      icon: <Icons.Ordi className="inline" size={18} />
    },

    {
      label: 'Connect to a different wallet',
      key: '3',
      icon: <Icons.SwitchCamera className="inline" size={18} />
    },
    {
      label: 'Disconnect',
      key: '4',
      icon: <Icons.LogOut className="inline" size={18} />,
      danger: true
    }
  ]

  const menuProps = {
    items,
    onClick: handleMenuClick
  }

  const { token } = useToken()

  const contentStyle = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
    padding: token.paddingSM
  }

  const menuStyle = {
    boxShadow: 'none'
  }

  return (
    <>
      {connected ? (
        <>
          <Dropdown.Button
            onOpenChange={handleOnOpenChange}
            onClick={handleLeftButtonClick}
            menu={menuProps}
            placement="bottomRight"
            size="large"
            type="text"
            icon={
              <Icons.ChevronDown className="inline" strokeWidth={1} size={24} />
            }
            buttonsRender={([leftButton, rightButton]) => [
              <Tooltip title="View Profile" key="leftButton">
                {leftButton}
              </Tooltip>,
              rightButton
              // React.cloneElement(rightButton as React.ReactElement<any, string>, { loading: true })
            ]}
            dropdownRender={(menu) => (
              <div style={contentStyle}>
                <div>
                  <div className="my-2 flex items-center rounded-lg bg-slate-50 p-2 dark:bg-neutral-800">
                    <Icons.Bitcoin$
                      className="mr-2 h-9 w-9"
                      // size={32}
                      // color={token.colorWhite}
                      // className="mr-2 inline rounded-full border-2 border-yellow-500 bg-yellow-400 p-[2px]"
                    />
                    <div className=" flex flex-1 flex-col">
                      <Text className="flex items-center justify-between font-bold">
                        <span>BTC</span>
                        <span>{satsToBitcoin(balance.total)}</span>
                      </Text>
                      <Text
                        type="secondary"
                        className="flex items-center justify-between"
                      >
                        <span>Bitcoin</span>
                        <span>${usdBalance} USD</span>
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 pl-2">
                    {walletIcons[walletName] && (
                      <span className="flex items-center">
                        <Image
                          width={16}
                          height={16}
                          alt=""
                          src={walletIcons[walletName]}
                          className="mr-1 inline"
                        />
                        {`${capital(walletName)} Wallet`}
                      </span>
                    )}

                    <span className="flex flex-col items-start">
                      {paymentAddress && (
                        <span className="flex items-center">
                          <Icons.Bitcoin$ className="mr-1 h-4 w-4"></Icons.Bitcoin$>
                          <Tooltip title={paymentAddress}>
                            <Text type="secondary">
                              {ellipsisMid(paymentAddress, 4)}
                            </Text>
                          </Tooltip>
                          <CopyButton
                            className="inline"
                            text={paymentAddress}
                          />
                        </span>
                      )}
                      <span className="flex items-center">
                        <Icons.Ordi
                          size={16}
                          className="mr-1  text-slate-500"
                        ></Icons.Ordi>
                        <Tooltip title={address}>
                          <Text type="secondary">
                            {ellipsisMid(address, 4)}
                          </Text>
                        </Tooltip>
                        <CopyButton className="inline" text={address} />
                      </span>
                    </span>
                  </div>
                  {/* <div className="mb-2">
										<Button
											size="small"
											type="text"
											block
											icon={<Icons.SwitchCamera className="mr-1 inline" size={18} />}
										>
											Connect to a different wallet
										</Button>
									</div> */}

                  {/* <div className="my-2 flex items-center rounded-lg bg-slate-50 p-2 dark:bg-neutral-800">
										<div className=" flex flex-1 flex-col">
											<Text className="flex items-center justify-between font-bold">
												<span>Unisat Wallet</span>
												<Button
													size="small"
													type="link"
													icon={<Icons.SwitchCamera className="mr-1 inline" size={18} />}
												>
													Switch
												</Button>
											</Text>
											<Text type="secondary" className="flex items-center justify-between">
												<span></span>
												<span>Connect to a different wallet</span>
											</Text>
										</div>
									</div> */}
                </div>
                <Divider className="my-2" />
                {React.cloneElement(menu as React.ReactElement, {
                  style: menuStyle
                })}
                {/* <Divider style={{ margin: 0 }} />
								<div>footer area</div> */}
              </div>
            )}
          >
            <div className="flex items-center">
              <Icons.UserCircle
                className="mr-0 inline"
                strokeWidth={1}
                size={24}
              />
              <Image
                width={12}
                height={12}
                alt=""
                src={walletIcons[walletName]}
                className="mr-2 mt-2 inline"
              />
              <span title={address}>{ellipsisMid(address, 4)}</span>
            </div>
          </Dropdown.Button>
        </>
      ) : (
        <Button
          onClick={openSelectorModal}
          type="primary"
          size="large"
          icon={<Icons.Wallet size={20} className="mr-2 inline" />}
          className=" border-none bg-gradient-to-r from-indigo-500/50 from-10% via-sky-500/50 via-30% to-emerald-500/50 to-90% shadow-md backdrop-blur transition-all hover:via-purple-500/50 hover:to-pink-500/50"
        >
          Connect Wallet
        </Button>
      )}
      <WallectSelectorModal open={showSelectorModal} onClose={onModalClose} />
    </>
  )
}
