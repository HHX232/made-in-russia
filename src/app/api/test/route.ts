// src/app/api/test/route.ts
import {NextResponse} from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({
    message: 'API working',
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString()
  })
}
