'use client'

import './Inscription.scss'
import IFrame from '@components/IFrame'
import Icons from '@components/Icons'
import { MEMPOOL_NETWORK } from '@config/btc-config'
import { getInscriptionContentUrl } from '@services/rest/api'
import { InscriptionRes } from '@types'
import { Card, Descriptions, Typography } from 'antd'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'

const { Text } = Typography

interface InscriptionCardProps {
  inscription: InscriptionRes
}
export default function InscriptionCard(props: InscriptionCardProps) {
  const locale = 'en-US'
  dayjs.locale(locale)
  dayjs.extend(LocalizedFormat)

  const { inscription } = props
  const {
    inscrNo,
    blockNumber,
    owner,
    mintTxHash,
    contentType = 'text/plain',
    timestamp
  } = inscription
  const mimetypeIcon = useMemo(() => {
    if (contentType.startsWith('text')) {
      return <Icons.Type size={14} className="mt-[1px] inline" />
    } else if (contentType.startsWith('image')) {
      return <Icons.Image size={14} className="mt-[1px] inline" />
    } else if (contentType.startsWith('video')) {
      return <Icons.Video size={14} className="mt-[1px] inline" />
    } else if (contentType.startsWith('audio')) {
      return <Icons.Music size={14} className="mt-[1px] inline" />
    } else if (contentType.startsWith('model')) {
      return <Icons.Move3d size={14} className="mt-[1px] inline" />
    } else if (contentType.startsWith('font')) {
      return <Icons.Type size={14} className="mt-[1px] inline" />
    } else {
      return <Icons.Type size={14} className="mt-[1px] inline" />
    }
  }, [contentType])

  return (
    <div className="inscription flex flex-col gap-3">
      <Card className=" max-w-3xl bg-transparent">
        <IFrame
          objectFit="contain"
          src={getInscriptionContentUrl(mintTxHash)}
          className="w-full"
        />
      </Card>
      <Card className=" max-w-3xl">
        <Descriptions
          title="Inscription Info"
          layout="vertical"
          size="small"
          column={1}
        >
          <Descriptions.Item label="inscription number">
            <Text className=" ml-5 flex items-center gap-2">
              <Icons.Hash size={14} className="mt-[1px] inline" /> {inscrNo}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="block number">
            <Text className=" ml-5 flex items-center gap-2">
              <Icons.Box size={14} className="mt-[1px] inline" />
              <Link
                target="_blank"
                href={`https://mempool.space/${MEMPOOL_NETWORK}/block/${blockNumber}`}
              >
                {blockNumber}
                <Icons.Link2 size={14} className="ml-1 inline" />
              </Link>
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="owner">
            <Text className=" ml-5 flex items-center gap-2">
              <Icons.User size={16} className="mt-[2px] inline" />
              <Link
                target="_blank"
                href={`https://mempool.space/${MEMPOOL_NETWORK}/address/${owner}`}
              >
                {owner}
                <Icons.Link2 size={14} className="ml-1 inline" />
              </Link>
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="content type">
            <Text className=" ml-5 flex items-center gap-2">
              {mimetypeIcon} {contentType}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="content">
            <Text className=" ml-5 flex items-center gap-2">
              <Icons.Eye size={16} className="mt-[2px] inline" />
              <Link target="_blank" href={`/inscription/content/${mintTxHash}`}>
                content
                <Icons.Link2 size={14} className="ml-1 inline" />
              </Link>
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="genesis transaction">
            <Text className=" ml-5 flex items-center gap-2">
              <Icons.Ticket size={16} className="mt-[2px] inline" />
              <Link
                target="_blank"
                href={`https://mempool.space/${MEMPOOL_NETWORK}/tx/${mintTxHash}`}
              >
                {mintTxHash}
                <Icons.Link2 size={14} className="ml-1 inline" />
              </Link>
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="created">
            <Text className=" ml-5 flex items-center gap-2">
              <Icons.Clock size={16} className="mt-[1px] inline" />{' '}
              {dayjs(timestamp * 1000).format('LL LTS')}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
