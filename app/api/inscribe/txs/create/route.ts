import { NextRequest, NextResponse } from 'next/server';



import { CreateTransactionsParams } from '@types'
import { pushBTCpmt } from 'src/utils/inscription'
import { createTransactions, createTransactionsSeg } from 'src/utils/order';


// export async function GET(req: Request) {
// 	const orders = await OrderManager.readOrders()
// 	return NextResponse.json({ data: orders, code: 200, message: 'ok' })
// }

export async function POST(req: NextRequest) {
  const txType = req.nextUrl.searchParams.get('type')
  console.log('txType', txType)
  const createTransactionsParams = await req.json()
  const { payTxInfo } = createTransactionsParams as CreateTransactionsParams

  try {
    let txsResult
    if (txType === 'seg') {
      txsResult = await createTransactionsSeg(createTransactionsParams, payTxInfo[0])
    } else {
      txsResult = await createTransactions(createTransactionsParams, payTxInfo[0])
    }
    // console.log('txsResult', txsResult)

    // const txid = await pushBTCpmt(txsResult.txs[0].txHex)
    // const txidn = await pushBTCpmt(txsResult.txs[1].txHex)

    // console.log('Init TX', txid)
    // console.log('Inscribe TX', txidn)

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