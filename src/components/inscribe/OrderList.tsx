import { LOCALSTORAGE_KEYS } from '@config/btc-config'
import { RootState } from '@redux/reducers'
import { setCurOrder, setReceiveAddresses } from '@redux/slices/common'
import { useAppDispatch, useAppSelector } from '@redux/store'
import { queryOrders } from '@services/rest/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IOrder } from '@types'
import { Card, List, Typography } from 'antd'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { useCallback, useEffect, useState } from 'react'

const { Title, Text } = Typography

type OrderListProps = IStepNav

export default function OrderList(props: OrderListProps) {
  const locale = 'en-US'
  dayjs.locale(locale)
  dayjs.extend(LocalizedFormat)

  const { stepNavFns } = props
  const [orders, setOrders] = useState<IOrder[]>([])
  const { newOrderCount, receiveAddresses } = useAppSelector(
    (state: RootState) => ({
      newOrderCount: state.common.newOrderCount,
      receiveAddresses: state.common.receiveAddresses
    })
  )

  const queryClient = useQueryClient()
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => queryOrders(Array.from(receiveAddresses)),
    enabled: receiveAddresses.length > 0
  })

  const dispatch = useAppDispatch()

  useEffect(() => {
    console.log('query orders done')
    if (!data) {
      const cache = localStorage.getItem(LOCALSTORAGE_KEYS.orders)
      if (cache) {
        const orders = JSON.parse(cache) // .reverse()
        setOrders(orders)
        const ras = Array.from(
          new Set<string>(
            orders.map(
              (order: { receiveAddress: string }) => order.receiveAddress
            )
          )
        )
        dispatch(setReceiveAddresses(ras))
      }
    } else {
      setOrders(data.sort((a, b) => b.createTimestamp - a.createTimestamp))
    }
  }, [data, dispatch])

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }, [newOrderCount, queryClient, receiveAddresses])

  const onClick = useCallback(
    (order: IOrder) => {
      dispatch(setCurOrder(order))
      if (stepNavFns?.go) stepNavFns.go(2)
    },
    [dispatch, stepNavFns]
  )

  return (
    <Card bordered={false} className="inscribe-card">
      <Title level={4} className="mb-4 text-center">
        Orders History
      </Title>
      <List
        // loading={isLoading}
        className=" w-[800px]"
        grid={{ gutter: 16, column: 1 }}
        dataSource={orders}
        pagination={{
          onChange: (page) => {
            //   console.log(page);
          },
          pageSize: 3
        }}
        renderItem={(item: any, idx) => (
          <List.Item key={idx}>
            <Card
              onClick={() => {
                onClick(item)
              }}
              hoverable
              className="hover:bg-neutral-100 hover:shadow-md dark:hover:bg-neutral-800"
              bodyStyle={{ padding: 12 }}
            >
              {/* <Card.Meta title={item.orderId} description={item.createTimestamp} /> */}
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <Title level={5}>{item.orderId}</Title>
                  <Text type="secondary">
                    {dayjs(item.createTimestamp).format('LL LTS')}
                  </Text>
                </div>
                <div className="flex items-center">{item.status}</div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  )
}
