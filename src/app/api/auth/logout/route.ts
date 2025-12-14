import {NextResponse} from 'next/server'

export async function POST() {
  console.log('🗑️ API Route: Удаление server-side cookies')

  const response = NextResponse.json({success: true})

  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')

  console.log('✅ Server-side cookies удалены')

  return response
}
