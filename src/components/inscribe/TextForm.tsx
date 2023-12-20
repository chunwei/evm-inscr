'use client'

import { useMemo, useState } from 'react'

import GradientButton from '@components/GradientButton'
import Icons from '@components/Icons'
import { IntegerSilderInput } from '@components/SliderInput'
import { LOCALSTORAGE_KEYS } from '@config/btc-config'
import { Button, Card, Col, Form, Input, InputNumber, Radio, RadioChangeEvent, Row, Segmented, Typography } from 'antd'
import useIsInIframe from 'src/hooks/useIsInIframe'
import { capital } from 'src/utils/string'

import './index.scss'

const { Text } = Typography
type TextFormProps = IStepNav
export default function TextForm(props: TextFormProps) {
  const { stepNavFns } = props
  const [curOp, setCurOp] = useState('Single')
  const [form] = Form.useForm()
  const onChange = (e: RadioChangeEvent) => {
    setCurOp(e.target.value)
  }
  const onSegmentedChange = (value: any) => {
    setCurOp(value)
  }
  const onFinish = (formValues: any) => {
    const values: { [key: string]: string } = {}
    Object.keys(formValues).forEach((key) => {
      const v = formValues[key]
      values[key] = typeof v !== 'string' ? `${v}` : v
    })
    console.log(values)
    sessionStorage.setItem(LOCALSTORAGE_KEYS.inscription, JSON.stringify({ type: 'text', values }))
    if (stepNavFns?.next) stepNavFns?.next()
  }

  const onReset = () => {
    form.resetFields()
  }

  const opTypes = useMemo(() => ['Single', 'Bulk'], [])
  const { isInIframe } = useIsInIframe()
  return (
    <Card
      bordered={false}
      className="inscribe-card"
      // actions={[
      //   <Button
      //     htmlType="button"
      //     type="link"
      //     onClick={() => {
      //       if (stepNavFns?.next) stepNavFns?.next()
      //     }}
      //     // style={{ position: 'absolute', left: 24 }}
      //   >
      //     <Icons.ArrowRight size={16} className="mr-2 inline" /> Next
      //   </Button>
      // ]}
    >
      <Form
        className="inscribe-form"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onReset={onReset}
        initialValues={{ op: curOp }}
      >
        <Form.Item name="op" className="flex items-center justify-center" wrapperCol={{ span: 24 }}>
          <Segmented size="large" options={opTypes} onChange={onSegmentedChange} />
        </Form.Item>
        <Row className=" text-center">
          <Col span={24}>
            <Text>If single, we will inscribe exactly what is there.</Text>{' '}
          </Col>
          <Col span={24}>
            <Text>If bulk, we will inscribe one for every new line. </Text>
          </Col>
        </Row>
        <Form.Item
          label="Text"
          name="text"
          rules={[{ required: true, message: 'Please input any text you want to inscribe!' }]}
        >
          <Input.TextArea rows={6} placeholder={curOp === 'Single' ? 'any text here' : 'abcd\nhello\n123\n...'} />
        </Form.Item>

        <Form.Item label="" wrapperCol={{ span: 24 }} style={{ textAlign: 'center' }}>
          {isInIframe ? (
            <Button type="primary" size="large" htmlType="submit" className="w-1/2">
              Submit
            </Button>
          ) : (
            <GradientButton color="blue" htmlType="submit" className="w-1/2">
              Submit
            </GradientButton>
          )}
        </Form.Item>
      </Form>
    </Card>
  )
}
