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
import { ellipsisMid } from 'src/utils/string'

dayjs.extend(relativeTime)

const { Title, Text } = Typographyw
interface ClientPageProps {
  params: { address: string }
  searchParams: { [key: string]: string | undefined }
}
export default function OrdinalsPage({ params }: ClientPageProps) {
  const { address } = params

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['queryOrdinalsByAddress', address],
    queryFn: () => queryOrdinalsByAddress(address),
    enabled: !!address
  })

  return (
    <section className="inscribe-page container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Title className="text-center" title={address}>
        {ellipsisMid(address, 10)}
      </Title>

      <div className="flex justify-center">
        <Card
          bordered
          className=" border-none bg-transparent"
          bodyStyle={{ padding: 0 }}
        >
          <Divider>
            <span className=" gradient-text retro-2">Owned Ordinals</span>
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
                        className=" pointer-events-none h-[188px] max-h-[208px] w-[208px] scale-90 rounded-lg border border-slate-200 transition-all duration-300 group-hover:scale-100 group-hover:border-slate-200/10 dark:border-slate-700 dark:group-hover:border-slate-700/10"
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
