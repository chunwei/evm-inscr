/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-09 15:42:57
 * @LastEditTime: 2023-05-09 15:43:12
 * @LastEditors: Chunwei Lu
 */
import { extractStyle } from '@ant-design/static-style-extract'
import fs from 'fs'

import withTheme from '../src/theme'

const outputPath = './public/antd.min.css'

// 1. default theme

// const css = extractStyle();

// 2. With custom theme

const css = extractStyle(withTheme)

fs.writeFileSync(outputPath, css)

console.log(`🎉 Antd CSS generated at ${outputPath}`)
