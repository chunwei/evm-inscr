import { Buff } from '@cmdcode/buff-utils'

export function textToHex(text: string): string {
  return Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function hexToBytes(hex: string) {
  const matches = hex.match(/.{1,2}/g)
  if (matches) {
    return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)))
  } else {
    // 处理空值情况
    return new Uint8Array(0) // 返回空的 Uint8Array
  }
}

const file = {
  hex: '7b2270223a226272632d3230222c226f70223a226465706c6f79222c227469636b223a2279796473616263222c226d6178223a22323130303030222c226c696d223a22313030222c22646563223a223138227d',
  text: '{"p":"brc-20","op":"deploy","tick":"yydsabc","max":"210000","lim":"100","dec":"18"}',
  // text: '{"p":"brc-20","op":"deploy","tick":"yydsfs","max":"2100000","lim":"100","dec":"18"}',
  // text:'{"p":"brc-20","op":"mint","tick":"abcd","amt":"1000"}',
  mimetype: 'text/plain;charset=utf-8'
}

function test(file: any) {
  const data = Buff.encode(file.text)
  const mimetype = Buff.encode(file.mimetype)

  console.log('Buff.encode(file.text) ', data)
  console.log('hexToBytes(file.hex) ', hexToBytes(file.hex))
}

test(file)
