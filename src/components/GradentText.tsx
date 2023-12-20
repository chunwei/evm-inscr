/*
 * @Author: luchunwei luchunwei@gmail.com
 * @Date: 2023-05-13 17:18:20
 * @LastEditors: luchunwei luchunwei@gmail.com
 * @LastEditTime: 2023-05-13 17:41:05
 * @FilePath: /ele-bit-ord/src/components/GradentText.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default function GradientText({ content, padding, startColor, endColor, bgClass, fgClass }: any) {
  const style = {} as any
  if (content) style['--content'] = content
  if (padding) style['--padding'] = padding
  if (content) style['--start-color'] = startColor
  if (content) style['--end-color'] = endColor
  return (
    <span className={`gradient-text-bg ${bgClass ?? ''}`} style={style}>
      <span className={`gradient-text-fg ${fgClass ?? ''}`}>{content ?? ''}</span>
    </span>
  )
}
