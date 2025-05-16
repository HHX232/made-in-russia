/* eslint-disable @typescript-eslint/no-unused-vars */
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import instance, {axiosClassic} from './api/api.interceptor'
import {saveTokenStorage} from './services/auth/auth.helper'
import Cookies from 'js-cookie'
import {headers} from 'next/headers'

// services/auth/auth.helper.ts
export const removeFromStorage = () => {
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
}
const protectedRoutes = ['/basket', '/profile']
const publicRoutes = ['/login', '/register']
interface User {
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
  avatar: string
}
export async function middleware(request: NextRequest) {
  try {
    const {pathname} = request.nextUrl
    console.log('📍 Текущий путь:', pathname)

    const accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      console.log('🛡️ Обнаружен защищенный маршрут:', pathname)

      if (!refreshToken) {
        console.log('❌ Нет refresh token, редирект на /login')
        console.log('refreshToken типо отсутствующий ', refreshToken, ' конец refresh токена')
        return NextResponse.redirect(new URL('/login', request.url))
      }
      if (!accessToken) {
        console.log('Нет гребанного accessToken')
      }

      try {
        await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken || 'stasic smotri'}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
          }
        })
        return NextResponse.next()
      } catch (error) {
        console.error('Не смогли получить данные юзера', error)

        try {
          const {data: tokenData} = await axiosClassic.patch<{
            accessToken: string
          }>(
            '/me/current-session/refresh',
            {refreshToken},
            {
              headers: {
                'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
              }
            }
          )

          console.log('NEW tokenData', tokenData)
          saveTokenStorage({
            accessToken: tokenData.accessToken,
            refreshToken: refreshToken
          })
          console.log('мы сохранили новые токены')

          await instance.get<User>('/me', {
            headers: {
              Authorization: `Bearer ${accessToken || 'stasic smotri'}`,
              'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
            }
          })
          return NextResponse.next()
        } catch (e) {
          console.error('удаляем токены и Failed to refresh token:', e)
          removeFromStorage()
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
      return NextResponse.next()
    }

    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      console.log('🌐 Обнаружен публичный маршрут:', pathname)

      if (!accessToken && !refreshToken) {
        return NextResponse.next()
      }
      if (!!refreshToken) {
        try {
          console.log('Начался запрос на /me N1')
          const response = await instance.get<User>('/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
            }
          })
          console.log('закончился запрос на /me N1 успешно')
          return NextResponse.redirect(new URL('/', request.url))
        } catch (_) {
          console.error('Не смогли получить данные юзера N1')
          try {
            console.log('Начался запрос на /me/current-session/refresh N1')
            const {data: tokenData} = await axiosClassic.patch<{
              accessToken: string
            }>(
              '/me/current-session/refresh',
              {refreshToken},
              {
                headers: {
                  'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
                }
              }
            )
            console.log('закончился запрос на /me/current-session/refresh N1 успешно', tokenData)
            saveTokenStorage({
              accessToken: tokenData.accessToken,
              refreshToken: refreshToken
            })
            console.log('мы сохранили новые токены')
            console.log('Начался запрос на /me с новыми токенами N2')
            await instance.get<User>('/me', {
              headers: {
                Authorization: `Bearer ${accessToken || 'stasic smotri'}`,
                'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
              }
            })
            console.log('закончился запрос на /me с новыми токенами успешно N2')

            return NextResponse.redirect(new URL('/', request.url))
          } catch (e) {
            console.error('удаляем токены и Failed to refresh token:')
            // removeFromStorage()
            return NextResponse.next()
          }
        }
      }

      console.log('✅ Разрешаем доступ к публичному маршруту')
      return NextResponse.next()
    }

    return NextResponse.next()
  } catch (error) {
    console.error('💥 Ошибка в middleware:', error)
    return NextResponse.next()
  }
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico|json|xml|txt)).*)']
}
