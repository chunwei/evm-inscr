'use client'

import IFrame from '@components/IFrame'
import Icons from '@components/Icons'
import {
  getInscriptionContentUrl,
  queryOrdinalsByAddress
} from '@services/rest/api'
import { useQuery } from '@tanstack/react-query'
import { Card, Divider, List, Typography, message } from 'antd'
import Meta from 'antd/es/card/Meta'
import Search from 'antd/es/input/Search'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import { useCallback, useState } from 'react'

dayjs.extend(relativeTime)

const { Title, Text } = Typography

export default function OrdinalsPage() {
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['queryOrdinalsByAddress', address],
    queryFn: () => queryOrdinalsByAddress(address),
    enabled: !!address
  })
  //   console.log('search results:', data)
  const onReset = useCallback(() => {
    setAddress('')
    setSearching(false)
  }, [])
  const onSearch = useCallback(
    async (value: string) => {
      // validate first
      setAddress(value)
      setSearching(true)
      console.log(value)
      await queryOrdinalsByAddress(address).catch((error) => {
        setSearching(false)
        message.error(error)
      })
      setSearching(false)
    },
    [address]
  )

  return (
    <section className="inscribe-page container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Title className="text-center ">marketplace description</Title>
      {/* <span className="bg-gradient-to-r from-blue-600 from-0% via-red-500 via-60% to-amber-300 to-100% bg-clip-text text-transparent">
          {t('desc')}
        </span> */}
      <div className="flex justify-center">
        <div className="w-full md:w-[800px]">
          <Search
            placeholder="bc1p3t...sgqs6f"
            allowClear
            enterButton
            size="large"
            onReset={onReset}
            onSearch={onSearch}
            loading={searching}
            name="address"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <Card
          bordered
          className=" border-none bg-transparent"
          bodyStyle={{ padding: 0 }}
        >
          <Divider>
            <span className=" gradient-text retro-3">Owned Ordinals</span>
          </Divider>
          <List
            className=" w-[880px] items-stretch"
            grid={{ gutter: 16, column: 4 }}
            dataSource={data}
            pagination={{
              onChange: (page) => {
                //   console.log(page);
              },
              pageSize: 12
            }}
            renderItem={(item: any, idx) => (
              <List.Item key={idx}>
                <Link
                  target="_blank"
                  href={`/inscription/${item.mintTxHash}i0`}
                >
                  <Card
                    size="small"
                    hoverable
                    className="ordi-card group h-full border-slate-300 hover:shadow-none dark:border-slate-600"
                    // bodyStyle={{ padding: '12px 16px' }}
                    cover={
                      <IFrame
                        src={getInscriptionContentUrl(item.mintTxHash)}
                        className="pointer-events-none h-[188px] max-h-[208px] w-[208px] scale-90 rounded-lg border border-slate-200 transition-all duration-300 group-hover:scale-100 group-hover:border-slate-200/10 dark:border-slate-700 dark:group-hover:border-slate-700/10"
                      />
                    }
                  >
                    <Meta
                      title={'# ' + item.inscrNo}
                      description={dayjs(item.timestamp * 1000).fromNow()}
                    />
                  </Card>
                </Link>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </section>
  )
}
