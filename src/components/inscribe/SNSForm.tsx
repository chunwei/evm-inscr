'use client';

import { useEffect, useState } from 'react'

import GradientButton from '@components/GradientButton'
import { LOCALSTORAGE_KEYS } from '@config/btc-config'
import { isSnsExist } from '@services/rest/api'
import { Button, Card, Col, Form, Input, RadioChangeEvent, Row, Space, Tag, Typography } from 'antd'
import useIsInIframe from 'src/hooks/useIsInIframe'
import { debounce } from 'src/utils/debounce'

import './index.scss'

const allowedDomains = [
  'sats',
  'btc',
  'xbt',
  'oxbt',
  'ord',
  'ai',
  'pepe',
  'pups',
  'gm',
  'magic',
  'meta',
  'unisat',
  'satoria',
  'x',
  'bitmap'
]

const dnsValidator = async (_: any, value: any) => {
  const values = `${value}`
    .split('\n')
    .map((t) => t.trim())
    .filter((t: string) => !!t)
  // 检查是否是支持的域名
  for (let i = 0; i < values.length; i++) {
    const subs = values[i].split('.')
    const notemptysubs = subs.filter((t: string) => !!t)
    const rootIdx = Math.max(1, subs.length - 1)
    const root = subs[rootIdx]
    if (notemptysubs.length < subs.length || !root || !allowedDomains.includes(root)) {
      // console.log('unsupport domain:', values[i])
      return Promise.reject(new Error('The domain name must end with the allowed domains listed above!'))
    }
  }
  // 检查是否被注册， todo：增加debounce
  const results: number[] = await isSnsExist(values)
  if (results.some((v) => v === 1)) {
    const errMsg = `These domain names have already been registered: ${JSON.stringify(
      results
        .map((v, i) => {
          if (v === 1) return values[i]
        })
        .filter((t) => !!t)
    )}`
    return Promise.reject(new Error(errMsg))
  } else {
    return Promise.resolve()
  }
}
const debouncedDnsValidator = debounce(dnsValidator, 300)

const { Text } = Typography
type SNSFormProps = IStepNav
export default function SNSForm(props: SNSFormProps) {
  const { stepNavFns } = props
  const { isInIframe } = useIsInIframe()
  const [curOp, setCurOp] = useState('.sats')
  const [form] = Form.useForm()
  const dnsVal = Form.useWatch('dns', form)
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
      const tmp = typeof v !== 'string' ? `${v}` : v
      values[key] = tmp.trim()
    })
    console.log(values)
    sessionStorage.setItem(LOCALSTORAGE_KEYS.inscription, JSON.stringify({ type: 'sns', values }))
    if (stepNavFns?.next) stepNavFns?.next()
  }

  const onReset = () => {
    form.resetFields()
  }
  const [submitDisabled, setSubmitDisabled] = useState(false)
  useEffect(() => {
    if (!dnsVal) return
    form
      .validateFields(['dns'], { validateOnly: false })
      .then(() => {
        setSubmitDisabled(false)
      })
      .catch(() => {
        setSubmitDisabled(true)
      })
  }, [form, dnsVal])

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
        {/* <Form.Item name="op" className="flex items-center justify-center" wrapperCol={{ span: 24 }}>
          <Segmented size="large" options={opTypes} onChange={onSegmentedChange} />
        </Form.Item> */}
        <Row className=" text-center">
          <Col span={24}>
            <Text>One domain per line.</Text>
          </Col>
          <Col span={18} offset={3}>
            <Text>Allowed Domains:</Text>
            <Space size={8} wrap>
              {allowedDomains.map((domain) => (
                <Tag key={domain} className="min-w-9" color="blue">
                  .{domain}
                </Tag>
              ))}
            </Space>
          </Col>
        </Row>
        <Form.Item
          label="Domains"
          name="dns"
          validateFirst={true}
          rules={[
            { required: true, message: 'Please input at least one domain to inscribe!' },
            {
              validator: debouncedDnsValidator
            }
          ]}
        >
          <Input.TextArea
            rows={6}
            placeholder={curOp === '.sats' ? 'ordi.sats\nbtc.sats\n...' : 'ordi.unisat\nbtc.unisat\n...'}
          />
        </Form.Item>

        <Form.Item label="" wrapperCol={{ span: 24 }} style={{ textAlign: 'center' }}>
          {isInIframe ? (
            <Button disabled={submitDisabled} type="primary" size="large" htmlType="submit" className="w-1/2">
              Submit
            </Button>
          ) : (
            <GradientButton disabled={submitDisabled} color="blue" htmlType="submit" className="w-1/2">
              Submit
            </GradientButton>
          )}
        </Form.Item>
      </Form>
    </Card>
  )
}