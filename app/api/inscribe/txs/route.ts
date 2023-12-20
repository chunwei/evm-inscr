import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: Request) {
  // const orders = await OrderManager.readOrders()
  return NextResponse.json({ data: { x: 'x' }, code: 200, message: 'ok' })
}
