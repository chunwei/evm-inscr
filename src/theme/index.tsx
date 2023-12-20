/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-09 15:43:42
 * @LastEditTime: 2023-05-09 15:43:44
 * @LastEditors: Chunwei Lu
 */
import React from 'react'

import { ConfigProvider } from 'antd'

const testGreenColor = '#52c41a'
const testRedColor = '#ff0000'

const withTheme = (node: JSX.Element) => (
  <>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a'
        }
      }}
    >
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 16
          }
        }}
      >
        {node}
      </ConfigProvider>
    </ConfigProvider>
  </>
)

export default withTheme
