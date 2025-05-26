/* eslint-disable @typescript-eslint/no-unused-vars */
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import instance, {axiosClassic} from './api/api.interceptor'
import Cookies from 'js-cookie'

export const saveTokenStorage = (data: {accessToken: string; refreshToken: string}) => {
  if (typeof window !== 'undefined') {
    Cookies.set('accessToken', data.accessToken)
    Cookies.set('refreshToken', data.refreshToken)
    console.log('🔐 Токены сохранены на клиенте:', !!data.accessToken, !!data.refreshToken)
  }
}

export const saveTokensInResponse = (response: NextResponse, data: {accessToken: string; refreshToken?: string}) => {
  response.cookies.set('accessToken', data.accessToken)
  if (data.refreshToken) {
    response.cookies.set('refreshToken', data.refreshToken)
  }
  console.log('🔐 Токены установлены в response:', !!data.accessToken, !!data.refreshToken)
  return response
}

// Функция для удаления токенов
export const removeFromStorage = () => {
  // Для клиентской стороны (браузер)
  if (typeof window !== 'undefined') {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    console.log('🗑️ Токены удалены на клиенте')
  }
}

// Функция для удаления токенов из NextResponse (для middleware)
export const removeTokensFromResponse = (response: NextResponse) => {
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')
  console.log('🗑️ Токены удалены из response')
  return response
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
  console.log('🚀 Middleware запущен для пути:', request.nextUrl.pathname)
  console.log('api url: process.env.NEXT_PUBLIC_API_URL ', process.env.NEXT_PUBLIC_API_URL)
  try {
    const {pathname} = request.nextUrl

    // Проверяем наличие токенов в запросе
    const accessToken = request.cookies.get('accessToken')?.value || ''
    const refreshToken = request.cookies.get('refreshToken')?.value || ''

    console.log('📌 Проверка токенов:', {
      accessTokenExists: !!accessToken,
      refreshTokenExists: !!refreshToken,
      path: pathname
    })

    // Обработка защищенных маршрутов
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      console.log('🛡️ Обнаружен защищенный маршрут:', pathname)

      // Проверка наличия refresh токена
      if (!refreshToken) {
        console.log('❌ Нет refresh токена, редирект на /login')
        return NextResponse.redirect(new URL('/login', request.url))
      }

      console.log('🔄 Проверка авторизации пользователя с accessToken')
      try {
        // Пытаемся получить данные пользователя с текущим accessToken
        await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
          }
        })
        console.log('✅ Пользователь авторизован, доступ разрешен')
        return NextResponse.next()
      } catch (error) {
        console.error('❗ Не удалось получить данные пользователя с текущим accessToken:', error)

        console.log('🔄 Попытка обновления токена с refreshToken')
        try {
          // Пытаемся обновить токен
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

          console.log('✅ Токен успешно обновлен')

          // Создаем новый ответ и устанавливаем обновленные токены
          const response = NextResponse.next()
          response.cookies.set('accessToken', tokenData.accessToken)
          // refreshToken остается прежним, если сервер не вернул новый
          console.log('🔐 Новый accessToken установлен в cookies')

          try {
            // Проверяем авторизацию с новым токеном
            await instance.get<User>('/me', {
              headers: {
                Authorization: `Bearer ${tokenData.accessToken}`,
                'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
              }
            })
            console.log('✅ Авторизация с новым токеном успешна')
            return response
          } catch (e) {
            console.error('❌ Не удалось авторизоваться даже с новым токеном:', e)
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
            return removeTokensFromResponse(redirectResponse)
          }
        } catch (e) {
          console.error('❌ Не удалось обновить токен:', e)
          const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
          return removeTokensFromResponse(redirectResponse)
        }
      }
    }

    // Обработка публичных маршрутов (login, register)
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      console.log('🌐 Обнаружен публичный маршрут:', pathname)

      // Если нет токенов, разрешаем доступ к публичным маршрутам
      if (!accessToken && !refreshToken) {
        console.log('✅ Доступ к публичному маршруту разрешен (нет токенов)')
        return NextResponse.next()
      }

      // Если есть refreshToken, проверяем авторизацию
      if (refreshToken) {
        console.log('🔄 Проверка существующей авторизации на публичном маршруте')
        try {
          // Пытаемся получить данные пользователя с текущим accessToken
          await instance.get<User>('/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
            }
          })
          console.log('✅ Пользователь уже авторизован, редирект на главную')
          return NextResponse.redirect(new URL('/', request.url))
        } catch (error) {
          console.error(
            '❗ Не удалось получить данные пользователя с текущим accessToken на публичном маршруте:',
            error
          )

          console.log('🔄 Попытка обновления токена на публичном маршруте')
          try {
            // Пытаемся обновить токен
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

            console.log('✅ Токен успешно обновлен на публичном маршруте')

            // Создаем редирект на главную и устанавливаем обновленные токены
            const response = NextResponse.redirect(new URL('/', request.url))
            response.cookies.set('accessToken', tokenData.accessToken)
            // refreshToken остается прежним
            console.log('🔐 Новый accessToken установлен в cookies на публичном маршруте')

            return response
          } catch (e) {
            console.error('❌ Не удалось обновить токен на публичном маршруте:', e)
            // На публичном маршруте мы просто разрешаем доступ, если обновление не удалось
            // При этом удаляем невалидные токены
            const response = NextResponse.next()
            return removeTokensFromResponse(response)
          }
        }
      }

      console.log('✅ Доступ к публичному маршруту разрешен')
      return NextResponse.next()
    }

    // Для всех остальных маршрутов
    console.log('🌍 Обычный маршрут, продолжаем выполнение')
    return NextResponse.next()
  } catch (error) {
    console.error('💥 Критическая ошибка в middleware:', error)
    // В случае критической ошибки просто продолжаем выполнение
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico|json|xml|txt)).*)']
}
