import { cookies, headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const { searchParams } = url
  const data = await req.text()
  return NextResponse.json({
    data,
    req,
    method: req.method,
    url: req.url,
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    searchs: url.search,
    searchParams: Array.from(searchParams.entries())
  })
}

export async function POST(req: NextRequest, context: any) {
  const data = await req.json()
  console.log(JSON.stringify(context))
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const headersList = headers()
  const referer = headersList.get('referer')
  const contentType = headersList.get('Content-Type')

  return NextResponse.json({
    body: req.body,
    data,
    req,
    context,
    x: req.method,
    nextUrl: req.nextUrl,
    pathname: req.nextUrl.pathname,
    searchParams: req.nextUrl.searchParams,
    search: req.nextUrl.search,
    cookies: req.cookies.getAll(),
    token,
    referer,
    headersList: contentType,
    hs: Array.from(headersList.entries())
  })
}
