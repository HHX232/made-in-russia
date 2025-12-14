import {NextRequest, NextResponse} from 'next/server'

const suspiciousPatterns = [/\.(sh|bash|py|php|exe)$/, /curl|wget|bash|sh\s/i, /(linux\.sh|r\.sh)/]

export async function securityMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const userAgent = request.headers.get('user-agent') || ''

  if (suspiciousPatterns.some((pattern) => pattern.test(pathname) || pattern.test(userAgent))) {
    console.log('🚫 Blocked suspicious request:', {pathname, userAgent})
    return new NextResponse('Forbidden', {status: 403})
  }

  return null
}
