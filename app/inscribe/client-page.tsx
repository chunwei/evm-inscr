'use client'

import GradientText from '@components/GradentText'
import BRC20Form from '@components/inscribe/BRC20'
import FeeForm from '@components/inscribe/FeeForm'
import FileForm from '@components/inscribe/FileForm'
import OrderList from '@components/inscribe/OrderList'
import PayStep from '@components/inscribe/PayStep'
import SNSForm from '@components/inscribe/SNSForm'
import TextForm from '@components/inscribe/TextForm'
import { getRecommendedFeeRates } from '@services/rest/api'
import { useQuery } from '@tanstack/react-query'
import { Button, Steps, Tabs, Typography, message, theme } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import useIsInIframe from 'src/hooks/useIsInIframe'

const { Text } = Typography
const { useToken } = theme
export default function InscribePage() {
  const { token } = useToken()
  const [current, setCurrent] = useState(0)
  const [curType, setCurType] = useState('brc-20')
  const payStepRef = useRef<HTMLDivElement>(null)
  const scrollToView = () => {
    if (payStepRef.current) {
      payStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
  const { isInIframe } = useIsInIframe()
  useEffect(() => {
    if (current === 2) scrollToView()
  }, [current])

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['recommendedFeeRates'],
    queryFn: () => getRecommendedFeeRates()
  })
  // console.log('recommendedFeeRates', data, isLoading, isFetching, error)

  const onChange = (key: string) => {
    setCurType(key)
    console.log(key)
  }
  const onStepChange = (stepN: number) => {
    // 只允许跳回第一步
    if (stepN === 0) setCurrent(stepN)
  }
  const go = (stepN: number) => {
    setCurrent(stepN)
    if (stepN === 2) scrollToView()
  }
  const next = () => {
    setCurrent(current + 1)
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const tabPanes = [BRC20Form, FileForm, TextForm, SNSForm]
  const inscriptionTypes = ['brc-20', 'files', 'text', 'sns' /* , 'orc-20' */]
  const tabs = inscriptionTypes.map((it, i) => {
    const Pane = tabPanes[i]
    return {
      label: `${it}`,
      key: it,
      children: Pane ? (
        <Pane stepNavFns={{ next, prev }} />
      ) : (
        `Content of Tab Pane ${it}`
      )
    }
  })

  const gradTextColors = useMemo(
    () => [
      { start: '#007CF0', end: '#00DFD8' },
      { start: '#7928CA', end: '#FF0080' },
      { start: '#FF4D4D', end: '#F9CB28' }
    ],
    []
  )
  const colorsSize = gradTextColors.length
  const stepsTitle = useMemo(() => ['Populate', 'Fees', 'Pay & Inscribe'], [])
  const steps = useMemo(
    () =>
      stepsTitle.map((title, idx) => {
        const i = idx % colorsSize
        return {
          key: title,
          title:
            idx === current ? (
              isInIframe ? (
                <Text strong style={{ color: token.colorPrimaryText }}>
                  {title}
                </Text>
              ) : (
                <GradientText
                  content={title}
                  startColor={gradTextColors[i].start}
                  endColor={gradTextColors[i].end}
                  bgClass="text-[18px]"
                />
              )
            ) : (
              title
            )
        }
      }),
    [
      colorsSize,
      current,
      gradTextColors,
      isInIframe,
      stepsTitle,
      token.colorPrimaryText
    ]
  )

  return (
    <section className="inscribe-page container grid items-center gap-6 pb-8 pt-6 md:py-10">
      {!isInIframe && (
        <h3 className="text-center text-3xl font-extrabold !leading-tight tracking-tighter ">
          {/* <span className="bg-gradient-to-r from-blue-600 from-0% via-red-500 via-60% to-amber-300 to-100% bg-clip-text text-transparent"> */}
          <span className="gradient-text retro-3">description</span>
        </h3>
      )}
      <div className="flex justify-center">
        <Steps
          onChange={onStepChange}
          current={current}
          items={steps}
          progressDot
          labelPlacement="vertical"
          className="w-[800px]"
        />
      </div>
      <div className="step-content">
        {current === 0 && (
          <Tabs
            activeKey={curType}
            onChange={onChange}
            centered
            type="card"
            items={tabs}
          />
        )}
        {current === 1 && (
          <div className="flex justify-center">
            <FeeForm stepNavFns={{ next, prev, go }} />
          </div>
        )}
        {current === 2 && (
          <div className="flex justify-center">
            <PayStep stepNavFns={{ next, prev, go }} ref={payStepRef} />
          </div>
        )}
      </div>
      <div className="mb-4 flex justify-center">
        <OrderList stepNavFns={{ next, prev, go }} />
      </div>
      <div style={{ marginTop: 24 }}>
        {/* {current > 0 && (
					<Button style={{ margin: '0 8px' }} onClick={() => prev()}>
						Back
					</Button>
				)}
				{current < steps.length - 1 && (
					<Button type="primary" onClick={() => next()}>
						Next
					</Button>
				)} */}
        {/* {current === steps.length - 1 && (
					<Button
						type="primary"
						onClick={() => message.success('Processing complete!')}
					>
						Done
					</Button>
				)} */}
      </div>
    </section>
  )
}
