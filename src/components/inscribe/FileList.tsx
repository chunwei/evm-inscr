import Icons from '@components/Icons'
import { MEMPOOL_NETWORK } from '@config/btc-config'
import { RootState } from '@redux/reducers'
import { IOrder } from '@types'
import { Card, Divider, List, Typography, theme } from 'antd'
import dayjs, { locale } from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import Link from 'next/link'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import useIsInIframe from 'src/hooks/useIsInIframe'
import { ellipsisMid, formatContentLength } from 'src/utils/string'

const { Title, Text } = Typography

const { useToken } = theme

const BroadcastStates: { [idx: number]: string } = {
  0: '待广播',
  1: '失败待重试',
  2: '广播中',
  3: '失败不重试',
  4: '广播成功'
}

export default function FileList({ order }: { order?: IOrder }) {
  const locale = 'en-US'
  dayjs.locale(locale)
  dayjs.extend(LocalizedFormat)

  const parentLocation = useSelector(
    (state: RootState) => state.common.parentLocation
  )
  const { token } = useToken()
  const { isInIframe } = useIsInIframe()

  const inscriptionLink = useCallback(
    (txid: string) => {
      const insId = `${txid}i0`
      if (isInIframe) {
        const chainName = MEMPOOL_NETWORK === 'testnet' ? 'btctest' : 'btc'
        console.log('parentLocation', parentLocation)
        const origin = parentLocation?.origin ?? ''
        return `${origin}/assets/${chainName}/ordi/${insId}`
      }
      return `/inscription/${insId}`
    },
    [isInIframe, parentLocation]
  )

  if (!order) return null
  const { files, createTimestamp, status } = order

  return (
    <Card bordered className=" border-none" bodyStyle={{ padding: 0 }}>
      <Divider>Files</Divider>
      <List
        // header={}
        footer={
          <div className=" text-right">
            <Text type="secondary">
              order created at: {dayjs(createTimestamp).format('LL LTS')}
            </Text>
          </div>
        }
        className=" w-[800px]"
        grid={{ gutter: 16, column: 1 }}
        dataSource={files}
        pagination={{
          onChange: (page) => {
            //   console.log(page);
          },
          pageSize: 5
        }}
        renderItem={(item: any, idx) => (
          <List.Item key={idx}>
            <Card
              hoverable
              className="hover:bg-neutral-100 hover:shadow-md dark:hover:bg-neutral-800"
              bodyStyle={{ padding: '12px 16px' }}
            >
              <div className="flex justify-between">
                <div className="mr-3 flex items-center">
                  {item.broadcastState === 0 ? (
                    <Icons.FileClock
                      /* size={32} */
                      strokeWidth={1}
                      color={token.colorTextSecondary}
                    />
                  ) : item.broadcastState === 4 ? (
                    <Icons.FileCheck2
                      /* size={32} */
                      strokeWidth={1}
                      color={token.colorSuccess}
                      fill={token.colorSuccessBg}
                    />
                  ) : item.broadcastState === 1 || item.broadcastState === 3 ? (
                    <Icons.FileX2
                      /* size={32} */
                      strokeWidth={1}
                      color={token.colorError}
                      fill={token.colorErrorBg}
                    />
                  ) : (
                    <Icons.FileCog
                      /* size={32} */ strokeWidth={1}
                      color={token.colorInfo}
                      fill={token.colorInfoBg}
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col ">
                  <Text strong>
                    {item.text.length > 50
                      ? ellipsisMid(item.text, 25)
                      : item.text}
                  </Text>
                  <Text type="secondary">{formatContentLength(item.size)}</Text>
                </div>
                <div className=" flex w-[150px] flex-col ">
                  <Text className="flex items-center">
                    {item.txidFromResp && (
                      <Text
                        type="secondary"
                        className=" ml-5 flex items-center gap-1"
                      >
                        <Icons.Ticket size={16} className="mt-[2px] inline" />:
                        <Link
                          target="_blank"
                          href={`https://mempool.space/${MEMPOOL_NETWORK}/tx/${item.txidFromResp}`}
                        >
                          transaction
                          <Icons.Link2 size={14} className="ml-1 inline" />
                        </Link>
                      </Text>
                    )}
                  </Text>
                  <Text className="flex items-center">
                    {item.txidFromResp && (
                      <Text
                        type="secondary"
                        className=" ml-5 flex items-center gap-1"
                      >
                        <Icons.Ordi size={16} className="mt-[2px] inline" />:
                        <Link
                          target="_blank"
                          href={inscriptionLink(item.txidFromResp)}
                        >
                          inscription
                          <Icons.Link2 size={14} className="ml-1 inline" />
                        </Link>
                      </Text>
                    )}
                  </Text>
                </div>
                <div className="flex w-[90px] items-center justify-end">
                  {BroadcastStates[item.broadcastState ?? (0 as number)]}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  )
}
