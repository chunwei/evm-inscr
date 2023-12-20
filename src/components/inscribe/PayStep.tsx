/*
 * @Author: luchunwei luchunwei@gmail.com
 * @Date: 2023-05-12 12:30:56
 * @LastEditors: luchunwei luchunwei@gmail.com
 * @LastEditTime: 2023-05-13 21:29:09
 * @FilePath: /ele-bit-ord/src/components/inscribe/PayStep.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Ref, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';



import Link from 'next/link';



import CopyButton from '@components/CopyButton';
import DotLoading from '@components/DotLoading';
import GradientButton from '@components/GradientButton';
import Icons from '@components/Icons';
import { useWalletContext } from '@components/wallet/context/WalletContext';
import { ENABLE_CPFP, MEMPOOL_NETWORK } from '@config/btc-config';
import { RootState } from '@redux/reducers';
import { setCurOrder } from '@redux/slices/common';
import { useAppDispatch, useAppSelector } from '@redux/store';
import { paymentCompleted, queryOrder } from '@services/rest/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Collapse, Divider, QRCode, Space, Typography, message, theme } from 'antd';
import useIsInIframe from 'src/hooks/useIsInIframe'
import { loopTilAddressReceivesMoney, satsToBitcoin } from 'src/utils/inscription';
import { ellipsisMid } from 'src/utils/string';



import FileList from './FileList';


const { useToken } = theme
const { Panel } = Collapse
const { Title, Text } = Typography
type PayStepProps = IStepNav
function PayStep(props: PayStepProps, ref: Ref<HTMLDivElement>) {
  const { token } = useToken()
  const { stepNavFns } = props
  const dispatch = useAppDispatch()
  const curOrder = useAppSelector((state: RootState) => state.common.curOrder)

  const { isInIframe } = useIsInIframe()

  const { xverseAddresses, sendTransfer } = useWalletContext()

  // 检测到付款完毕后是否自动通知后台
  const [autoNotice, setAutoNotice] = useState(true)
  const [isNoticing, setIsNoticing] = useState(false)

  const [received, setReceived] = useState(false)
  const loopIdRef = useRef(null)

  const { orderId, count, minted, status: orderStatus } = useMemo(() => curOrder ?? ({} as any), [curOrder])

  const queryClient = useQueryClient()
  const {
    data: order,
    isLoading,
    isFetching,
    error
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => queryOrder(orderId)
  })

  const onPaid = useCallback(async () => {
    if (curOrder && curOrder.orderId) {
      setIsNoticing(true)
      const data = await paymentCompleted(curOrder.orderId)
      setIsNoticing(false)
      let msg = data.msg
      if (!msg && data === true) {
        msg = 'Order server will check payment status and then start inscribing'
      }
      message.info(msg)
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    } else {
      message.warning('Not specify which order has been paid')
    }
  }, [curOrder, orderId, queryClient])

  const payWithWallet = useCallback(async () => {
    if (curOrder?.amount && curOrder?.payAddress) {
      try {
        // 如果是在iframe内部，则将支付委托给外层，因为钱包插件无法注入到iframe中
        if (isInIframe) {
          window.parent.postMessage({ type: 'onPayWithWallet', params: curOrder }, '*')
          return
        }

        const txid = await sendTransfer(curOrder.payAddress, curOrder.amount, {
          psbtParams: curOrder.psbtParam
            ? { ...curOrder.psbtParam, signAddress: xverseAddresses?.payment.address ?? '', broadcast: true }
            : undefined
        })

        if (txid) {
          setReceived(true)
          if (autoNotice) onPaid()
        }
        console.log('pay txid:', txid)
      } catch (e) {
        console.log((e as any).message)
      }
    }
  }, [autoNotice, curOrder, xverseAddresses?.payment.address, onPaid, sendTransfer, isInIframe])

  useEffect(() => {
    setReceived(false)
    if (loopIdRef.current) clearInterval(loopIdRef.current)
    loopIdRef.current = null
    async function check() {
      if (curOrder && curOrder.payAddress) {
        const [loop, loopId] = loopTilAddressReceivesMoney(curOrder.payAddress, ENABLE_CPFP, 120)
        loopIdRef.current = loopId
        const received = await loop
        if (received) {
          setReceived(true)
          if (autoNotice) onPaid()
        }
      }
    }
    if (orderStatus === 'wait_for_payment') {
      check()
    }
  }, [autoNotice, curOrder, onPaid, orderStatus])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (order && orderStatus !== 'broadcasted' && orderStatus !== 'expired') {
      interval = setInterval(async () => {
        if (!document.hidden) {
          queryClient.invalidateQueries({ queryKey: ['order', orderId] })
        }
      }, 6000)
    } else {
      clearInterval(interval)
      interval = undefined
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [order, orderId, orderStatus, queryClient])

  useEffect(() => {
    if (order) {
      dispatch(setCurOrder(order))
    }
  }, [dispatch, order])

  const title = useMemo(() => {
    let title = ''
    switch (orderStatus) {
      case 'wait_for_payment':
        title = 'Waiting on Payment'
        break
      case 'paid':
        title = 'Payment has been received'
        break
      case 'pending':
        title = 'Inscribing'
        break
      case 'broadcasted':
        title = 'Complete'
        break
      case 'expired':
        title = 'Order Closed'
        break

      default:
        break
    }
    return title
  }, [orderStatus])

  return (
    <Card
      ref={ref}
      bordered={false}
      actions={[
        // <Button
        //   htmlType="button"
        //   type="link"
        //   onClick={() => {
        //     if (stepNavFns?.prev) stepNavFns.prev()
        //   }}
        //   // style={{ position: 'absolute', left: 24 }}
        // >
        //   <Icons.ArrowLeft size={16} className="mr-2 inline" /> Back
        // </Button>
        <Button
          htmlType="button"
          type="link"
          onClick={() => {
            if (stepNavFns?.go) stepNavFns.go(0)
          }}
        >
          <Icons.Slice size={16} className="mr-2 inline" /> Create a new inscription
        </Button>
      ]}
      className="inscribe-card"
    >
      <div className="my-4 flex flex-col items-center">
        <Title level={4}>{title}</Title>
        <Text type="secondary" className="flex items-center">
          orderId: {curOrder?.orderId} <CopyButton text={curOrder?.orderId ?? ''} className="ml-1" />
        </Text>
        <Text type="secondary" className="flex items-center">
          Total Amount:
          <Text strong className="ml-2">
            {satsToBitcoin(curOrder?.amount ?? 0)} BTC
          </Text>
          <CopyButton text={satsToBitcoin(curOrder?.amount ?? 0)} />
          {curOrder?.amount} sats
        </Text>
        {curOrder?.payTxInfo && (
          <Text type="secondary" className="flex flex-col items-center">
            <Text type="secondary" className="flex items-center">
              Payment Transaction(s):
            </Text>
            {curOrder?.payTxInfo?.map((txInfo) => (
              <Text key={txInfo.txid} type="secondary" className="flex items-center">
                <Link target="_blank" href={`https://mempool.space/${MEMPOOL_NETWORK}/tx/${txInfo.txid}`}>
                  {ellipsisMid(txInfo.txid, 16)}
                </Link>
                <CopyButton text={txInfo.txid ?? ''} className="ml-1 mr-2" /> {txInfo.amt} sats
              </Text>
            ))}
          </Text>
        )}
      </div>
      <div className="my-4 flex flex-col items-center">
        {orderStatus === 'wait_for_payment' && (
          <Collapse
            accordion
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) =>
              isActive ? (
                <Icons.CheckCircle strokeWidth={1} color={token.colorPrimary} fill={token.colorPrimaryBg} />
              ) : (
                <Icons.Circle strokeWidth={1} color={token.colorBorder} />
              )
            }
            className="w-[800px]"
          >
            <Panel header="Pay with Wallet" key="1">
              <div className="my-4 flex flex-col items-center">
                <div className="flex w-full flex-col items-center justify-center">
                  <Text type="secondary">pay to the address below:</Text>
                  <Text className="flex items-center">
                    <Button
                      size="small"
                      type="text"
                      className="mx-0 flex items-center justify-center"
                      icon={<Icons.Bitcoin size={16} className="inline" />}
                    />
                    <span className="rounded-lg border px-2 py-1">{curOrder?.payAddress}</span>
                    <CopyButton text={curOrder?.payAddress} />
                  </Text>
                  {isInIframe ? (
                    <Button
                      onClick={payWithWallet}
                      type="primary"
                      size="large"
                      className="mt-6 w-1/2"
                      icon={<Icons.Wallet size={16} className="mr-1 inline" />}
                    >
                      Pay with Wallet
                    </Button>
                  ) : (
                    <GradientButton
                      onClick={payWithWallet}
                      color="red"
                      className="mt-6 w-1/2"
                      icon={<Icons.Wallet size={16} className="mr-1 inline" />}
                    >
                      Pay with Wallet
                    </GradientButton>
                  )}
                </div>
              </div>
            </Panel>
            <Panel header="Pay with Bitcoin" key="2">
              <div className="my-4 flex flex-col items-center">
                <Text type="secondary">Scan the QRCode to pay:</Text>
                <QRCode value={curOrder?.payAddress ?? ''} />
                <Divider>Or</Divider>
                <Text type="secondary">pay to the address below:</Text>
                <Text className="flex items-center">
                  <Button
                    size="small"
                    type="text"
                    className="mx-0 flex items-center justify-center"
                    icon={<Icons.Bitcoin size={16} className="inline" />}
                  />
                  <span className="rounded-lg border px-2 py-1">{curOrder?.payAddress}</span>
                  <CopyButton text={curOrder?.payAddress} />
                </Text>
              </div>
            </Panel>
            <Panel header="Pay with MixPay (supports lighting network)" key="3">
              <div className="my-4 flex flex-col items-center">This payment channel is under development.</div>
            </Panel>
          </Collapse>
        )}
        {orderStatus === 'paid' && (
          <>
            <Text>The inscription is now in queue.</Text>
            <Icons.ListStart size={80} strokeWidth={1} className=" text-blue-600" />
          </>
        )}
        {orderStatus === 'pending' && (
          <>
            <Text>
              Processing ( {minted ?? 0} / {count} )
            </Text>
            <Icons.ListVideo size={80} strokeWidth={1} className=" text-blue-600" />
            {count > 25 && minted > 24 && (
              <div className="flex-row-v-center" style={{ fontSize: 12, letterSpacing: -1, marginBottom: 16 }}>
                <Icons.AlertTriangle className=" fill-yellow-500" />
                <span style={{ color: 'var(--main-color)', marginLeft: 16, marginTop: 8, textAlign: 'left' }}>
                  The inscripting process will continue once the preceding block is confirmed.
                </span>
              </div>
            )}
          </>
        )}
        {orderStatus === 'broadcasted' && (
          <>
            <Icons.PackageCheck size={80} strokeWidth={1} className=" text-green-600" />
          </>
        )}
        {orderStatus === 'expired' && (
          <>
            <Icons.ServerOff size={80} strokeWidth={1} className=" text-neutral-500" />
          </>
        )}
        {orderStatus === 'wait_for_payment' && (
          <>
            {!received && (
              <div className="mt-8 flex flex-col items-center justify-center gap-2">
                <DotLoading className="my-2" />
                <Text>Checking the mempool, waiting for address to receive money</Text>
              </div>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-2">
              {isInIframe ? (
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  // className="w-1/2"
                  disabled={!received}
                  loading={isNoticing}
                  onClick={onPaid}
                  icon={<Icons.CheckCheck size={16} className="mr-1 inline" />}
                >
                  Payment completed
                </Button>
              ) : (
                <GradientButton
                  disabled={!received}
                  loading={isNoticing}
                  onClick={onPaid}
                  color="green"
                  // ghost
                  icon={<Icons.CheckCheck size={16} className="mr-1 inline" />}
                >
                  Payment completed
                </GradientButton>
              )}
            </div>
          </>
        )}
      </div>
      <FileList order={curOrder}></FileList>
    </Card>
  )
}

export default forwardRef(PayStep)