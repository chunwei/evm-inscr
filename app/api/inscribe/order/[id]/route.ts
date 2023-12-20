import { NextResponse } from 'next/server'

import OrderManager from '@services/files/OrderManager'

export async function GET(req: Request, { params }: { params: any }) {
  // console.log(req.url, params)
  const order = await OrderManager.findOrderById(params.id)

  return NextResponse.json({ data: order, code: 200, message: 'ok' })
}
