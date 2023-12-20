export function textToHex(text: string): string {
  return Array.from(new TextEncoder().encode(text), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

export function textToUnit64Array(text: string): number[] {
  return Array.from(new TextEncoder().encode(text), (byte) =>
    parseInt(byte.toString(16).padStart(2, '0'), 16)
  )
}

// // test
// ;(function () {
//   // mint
//   const str = `data:,{"p":"asc-20","op":"mint","tick":"dino","amt":"100000000"}`
//   const hexOfStr =
//     '0x646174613a2c7b2270223a226173632d3230222c226f70223a226d696e74222c227469636b223a2264696e6f222c22616d74223a22313030303030303030227d'
//   const hex = '0x' + textToHex(str)
//   console.log(hex)
//   console.log(hex === hexOfStr)

//   // deploy
//   const str1 = `data:,{"p":"asc-20","op":"deploy","tick":"dino","max":"2100000000000000","lim":"100000000"}`
//   const hexOfStr1 =
//     '0x646174613a2c7b2270223a226173632d3230222c226f70223a226465706c6f79222c227469636b223a2264696e6f222c226d6178223a2232313030303030303030303030303030222c226c696d223a22313030303030303030227d'
//   const hex1 = '0x' + textToHex(str1)
//   console.log(hex1)
//   console.log(hex1 === hexOfStr1)
// })()
