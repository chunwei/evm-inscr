import { NextResponse } from 'next/server'

import OrderManager from '@services/files/OrderManager'
// import { queryOrder } from '@services/rest/api'
import { perform } from 'src/utils/order'

export async function POST(req: Request) {
  const params = await req.json()
  const { orderId } = params
  console.log(params)
  setTimeout(async () => {
    const order = await OrderManager.findOrderById(orderId)
    if (order) {
      const result = await perform(order).catch(console.error)
    } else {
      console.log('no order found')
    }
  }, 3000)

  return NextResponse.json({
    code: 200,
    message: 'ok',
    data: { res: 'Order server will check payment status and then start inscribing', orderId }
  })
}
