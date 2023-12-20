/*
 * @Author: luchunwei luchunwei@gmail.com
 * @Date: 2023-05-11 20:37:40
 * @LastEditors: luchunwei luchunwei@gmail.com
 * @LastEditTime: 2023-05-12 10:59:52
 * @FilePath: /ele-bit-ord/src/components/inscribe/FeeItem.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Icons from '@components/Icons'
import { Button, Col, Row, Tooltip, Typography } from 'antd'

const { Text } = Typography

export default function FeeItem(props: any) {
  const { name, fee, usd, tips, extra } = props
  return (
    <Row align="middle">
      <Col span={8} className="text-right">
        {name}
      </Col>
      <Col span={5} className="text-right">
        <Text strong>{fee} sats</Text>
      </Col>
      <Col span={4} offset={1} className="text-left">
        <Text type="secondary">~${Number(usd).toFixed(2)}</Text>
      </Col>
      <Col span={4} className="flex items-center text-left">
        {tips && (
          <Tooltip title={tips}>
            <Button type="ghost" size="small" className="!h-4 !w-4" icon={<Icons.Info size={16}></Icons.Info>} />
          </Tooltip>
        )}
        {extra}
      </Col>
    </Row>
  )
}
