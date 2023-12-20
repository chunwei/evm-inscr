'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';



import Icon from '@ant-design/icons/lib/components/Icon';
import GradientButton from '@components/GradientButton';
import Icons from '@components/Icons';
import { IntegerSilderInput } from '@components/SliderInput';
import { useWalletContext } from '@components/wallet/context/WalletContext';
import { DEFAULT_PADDING_546, LOCALSTORAGE_KEYS } from '@config/btc-config';
import { addReceiveAddress, increaseNewOrderCount, setCurOrder } from '@redux/slices/common';
import { useAppDispatch } from '@redux/store';
import { createOrder, queryConfig } from '@services/rest/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FeeLevel, IFees, IFile } from '@types';
import { Alert, Avatar, Button, Card, Divider, Form, Input, InputNumber, List, Radio, RadioChangeEvent, Space, Table, Tooltip, Typography } from 'antd';
import localforage from 'localforage';
import useIsInIframe from 'src/hooks/useIsInIframe';
import { calcFees, calcFees_as_unisat, isValidTaprootAddress, textToHex } from 'src/utils/inscription';
import { capital, ellipsisMid, formatByteLength, formatContentLength, getByteLength } from 'src/utils/string';



import './index.scss';



import FeeItem from './FeeItem';
import FeePicker from './FeePicker';


const { Title, Text, Paragraph } = Typography

function updateLocalOrders(order: any) {
  const cache = localStorage.getItem(LOCALSTORAGE_KEYS.orders)
  const localOrders: any[] = cache ? JSON.parse(cache) : []
  localOrders.unshift(order)
  localStorage.setItem(LOCALSTORAGE_KEYS.orders, JSON.stringify(localOrders))
}

type FeeFormProps = IStepNav
export default function FeeForm(props: FeeFormProps) {
  const { stepNavFns } = props
  const dispatch = useAppDispatch()
  const [editSatsInside, setEditSatsInside] = useState(false)
  const [loading, setLoading] = useState(false)
  const [satsInside, setSatsInside] = useState<Nullable<number>>(546)
  const [serviceFee, setServiceFee] = useState(1000)
  const [networkFee, setNetworkFee] = useState(5)
  const [fees, setFees] = useState<IFees>({
    networkFee: 0,
    serviceFee: 0,
    feeBySize: 0,
    discountedFee: 0,
    totalFee: 0,
    amount: 0
  })
  const [feeRate, setFeeRate] = useState(1)
  const [batchSize, setBatchSize] = useState(1)
  const [networkFeeLevel, setNetworkFeeLevel] = useState('Normal')
  const [form] = Form.useForm()
  // const [previewList, setPreviewList] = useState<any[]>([])
  const [files, setFiles] = useState<IFile[]>([])

  const { sats2usd, address, xverseAddresses, walletName } = useWalletContext()

  const {
    data: globalConfig,
    isLoading,
    isFetching,
    error
  } = useQuery({
    queryKey: ['globalConfig'],
    queryFn: () => queryConfig()
  })

  useEffect(() => {
    const cacheStr = sessionStorage.getItem(LOCALSTORAGE_KEYS.inscription)
    if (cacheStr) {
      try {
        const cacheData = JSON.parse(cacheStr)
        const pList = []
        const files: IFile[] = []
        const { type } = cacheData
        let repeat = 1
        switch (type) {
          case 'brc20':
            {
              const mimetype = 'text/plain;charset=utf-8'
              const values = cacheData.values
              repeat = values.repeat ?? 1
              delete values.repeat
              const text = JSON.stringify(values)
              const size = getByteLength(text)
              const hex = textToHex(text)
              for (let i = 0; i < repeat; i++) {
                // pList.push({ ...values })
                files.push({ name: 'brc-20-op', text, size, hex, mimetype })
              }
            }
            break
          case 'files':
            {
              localforage.getItem(LOCALSTORAGE_KEYS.inscription).then((valueStr) => {
                if (valueStr) {
                  const cacheFiles = JSON.parse(valueStr as string)
                  const fileList = cacheFiles.fileList
                  repeat = fileList.length
                  for (let i = 0; i < fileList.length; i++) {
                    const file = fileList[i]
                    let mimetype = file.type
                    if (mimetype.includes('text/plain')) {
                      mimetype += ';charset=utf-8'
                    }
                    // pList.push({ ...file })
                    files.push({ name: file.name, text: file.name, size: file.size, hex: file.hex, mimetype })
                  }
                  setFiles(files)
                  setBatchSize(repeat)
                  console.log('files', files)
                }
              })
            }
            break
          case 'text':
            {
              const mimetype = 'text/plain;charset=utf-8'
              const values = cacheData.values
              const { op, text: originText } = values
              const texts =
                op === 'Single'
                  ? [originText]
                  : originText
                      .split('\n')
                      .map((t: string) => t.trim())
                      .filter((t: string) => !!t)
              repeat = texts.length
              for (let i = 0; i < texts.length; i++) {
                const text = texts[i]
                const size = getByteLength(text)
                const hex = textToHex(text)
                files.push({ name: 'text', text, size, hex, mimetype })
              }
            }
            break
          case 'sns':
            {
              const mimetype = 'text/plain;charset=utf-8'
              const values = cacheData.values
              const { op, dns: originDns } = values
              const domains = originDns
                .split('\n')
                .map((t: string) => t.trim())
                .filter((t: string) => !!t)
              repeat = domains.length
              for (let i = 0; i < domains.length; i++) {
                const domain = { p: 'sns', op: 'reg', name: domains[i] }
                const text = JSON.stringify(domain)
                const size = getByteLength(text)
                const hex = textToHex(text)
                files.push({ name: domains[i], text, size, hex, mimetype })
              }
            }
            break
        }

        // files类型走indexdb异步加载
        if (type !== 'files') {
          setFiles(files)
          setBatchSize(repeat)
          console.log('files', files)
        }
      } catch (error) {
        console.error(error)
      }
    }

    // if (valuesJson) {
    //   try {
    //     const mimetype = 'text/plain;charset=utf-8'
    //     const values = JSON.parse(valuesJson)
    //     const repeat = values.repeat ?? 1
    //     delete values.repeat
    //     const text = JSON.stringify(values)
    //     const size = getByteLength(text)
    //     const hex = textToHex(text)
    //     const pList = []
    //     const files: IFile[] = []
    //     for (let i = 0; i < repeat; i++) {
    //       pList.push({ ...values })
    //       files.push({ name: 'brc-20-op', text, size, hex, mimetype })
    //     }
    //     setPreviewList(pList)
    //     setFiles(files)
    //     setBatchSize(repeat)
    //     console.log('files', files)
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
  }, [])

  const onFeeRateChange = (feeLevel: FeeLevel) => {
    setFeeRate(feeLevel.feeRate)
    setNetworkFeeLevel(feeLevel.level)
  }
  // 计算各项费用
  useEffect(() => {
    // const fees = calcFees(feeRate, satsInside ?? DEFAULT_PADDING_546, files)
    const fees = calcFees_as_unisat({
      fileSize: files.reduce((sum, cur) => sum + cur.size, 0),
      mintRate: feeRate,
      fileCount: batchSize,
      inscriptionBalance: satsInside ?? DEFAULT_PADDING_546,
      serviceFeePerFile: globalConfig?.ordinalServiceFee
    })
    setFees(fees)
    console.log('fees', fees)
  }, [batchSize, feeRate, files, globalConfig?.ordinalServiceFee, satsInside])

  const onChange = (e: RadioChangeEvent) => {
    setNetworkFeeLevel(e.target.value)
  }
  const onSatsInsideChange = (value: number | null) => {
    // form.setFieldValue('satsInside', value)
    setSatsInside(value)
  }
  const onFinish = useCallback(
    async (values: any) => {
      console.log(values)
      console.log('walletName', walletName)
      const isXverse = walletName === 'xverse'
      const orderParams = {
        files,
        fees,
        receiveAddress: values.recipient,
        inscriptionBalance: satsInside ?? 546,
        feeRate,
        userPayAddress: isXverse ? xverseAddresses?.payment.address : undefined,
        userPayPubkey: isXverse ? xverseAddresses?.payment.publicKey : undefined
      }
      try {
        setLoading(true)
        const order = await createOrder(orderParams)
        console.log(order)
        updateLocalOrders(order)
        dispatch(setCurOrder(order))
        dispatch(increaseNewOrderCount())
        dispatch(addReceiveAddress(order.receiveAddress))
        setLoading(false)
        if (stepNavFns?.next) stepNavFns?.next()
      } catch (error) {
        setLoading(false)
        console.error(error)
      }
    },
    [
      dispatch,
      feeRate,
      fees,
      files,
      satsInside,
      stepNavFns,
      walletName,
      xverseAddresses?.payment.address,
      xverseAddresses?.payment.publicKey
    ]
  )

  const onReset = () => {
    form.resetFields()
  }

  const networkFeeLevels = useMemo(() => ['Economy', 'Normal', 'Custom'], [])
  const networkFeeRadioGroup = useMemo(
    () => (
      <Radio.Group optionType="button" buttonStyle="outline" onChange={onChange}>
        {networkFeeLevels.map((op, index) => (
          <Radio.Button value={op} key={op + index} style={{ height: 'auto', borderRadius: 12, margin: 12 }}>
            <div className="p-2">
              <Text strong>{capital(op)}</Text>
              <Title level={3} type="warning">
                20 <Text>sats/vB</Text>
              </Title>
              <Text type="secondary">6hrs</Text>
            </div>
          </Radio.Button>
        ))}
      </Radio.Group>
    ),
    [networkFeeLevels]
  )

  // const tabs = opTypes.map((it, i) => {
  // 	return {
  // 		label: `${it}`,
  // 		key: it,
  // 		children: `Content of Tab Pane ${it}`
  // 	}
  // })

  const previewList_Examples = [
    { p: 'brc-20', op: 'mint', tick: 'pepe', amt: '1000' },
    { p: 'brc-20', op: 'mint', tick: 'ordi', amt: '500' },
    { p: 'brc-20', op: 'mint', tick: 'punk', amt: '1000' }
    // { p: 'brc-20', op: 'mint', tick: 'pepe', amt: '1000' },
    // { p: 'brc-20', op: 'mint', tick: 'ordi', amt: '500' },
    // { p: 'brc-20', op: 'mint', tick: 'punk', amt: '1000' },
    // { p: 'brc-20', op: 'mint', tick: 'pepe', amt: '1000' },
    // { p: 'brc-20', op: 'mint', tick: 'ordi', amt: '500' },
    // { p: 'brc-20', op: 'mint', tick: 'ordi', amt: '500' },
    // { p: 'brc-20', op: 'mint', tick: 'ordi', amt: '500' },
    // { p: 'brc-20', op: 'mint', tick: 'ordi', amt: '500' },
    // { p: 'brc-20', op: 'mint', tick: 'punk', amt: '1000' }
  ]

  const { isInIframe } = useIsInIframe()

  return (
    <Card
      bordered={false}
      className="inscribe-card"
      title={<Text type="secondary">
      You are about to inscribe <Text strong>{batchSize}</Text> item(s).
    </Text>}
      extra={[
        <Button
          key="gofirstbtn"
          htmlType="button"
          type="link"
          onClick={() => {
            if (stepNavFns?.prev) stepNavFns?.prev()
          }}
          // style={{ position: 'absolute', left: 24 }}
        >
          <Icons.ArrowLeft size={16} className="mr-2 inline" /> Back
        </Button>
        // <Button
        //   htmlType="button"
        //   type="link"
        //   onClick={() => {
        //     if (stepNavFns?.next) stepNavFns?.next()
        //   }}
        // >
        //   <Icons.ArrowRight size={16} className="mr-2 inline" /> Next
        // </Button>
      ]}
    >
      <Space direction="vertical">
        {/* <Title level={5}>Please double check your names below before continuing:</Title> */}
        <Text type="secondary">Please double check before continuing, we take no responsibility for typos or wrong punctuation.</Text>
      </Space>
      <div className="mb-4 max-h-64 overflow-y-auto px-[1px]" style={{ width: '100%' }}>
        <List
          itemLayout="horizontal"
          dataSource={files}
          split={false}
          renderItem={(item, index) => {
            const { text, size } = item
            // const json = JSON.stringify(item)
            return (
              <List.Item
                key={`filekey-${index}`}
                className="mx-0 my-2 overflow-hidden rounded  shadow ring-1 ring-slate-900/5 dark:ring-slate-100/20"
                style={{ padding: '0 8px' }}
              >
                <div className="border-r border-slate-400/20 py-2 pr-2">
                  <Avatar size="small">{index + 1}</Avatar>
                </div>
                <Text title={text} /*  copyable={{ icon: <Icons.Copy size={16} className="inline" /> }} */>
                  {text?.length < 90 ? text : ellipsisMid(text, 45)}
                </Text>
                <div className="border-l border-slate-400/20 py-2 pl-2">
                  <Text type="secondary">{formatContentLength(size)}</Text>
                </div>
              </List.Item>
            )
          }}
        />
      </div>
      <Form
        className="inscribe-form"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onReset={onReset}
        initialValues={{
          p: 'brc-20',
          networkFeeLevel,
          networkFee,
          dec: 18,
          recipient: address,
          satsInside // : 546
        }}
      >
        <Form.Item
          label="Receiving address"
          name="recipient"
          tooltip="The inscribing transaction delivers the inscription to the receiving address directly."
          rules={[
            { required: true, message: 'Please input receiving address!' },
            {
              warningOnly: true,
              validator: (_, value) => {
                if (!isValidTaprootAddress(value.trim())) {
                  return Promise.reject(
                    new Error('Taproot addresses are recommended. Use non-taproot addresses on your own risk.')
                  )
                }

                return Promise.resolve()
              }
            }
          ]}
        >
          <Input size="large" />
        </Form.Item>
        {/* <br />
        <Alert
          showIcon
          type="info"
          message="The inscribing transaction delivers the inscription to the receiving address directly."
        ></Alert>
        <br /> */}
        <Form.Item name="networkFeeLevel" className="flex items-center justify-center" wrapperCol={{ span: 24 }}>
          <FeePicker onChange={onFeeRateChange} />
          {/* {networkFeeRadioGroup} */}
        </Form.Item>
        {/** custom network fee */}

        <FeeItem
          name="Sats In Inscription:"
          fee={`${batchSize} x ${satsInside}`}
          usd={sats2usd(batchSize * (satsInside || 546))}
          tips="Specify the amount of satoshis stored in each inscription."
          extra={
            <Button
              key="customizesatsbtn"
              onClick={() => {
                setEditSatsInside((v) => !v)
              }}
              type="link"
              size="small"
              icon={<Icons.Edit size={16} className="ml-1 inline"></Icons.Edit>}
            >
              Customize
            </Button>
          }
        />
        {editSatsInside && (
          <Form.Item name="satsInside" className="my-2" wrapperCol={{ span: 16, offset: 4 }}>
            <IntegerSilderInput min={546} max={10000} onChange={onSatsInsideChange} />
          </Form.Item>
        )}
        <FeeItem name="Network Fee:" fee={fees.networkFee} usd={sats2usd(fees.networkFee)} />
        <Divider className="my-3 px-20" />
        <FeeItem
          name="Service Fee:"
          fee={fees.serviceFee}
          usd={sats2usd(fees.serviceFee)}
          tips="Base Service Fee (fixed)"
        />
        <FeeItem name="Fee by Size:" fee={fees.feeBySize} usd={sats2usd(fees.feeBySize)} tips="Fee by size: 4.99%" />
        <FeeItem name="=" fee={fees.discountedFee} usd={sats2usd(fees.discountedFee)} tips="" />
        <Divider className="my-3 px-20" />
        <FeeItem name="Total:" fee={fees.totalFee} usd={sats2usd(fees.totalFee)} tips="" />
        <br />
        {/* <Text type="success" className="mx-10 mb-3 flex items-center justify-center">
          <Icons.Info size={16} className="mr-1 inline" />
          The inscription will be delivered to the receiving address directly.
        </Text> */}
        <Form.Item label="" wrapperCol={{ span: 24 }} style={{ textAlign: 'center' }}>
          {isInIframe ? (
            <Button type="primary" size="large" htmlType="submit" className="w-1/2">
              Pay & Inscribe
            </Button>
          ) : (
            <GradientButton
              key="payandinscribebtn"
              loading={loading}
              color="purple"
              htmlType="submit"
              className="w-1/2"
            >
              Pay & Inscribe
            </GradientButton>
          )}
        </Form.Item>
      </Form>
    </Card>
  )
}