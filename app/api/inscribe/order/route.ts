import { cookies, headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import OrderManager from '@services/files/OrderManager'
import { createOrder } from 'src/utils/order'

export async function GET(req: Request) {
  const orders = await OrderManager.readOrders()
  return NextResponse.json({ data: orders, code: 200, message: 'ok' })
}

export async function POST(req: NextRequest) {
  const orderParams = await req.json()

  const order = await createOrder(orderParams)
  // 异步写入，不等待
  OrderManager.writeOrder(order)

  return NextResponse.json({
    code: 200,
    data: order
  })
}
