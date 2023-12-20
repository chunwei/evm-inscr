/*
 * @Author: luchunwei luchunwei@gmail.com
 * @Date: 2023-05-10 17:59:53
 * @LastEditors: luchunwei luchunwei@gmail.com
 * @LastEditTime: 2023-05-12 11:50:39
 * @FilePath: /ele-bit-ord/src/components/SliderInput.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react'

import { Col, ConfigProvider, InputNumber, InputNumberProps, Row, Slider, Space, theme } from 'antd'

interface SilderInputProps<T> {
  min?: T
  max?: T
  value?: T
  defaultValue?: T
  onChange?: (v: T | null) => void
  colorPrimary?: string
}

const { useToken } = theme
export const IntegerSilderInput: React.FC<SilderInputProps<number>> = (props: SilderInputProps<number>) => {
  const { min, max, value, defaultValue, onChange: onChangeExternal, colorPrimary } = props
  const [inputValue, setInputValue] = useState(value || defaultValue || null)

  const onChange = (value: number | null) => {
    setInputValue(value)
    if (onChangeExternal) onChangeExternal(value)
  }
  const { token } = useToken()

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colorPrimary || token.colorPrimary
        }
      }}
    >
      <div className="flex ">
        <Slider
          className="flex-1"
          style={{ marginRight: 16 }}
          min={min}
          max={max}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
        />
        <InputNumber style={{ width: '5rem' }} min={min} max={max} value={inputValue} onChange={onChange} />
      </div>
    </ConfigProvider>
  )
}

export const DecimalSilderInput: React.FC<SilderInputProps<number>> = (props: SilderInputProps<number>) => {
  const { min, max, value, defaultValue, onChange: onChangeExternal } = props
  const [inputValue, setInputValue] = useState(value || defaultValue || null)

  const onChange = (value: number | null) => {
    if (value === null || isNaN(value)) {
      return
    }
    setInputValue(value)
    if (onChangeExternal) onChangeExternal(value)
  }

  return (
    <Row>
      <Col span={21}>
        <Slider
          min={min}
          max={max}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={0.01}
        />
      </Col>
      <Col span={3}>
        <InputNumber min={min} max={max} step={0.01} value={inputValue} onChange={onChange} />
      </Col>
    </Row>
  )
}
