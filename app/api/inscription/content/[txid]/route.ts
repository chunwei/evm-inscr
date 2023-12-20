import { NextResponse } from 'next/server'

import { queryInscriptionContent } from '@services/rest/api'

export async function GET(req: Request, { params }: { params: any }) {
  const { txid } = params
  const { searchParams } = new URL(req.url)
  const mimetype = searchParams.get('mimetype') ?? undefined
  const content = await queryInscriptionContent(txid, mimetype)
  return NextResponse.json({ code: 200, data: { content }, message: 'ok' })
}
