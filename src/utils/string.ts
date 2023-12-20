/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-10 16:22:28
 * @LastEditTime: 2023-05-11 18:43:02
 * @LastEditors: luchunwei luchunwei@gmail.com
 */
export function capital(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function ellipsisMid(word: string, padding: number) {
  return word.slice(0, padding) + '...' + word.slice(padding * -1)
}

export function getByteLength(str: string): number {
  if (typeof TextEncoder !== 'undefined' && typeof Blob !== 'undefined') {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    return data.length
  }

  let byteLength = 0
  for (let i = 0, len = str.length; i < len; i++) {
    const charCode = str.charCodeAt(i)
    if (charCode < 0x80) {
      byteLength += 1
    } else if (charCode < 0x800) {
      byteLength += 2
    } else if (charCode < 0x10000) {
      byteLength += 3
    } else {
      byteLength += 4
    }
  }

  return byteLength
}

/**
 * 这个函数将会接受一个以字节为单位的长度，并根据需要进行单位转换。
 * 它使用一个循环，每次将长度除以1024，并递增单位索引，直到长度小于1024或者单位索引达到最大值（即GB）为止。
 * 然后，函数将返回格式化后的长度和单位，保留2位小数。
 *
 * @param length 以字节为单位的长度
 * @returns
 */
export function formatContentLength(length: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0

  while (length >= 1024 && unitIndex < units.length - 1) {
    length /= 1024
    unitIndex++
  }
  //如果长度是整数，就不显示小数部分
  return `${length.toFixed(length % 1 === 0 ? 0 : 2)} ${units[unitIndex]}`
}

export function formatByteLength(str: string): string {
  return formatContentLength(getByteLength(str))
}

enum Language {
  Chinese = 'chinese',
  English = 'english'
}

interface TimeUnit {
  [Language.Chinese]: string
  [Language.English]: string
}

const timeUnits: TimeUnit = {
  [Language.Chinese]: '秒,分钟,小时,天',
  [Language.English]: 's,min,hr,day' // 'seconds,minutes,hours,days',
}

export function formatTime(
  seconds = 60,
  language: Language = Language.English,
  maxUnit = 2, // 保留最大的n个单位，比如2天1小时，1小时3分钟
  keepSecond = false // 是否显示秒
): string {
  maxUnit = maxUnit || 1
  const unitsAll = timeUnits[language].split(',').reverse()
  const [uD, uH, uM, uS] = unitsAll
  const values: number[] = []
  const units: string[] = []
  const day = Math.floor(seconds / 86400)
  if (day > 0) {
    values.push(day) // 天
    units.push(uD)
  }
  if (values.length < maxUnit) {
    const hrs = Math.floor((seconds / 3600) % 24)
    if (hrs > 0) {
      values.push(hrs) // 小时
      units.push(uH)
    }
  }
  if (values.length < maxUnit) {
    const mins = Math.floor((seconds / 60) % 60)
    if (mins > 0) {
      values.push(mins) // 分钟
      units.push(uM)
    }
  }
  if (values.length < maxUnit && keepSecond) {
    values.push(seconds % 60) // 秒
    units.push(uS)
  }

  const result = values.reduce((acc, value, index) => {
    if (value > 0) {
      const unit = units[index]
      const unitLabel = language === Language.English && value > 1 && unit !== 's' ? `${unit}s` : unit // 处理英文单位的单复数
      acc.push(`${value}${unitLabel}`)
    }
    return acc
  }, [] as string[])

  return result.join(' ')
}

// console.log(formatTime(9006, Language.Chinese))
// console.log(formatTime(190061, Language.English))
