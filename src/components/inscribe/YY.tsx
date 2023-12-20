import { useCallback, useEffect, useState } from 'react'

import Countdown from '@components/Countdown'
import useWallet from '@components/wallet/context/useWallet'
import { canRefund, queryOrder, simpleRefund } from '@services/rest/api'
import { Button, Image, Typography, message } from 'antd'

function mapStatus(orderData: any) {
  const { status, balance, amount, minted, isPaidOffchain, createTimestamp } = orderData
  if ('pending' === status || 'canceled' === status) {
    if (minted > 0 || isPaidOffchain) return 'inscribing'
    if (balance > 0) return balance < amount ? 'failed' : 'paid'
    if (createTimestamp + 36e5 < Date.now()) return 'notPaid'
  }
  return status
}

export default function OrderPanel({ orderId, close }: { orderId: string; close: () => void }) {
  const { isConnected, pay, connect, isInstalled } = useWallet()
  const [order, setOrder] = useState<any>()
  const [S, C] = useState(false)
  const [P, I] = useState(false)
  const [T, F] = useState('btc')
  const [_, B] = useState(false)
  const [isRefundPanelOpen, setRefundPanelOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [D, O] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (S) return null

    return new Promise((resolve) => {
      C(true)

      try {
        queryOrder(orderId).then((order) => {
          if (order) {
            setOrder(order)
            // Z(orderId, R(order))
            resolve(order)
          } else {
            message.error('Order does not exist')
            close()
            resolve(null)
          }
        })
      } catch (error) {
        message.error((error as any).message)
        resolve(null)
      } finally {
        C(false)
      }
    })
  }, [S, close, orderId])

  useEffect(() => {
    if (isInstalled) {
      F('unisat')
    }
  }, [isInstalled])

  useEffect(() => {
    if (order) {
      const shouldChechRefund = (e: any) => {
        const { balance, amount, minted, createTimestamp } = e
        return (
          (minted <= 0 && balance > 0 && balance < amount) ||
          (minted <= 0 && balance > 0 && createTimestamp + 6e5 < Date.now())
        )
      }

      if (shouldChechRefund(order)) {
        if (!isRefundPanelOpen) {
          canRefund(orderId)
            .then((result) => {
              setRefundPanelOpen(result)
            })
            .catch((error) => {
              console.log(error)
            })
        } else {
          setRefundPanelOpen(false)
        }
      }
    }
  }, [isRefundPanelOpen, order, orderId])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (!S && orderId === order?.orderId) {
      fetchOrder().then((result: any) => {
        if (result?.status === 'pending') {
          interval = setInterval(async () => {
            if (!document.hidden) {
              const orderData = await fetchOrder()
              if ((orderData as any)?.status !== 'pending') {
                clearInterval(interval)
                interval = undefined
              }
            }
          }, 5000)
        }
      })
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [S, fetchOrder, order?.orderId, orderId])

  const { createdTime, feeRate, serviceFee, amount, balance, files, minted, count } = order
  let { status } = order
  const formattedAmount = (amount / 1e8).toFixed(8)
  status = mapStatus(order)
  return (
    <div className="mask" onClick={close}>
      <div
        className="content pay-alert"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="close" onClick={close}>
          Close
        </div>
        {(() => {
          if (status === 'pending') {
            return (
              <>
                <div className="title">
                  Waiting on Payment
                  <span style={{ display: 'inline-block', width: 120 }}>
                    in <Countdown endTime={createdTime + 36e5} />
                  </span>
                </div>
                <div className="order-id">orderId: {orderId}</div>
              </>
            )
          } else if (status === 'paid') {
            return (
              <>
                <div className="title" style={{ letterSpacing: -1 }}>
                  Payment has been received, and the inscription is now in queue.
                </div>
                <div className="order-id">orderId: {orderId}</div>
              </>
            )
          } else if (status === 'inscribing') {
            return (
              <>
                <div className="title">
                  Inscribing ({minted}/{count})
                </div>
                <div className="order-id">orderId: {orderId}</div>
                {count > 23 && minted > 20 && (
                  <div className="flex-row-v-center" style={{ fontSize: 12, letterSpacing: -1, marginBottom: 16 }}>
                    <Image src="/img/warning.svg" alt="warning" width={18} height={18} />
                    <span style={{ color: 'var(--main-color)', marginLeft: 16, marginTop: 8, textAlign: 'left' }}>
                      The inscripting process will continue once the preceding block is confirmed.
                      <br />
                      Choose a higher fee rate to effectively shorten the waiting time.
                    </span>
                  </div>
                )}
              </>
            )
          } else if (status === 'failed') {
            return (
              <>
                <div className="title">Payment Failed</div>
                <div className="order-id">orderId: {orderId}</div>
              </>
            )
          } else if (status === 'minted') {
            return (
              <>
                <div className="title">Complete</div>
                <div className="order-id">orderId: {orderId}</div>
                <Image src="/img/success.svg" alt="success" width={80} height={80} style={{ marginBottom: 32 }} />
              </>
            )
          } else {
            return (
              <>
                <div className="title">Order Closed</div>
                <div className="order-id">orderId: {orderId}</div>
              </>
            )
          }
        })()}
        <div className="fee-container">
          <div className="fee">Fee Rate: {feeRate} sats/vB</div>
          <div className="fee">Service Fee: {serviceFee} sats</div>
          <div className="fee">
            Total Amount:
            <Typography.Text
              className="amount"
              style={{ fontWeight: 'bold', fontSize: 22 }}
              copyable={{ text: amount }}
            >
              {amount}
            </Typography.Text>
            BTC({formattedAmount} sats)
          </div>
          {status === 'failed' && (
            <>
              <div className="fee" style={{ color: 'var(--main-color)' }}>
                only <span className="amount"> {(balance / 1e8).toFixed(8)} </span> received.
              </div>
              <div className="fee">Please apply for a refund in the panel below.</div>
            </>
          )}
          {isRefundPanelOpen && (
            <div className="refund-panel">
              <div>If you do not wish to continue waiting, you can</div>
              <Button
                type="link"
                onClick={() => {
                  setLoading(true)
                  simpleRefund(orderId)
                    .then((e: any) => {
                      message.info(e.msg)
                      fetchOrder()
                    })
                    .catch((e: any) => {
                      message.error((e && e.message) || e)
                    })
                    .finally(() => {
                      setLoading(false)
                    })
                }}
                loading={loading}
                danger={true}
              >
                click here to refund
              </Button>
              <div>The refund will be sent to your inscription receiving address.</div>
            </div>
          )}
        </div>
        <div className="file-list">
          {files.map((file: any) => (
            <div key={file.url} className="file-item">
              <Image className="file-icon" src={file.icon} alt="file icon" />
              <div className="file-name">{file.name}</div>
              <div className="file-size">{file.size}</div>
            </div>
          ))}
        </div>
        <div
          className="notice"
          style={{ fontSize: 12, alignSelf: 'flex-end', marginTop: 16, marginBottom: -16, color: '#555' }}
        >
          Order created at {new Date(createdTime).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
