import { NextRequest, NextResponse } from 'next/server'

import { CreateTransactionsParams } from '@types'
import { pushBTCpmt } from 'src/utils/inscription'
import { createRefundTx, createTransactions, createTransactionsSeg } from 'src/utils/order'

// export async function GET(req: Request) {
// 	const orders = await OrderManager.readOrders()
// 	return NextResponse.json({ data: orders, code: 200, message: 'ok' })
// }

export async function POST(req: NextRequest) {
  const refundParams = await req.json()

  try {
    const txsResult = await createRefundTx(refundParams)

    // console.log('txsResult', txsResult)
    // const txid = await pushBTCpmt(txsResult.txs[0].txHex)
    // console.log('Refund TX', txid)

    return NextResponse.json({
      code: 200,
      data: txsResult
    })
  } catch (error: any) {
    console.log(req.nextUrl.pathname)
    console.log(error)
    return NextResponse.json(
      {
        code: 500,
        error: 'Internal server error',
        message: error.toString()
      },
      { status: 500 }
    )
  }
}
