import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: any }) {
  return NextResponse.json({ data: { ordinalServiceFee: 1999 }, code: 200, message: 'ok' })
}
