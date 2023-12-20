/*
 * @Author: luchunwei luchunwei@gmail.com
 * @Date: 2023-05-11 15:42:16
 * @LastEditors: luchunwei luchunwei@gmail.com
 * @LastEditTime: 2023-05-12 12:26:29
 * @FilePath: /ele-bit-ord/src/components/inscribe/FeePicker.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useCallback, useEffect, useMemo, useState } from 'react';



import Icons from '@components/Icons';
import { IntegerSilderInput } from '@components/SliderInput';
import { getRecommendedFeeRates } from '@services/rest/api';
import { useQuery } from '@tanstack/react-query';
import { FeeLevel } from '@types';
import { Card, Col, Row, Typography, theme } from 'antd';
import { formatTime } from 'src/utils/string'

import './FeePicker.scss'



import CardHover from './CardHover';


const { useToken } = theme
const { Title, Text } = Typography

interface FeePickerProps {
  value?: FeeLevel | string
  onChange?: (value: FeeLevel) => void
}
export default function FeePicker({ value, onChange }: FeePickerProps) {
  const { token } = useToken()
  const {
    data: recommended,
    isLoading,
    isFetching,
    error
  } = useQuery({
    queryKey: ['recommendedFeeRates'],
    queryFn: () => getRecommendedFeeRates()
  })
  const levels = useMemo(
    () => ({
      slow: { feeRate: recommended?.economyFee ?? 20, color: '#f97066', est: 'Within hours to days' }, // red
      normal: { feeRate: recommended?.hourFee ?? 50, color: '#fdb022', est: 'Within an hour' }, // yellow
      fast: { feeRate: recommended?.fastestFee ?? 80, color: '#32d583', est: 'Within 30 mins' } // green
    }),
    [recommended]
  )
  const getColor = useCallback(
    (feeRate: any) => {
      if (!feeRate) return undefined
      if (feeRate < levels.slow.feeRate) return token.colorError //  levels.slow.color
      if (feeRate < levels.normal.feeRate) return token.colorWarning // levels.normal.color
      // between normal and fast display theme.colorPrimary, default blue
      if (feeRate < levels.fast.feeRate) return token.colorInfo
      // if (feeRate >= levels.fast)
      return token.colorSuccess // levels.fast.color
    },
    [levels, token.colorError, token.colorWarning, token.colorInfo, token.colorSuccess]
  )

  const getEst = useCallback(
    (feeRate: any) => {
      if (!feeRate) return undefined
      if (feeRate < levels.slow.feeRate) return levels.slow.est
      if (feeRate < levels.normal.feeRate) return 'Within a few hours'
      // between normal and fast display theme.colorPrimary, default blue
      if (feeRate < levels.fast.feeRate) return levels.normal.est
      // if (feeRate >= levels.fast)
      return levels.fast.est
    },
    [levels]
  )

  const [custom, setCustom] = useState<FeeLevel>({
    level: 'Custom',
    feeRate: levels.fast.feeRate,
    estimate: 610,
    est: levels.fast.est
  })
  const networkFeeLevels: FeeLevel[] = useMemo(
    () => [
      { level: 'Economy', feeRate: levels.slow.feeRate, estimate: 6006, est: levels.slow.est },
      { level: 'Normal', feeRate: levels.normal.feeRate, estimate: 1600, est: levels.normal.est },
      { ...custom }
    ],
    [custom, levels.normal.est, levels.normal.feeRate, levels.slow.est, levels.slow.feeRate]
  )
  const getByLevel = useCallback(
    (level: string) => {
      return networkFeeLevels.find((fl) => fl.level === level)
    },
    [networkFeeLevels]
  )

  const initValue = typeof value === 'string' ? getByLevel(value) : value
  const [selected, setSelected] = useState(initValue || networkFeeLevels[1])
  const colorPrimary = useMemo(() => getColor(selected.feeRate), [getColor, selected])

  const onClick = useCallback(
    (value: FeeLevel) => {
      setSelected(value)
      if (onChange) onChange(value)
    },
    [onChange]
  )

  const onFeeRateChange = useCallback(
    (feeRate: number | null) => {
      if (feeRate) {
        const est = getEst(feeRate) ?? selected.est
        const value = { ...selected, feeRate, est }
        onClick(value)
        setCustom(value)
      }
    },
    [getEst, onClick, selected]
  )

  useEffect(() => {
    console.log('recommended changed', recommended)
    if (onChange) onChange(selected)
  }, [onChange, onFeeRateChange, recommended, selected])

  return (
    <>
      <Row gutter={24} className="px-3 py-2">
        {networkFeeLevels.map((item, index) => {
          const { level, feeRate, est } = item
          return (
            <Col span={8} key={level + '_' + index}>
              <CardHover
                key={level + '_' + index}
                title={level}
                headStyle={{ textAlign: 'center' }}
                hoverable
                active={selected.level === level}
                // bordered={false}
                className={`picker-card min-w-max hover:dark:bg-black`}
                onClick={() => onClick(item)}
              >
                <div className="flex min-w-[136px] flex-col justify-center">
                  <Title level={3} type="warning" className=" text-center">
                    {feeRate} <Text>sats/vB</Text>
                  </Title>
                  <Text type="secondary" className=" text-center">
                    {est /* formatTime(estimate) */}
                  </Text>
                </div>
              </CardHover>
            </Col>
          )
        })}
      </Row>
      {selected.level === 'Custom' && (
        <Row gutter={24} className="px-3 py-6">
          <Col span={24}>
            <IntegerSilderInput
              min={recommended?.minimumFee ?? 1}
              max={500}
              value={selected.feeRate}
              onChange={onFeeRateChange}
              colorPrimary={colorPrimary}
            />
          </Col>
        </Row>
      )}
      <Row gutter={2} className="px-3 py-2">
        <Col span={24}>
          <Text type="warning" className="flex items-center justify-center">
            <Icons.AlertTriangle size={20} style={{ display: 'inline', marginRight: 8 }} />
            The current Bitcoin network is highly congested. please be patient and wait.
          </Text>
          <Text className="flex items-center justify-center">
            Times shown are not guaranteed. USD values are estimates only.
          </Text>
        </Col>
      </Row>
    </>
  )
}