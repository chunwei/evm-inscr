'use client';

import { useCallback, useMemo, useState } from 'react';



import GradientButton from '@components/GradientButton';
import Icons from '@components/Icons';
import { IntegerSilderInput } from '@components/SliderInput';
import { LOCALSTORAGE_KEYS } from '@config/btc-config';
import { Button, Card, Form, Input, InputNumber, Radio, RadioChangeEvent, Segmented, UploadFile } from 'antd';
import type { UploadProps } from 'antd';
import { Typography, Upload, message } from 'antd';
import localforage from 'localforage';
import useIsInIframe from 'src/hooks/useIsInIframe';
import { buf2hex, fileToArrayBuffer } from 'src/utils/inscription';
import { capital, formatContentLength } from 'src/utils/string'

import './index.scss'

const { Text } = Typography

const { Dragger } = Upload

type FileFormProps = IStepNav
export default function FileForm(props: FileFormProps) {
  const { stepNavFns } = props
  const maxCount = 50
  const maxFileSize = 100 // unit KB
  const [hidden, setHidden] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'text/*,model/*,image/*,video/*,audio/*',
    multiple: maxCount > 1,
    maxCount,
    fileList,
    listType: 'picture-card',
    itemRender: (originNode, file) => {
      return (
        <div className="relative flex flex-col justify-center">
          {originNode}
          <div className="absolute right-20 mt-2">
            <Text>{formatContentLength(file.size ?? 0)}</Text>
          </div>
        </div>
      )
    },
    beforeUpload: (file) => {
      if (file.size > maxFileSize * 1024) {
        message.error(`Max file size: ${maxFileSize}KB !`)
        return Upload.LIST_IGNORE
      }
      return false
    },
    onChange(info) {
      setFileList(info.fileList)
      setHidden(info.fileList.length >= maxCount)
      const { status } = info.file
      console.log('uploader onChange status', status, info.file.name)
      if (status !== 'uploading') {
        // console.log(info.file, info.fileList)
      }
      //   if (status === 'done') {
      //     message.success(`${info.file.name} file uploaded successfully.`)
      //   } else if (status === 'error') {
      //     message.error(`${info.file.name} file upload failed.`)
      //   }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    }
  }

  const onSubmit = useCallback(async () => {
    console.log('fileList', fileList)
    if (fileList.length === 0) {
      message.warning("You haven't selected a file yet!")
      return
    }
    const fileListx = []
    for (const file of fileList) {
      const buffer = await fileToArrayBuffer(file.originFileObj as File)
      const hex = buf2hex(buffer)
      fileListx.push({
        type: file.type,
        name: file.name,
        size: file.size,
        hex
      })
    }
    console.log('fileListx', fileListx)
    sessionStorage.setItem(LOCALSTORAGE_KEYS.inscription, JSON.stringify({ type: 'files', fileList: [] }))
    // 文件可能很大会超过sessionStorage 一个域下5M限制，存到indexDB下
    await localforage.setItem(LOCALSTORAGE_KEYS.inscription, JSON.stringify({ type: 'files', fileList: fileListx }))
    if (stepNavFns?.next) stepNavFns?.next()
  }, [fileList, stepNavFns])

  const { isInIframe } = useIsInIframe()

  return (
    <Card
      bordered={false}
      className="inscribe-card"
      //   actions={[
      //     <Button
      //       htmlType="button"
      //       type="link"
      //       onClick={() => {
      //         if (stepNavFns?.next) stepNavFns?.next()
      //       }}
      //       // style={{ position: 'absolute', left: 24 }}
      //     >
      //       <Icons.ArrowRight size={16} className="mr-2 inline" /> Next
      //     </Button>
      //   ]}
    >
      <div className="flex w-[800px] items-center justify-center">
        <Dragger {...uploadProps} className={`w-full ${hidden ? 'hiddenbtn' : ''}`}>
          <p className="flex items-center justify-center">
            <Icons.UploadCloud size={80} strokeWidth={1} className=" fill-slate-300/30" />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Support type .jpg, .webp, .png, .gif, .txt, .mp3, .mp4 and more!</p>
          <p className="ant-upload-hint">
            Max size of single file: {maxFileSize}KB, max file count: {maxCount}
          </p>
        </Dragger>
      </div>
      <div className="mt-6" style={{ textAlign: 'center' }}>
        {isInIframe ? (
          <Button type="primary" size="large" htmlType="submit" className="w-1/2" onClick={onSubmit}>
            Submit
          </Button>
        ) : (
          <GradientButton color="blue" htmlType="submit" className="w-1/2" onClick={onSubmit}>
            Submit
          </GradientButton>
        )}
      </div>
    </Card>
  )
}