'use client';

import { useMemo, useState } from 'react';



import GradientButton from '@components/GradientButton';
import Icons from '@components/Icons';
import { IntegerSilderInput } from '@components/SliderInput';
import { LOCALSTORAGE_KEYS } from '@config/btc-config';
import { Button, Card, Form, Input, InputNumber, Radio, RadioChangeEvent, Segmented, Tag } from 'antd'
import useIsInIframe from 'src/hooks/useIsInIframe'
import { capital } from 'src/utils/string'

import './index.scss'


type BRC20FormProps = IStepNav
export default function BRC20Form(props: BRC20FormProps) {
  const { stepNavFns } = props
  const [curOp, setCurOp] = useState('mint')
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
    sessionStorage.setItem(LOCALSTORAGE_KEYS.inscription, JSON.stringify({ type: 'brc20', values }))
    if (stepNavFns?.next) stepNavFns?.next()
  }

  const onReset = () => {
    form.resetFields()
  }

  const opTypes = useMemo(() => ['deploy', 'mint', 'transfer'], [])
  const opRadioGroup = useMemo(
    () => (
      <Radio.Group buttonStyle="solid" onChange={onChange}>
        {opTypes.map((op) => (
          <Radio.Button value={op} key={op}>
            {capital(op)}
          </Radio.Button>
        ))}
      </Radio.Group>
    ),
    [opTypes]
  )

  const tabs = opTypes.map((it, i) => {
    return {
      label: `${it}`,
      key: it,
      children: `Content of Tab Pane ${it}`
    }
  })
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
        initialValues={{ p: 'brc-20', op: curOp, dec: 18, repeat: 1 }}
      >
        <Form.Item label="" name="p" style={{ display: 'none' }}>
          <Input hidden />
        </Form.Item>
        <Form.Item name="op" className="flex items-center justify-center" wrapperCol={{ span: 24 }}>
          <Segmented size="large" options={opTypes} onChange={onSegmentedChange} />
          {/* {opRadioGroup} */}
        </Form.Item>
        <Form.Item
          label="Tick"
          name="tick"
          tooltip={<ul><li>4 characters like <Tag bordered={false} color='blue'>ordi</Tag></li><li>case-insensitive</li></ul>}
          rules={[
            { required: true, message: 'Please input tick!' },
            { max: 4, message: 'Maximum tick length is 4' }
          ]}
        >
          <Input maxLength={4} type="string" />
        </Form.Item>
        {/** deploy */}
        {curOp === 'deploy' && (
          <>
            <Form.Item label="Supply" name="max" rules={[{ required: true, message: 'Please input max supply!' }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label="Limit" name="lim" rules={[{ required: true, message: 'Please input limit per mint!' }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label="Decimals" name="dec">
              <InputNumber />
            </Form.Item>
          </>
        )}
        {/** mint | transfer */}
        {['mint', 'transfer'].includes(curOp) && (
          <>
            <Form.Item label="Amount" name="amt" rules={[{ required: true, message: 'Please input amount!' }]}>
              <InputNumber />
            </Form.Item>
            <Form.Item label="Repeat" name="repeat">
              <IntegerSilderInput min={1} max={25} />
            </Form.Item>
          </>
        )}

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

          {/* <Button
						htmlType="button"
						type="link"
						onClick={onReset}
						style={{ position: 'absolute', right: 24 }}
					>
						Reset
					</Button> */}
        </Form.Item>
      </Form>
    </Card>
  )
}