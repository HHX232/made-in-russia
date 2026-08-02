import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import instance, {axiosClassic} from './api/api.interceptor'
import Cookies from 'js-cookie'
import {User} from './services/users.types'
import ICardFull from './services/card/card.types'
import {securityMiddleware} from './middlewares/security'
import {handleCategoryRedirect} from './middlewares/categoryRedirect'

// Функция для определения локали по поддомену
const getLocaleFromSubdomain = (hostname: string): string | null => {
  const parts = hostname.split('.')

  // Если есть поддомен
  if (parts.length > 2) {
    const subdomain = parts[0]

    switch (subdomain) {
      case 'cn':
        console.log('в миддлваре обнаружили поддомен cn')
        return 'zh'

      case 'en':
        console.log('в миддлваре обнаружили поддомен en')
        return 'en'

      case 'in': // индийский поддомен → хинди
        console.log('в миддлваре обнаружили поддомен in')
        return 'hi'

      case 'hi': // второй вариант индийского поддомена → хинди
        console.log('в миддлваре обнаружили поддомен hi')
        return 'hi'

      default:
        console.log('в миддлваре обнаружили поддомен по умолчанию')
        return null
    }
  }

  // Если это основной домен exporteru.com без поддомена — русский
  if (parts.length === 2 && parts[0] === 'exporteru') {
    console.log('в миддлваре обнаружили основной домен exporteru.com')
    return 'ru'
  }

  return null
}

export const saveTokenStorage = (data: {accessToken: string; refreshToken: string}) => {
  if (typeof window !== 'undefined') {
    Cookies.set('accessToken', data.accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production'
    })
    Cookies.set('refreshToken', data.refreshToken, {
      expires: 30,
      secure: process.env.NODE_ENV === 'production'
    })
    console.log('🔐 Токены сохранены на клиенте:', !!data.accessToken, !!data.refreshToken)
  }
}

export const saveTokensInResponse = (response: NextResponse, data: {accessToken: string; refreshToken?: string}) => {
  response.cookies.set('accessToken', data.accessToken, {maxAge: 60 * 60 * 24 * 7})
  if (data.refreshToken) {
    response.cookies.set('refreshToken', data.refreshToken, {maxAge: 60 * 60 * 24 * 30})
  }
  console.log('🔐 Токены установлены в response:', !!data.accessToken, !!data.refreshToken)
  return response
}

// Функция для удаления токенов из NextResponse (для middleware)
export const removeTokensFromResponse = (response: NextResponse) => {
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')
  console.log('🗑️ Токены удалены из response')
  return response
}

// Функция для установки локали в ответ с проверкой дублирования заголовков
const setLocaleInResponse = (
  response: NextResponse,
  locale: string,
  shouldSetCookie: boolean,
  acceptLanguageFromFirstRequest: string | null
) => {
  response.headers.set('x-locale', locale)

  if (acceptLanguageFromFirstRequest) {
    response.cookies.set({
      name: 'have_lang_in_start',
      value: 'have',
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1 год
    })
  }
  if (shouldSetCookie) {
    // Проверяем, есть ли уже заголовок Set-Cookie для NEXT_LOCALE
    const existingSetCookieHeader = response.headers.get('set-cookie')
    const hasNextLocaleCookie = existingSetCookieHeader?.includes('NEXT_LOCALE=')

    if (!hasNextLocaleCookie) {
      response.cookies.set('NEXT_LOCALE', locale)
      // Дополнительно устанавливаем заголовок Set-Cookie для гарантии
      const currentSetCookie = response.headers.get('set-cookie') || ''
      const newSetCookie = currentSetCookie
        ? `${currentSetCookie}, NEXT_LOCALE=${locale}; Path=/`
        : `NEXT_LOCALE=${locale}; Path=/`
      response.headers.set('set-cookie', newSetCookie)
    }
  }

  return response
}

const protectedRoutes = ['/basket', '/profile', '/vendor', '/create-card', '/chats']
const protectedAdminRoutes = ['/admin']
const publicRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  console.log('🚀 Middleware запущен для пути:', request.nextUrl.pathname)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  console.log('x-pathname', request.nextUrl.pathname)
  const hostnameFromHeaders = request.headers.get('host')
  console.log('🥰 Реальный hostname из headers:', hostnameFromHeaders)
  const acceptLanguageFromRequest = request.headers.get('accept-language')

  const securityCheck = await securityMiddleware(request)
  if (securityCheck) return securityCheck

  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next()

    // Обработка локали для API запросов
    const localeFromSubdomain = getLocaleFromSubdomain(hostnameFromHeaders || '')
    const existingLocaleCookie = request.cookies.get('NEXT_LOCALE')?.value

    if (localeFromSubdomain && !existingLocaleCookie) {
      console.log('🌍 Установлена кука NEXT_LOCALE для API:', localeFromSubdomain)
      setLocaleInResponse(response, localeFromSubdomain, true, acceptLanguageFromRequest)
    } else if (localeFromSubdomain) {
      response.headers.set('x-locale', localeFromSubdomain)
    }

    return response // Пропускаем для API
  }

  try {
    const {pathname} = request.nextUrl

    const pathnameWithoutLocale = pathname.replace(/^\/(ru|en|zh|hi)/, '') || '/'

    const categoryRedirect = handleCategoryRedirect(request, pathnameWithoutLocale)
    if (categoryRedirect) {
      return categoryRedirect
    }

    console.log('🌐 Реальный hostname из headers:', hostnameFromHeaders)
    // Определяем локаль по поддомену
    const localeFromSubdomain = getLocaleFromSubdomain(hostnameFromHeaders || '')
    const existingLocaleCookie = request.cookies.get('NEXT_LOCALE')?.value

    console.log(
      '🌐 Hostname:',
      hostnameFromHeaders,
      'Локаль из поддомена:',
      localeFromSubdomain,
      'Существующая кука:',
      existingLocaleCookie
    )

    // Устанавливаем куку NEXT_LOCALE если она не установлена и есть поддомен
    let shouldSetLocaleCookie = false
    if (localeFromSubdomain && !existingLocaleCookie) {
      shouldSetLocaleCookie = true
      console.log('🍪 Необходимо установить куку NEXT_LOCALE:', localeFromSubdomain)
    }

    // Проверяем наличие токенов в запросе
    const accessToken = request.cookies.get('accessToken')?.value || ''
    const refreshToken = request.cookies.get('refreshToken')?.value || ''

    console.log('📌 Проверка токенов:', {
      accessTokenExists: !!accessToken,
      refreshTokenExists: !!refreshToken,
      path: pathname
    })

    // Обработка маршрутов create-card
    // Исправленная часть для обработки маршрутов create-card
    if (pathnameWithoutLocale === '/create-card' || pathnameWithoutLocale.startsWith('/create-card/')) {
      console.log('🎨 Обнаружен маршрут create-card:', pathname)

      // Проверка наличия refresh токена
      if (!refreshToken) {
        console.log('❌ Нет refresh токена, редирект на /login')
        const response = NextResponse.redirect(new URL('/login', request.url))
        return setLocaleInResponse(
          response,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      }

      try {
        // Получаем данные пользователя
        const {data: userData} = await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
          }
        })

        console.log('✅ Пользователь авторизован, роль:', userData.role)

        // Проверяем роль пользователя
        if (userData.role !== 'Vendor' && userData.role !== 'Admin') {
          console.log('❌ Доступ запрещен для роли:', userData.role)
          const response = NextResponse.redirect(new URL('/', request.url))
          return setLocaleInResponse(
            response,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        }

        // Если это маршрут с ID товара (исключаем /create-card и /create-card/)
        if (pathname.startsWith('/create-card/') && pathname !== '/create-card/' && pathname !== '/create-card') {
          const pathSegments = pathname.split('/').filter((segment) => segment) // Убираем пустые сегменты
          const productId = pathSegments[1] // Теперь индекс 1, так как убрали пустые сегменты

          console.log('🔍 Проверка доступа к товару с ID:', productId)

          if (!productId || isNaN(Number(productId))) {
            console.log('❌ Невалидный ID товара:', productId)
            const response = NextResponse.redirect(new URL('/create-card', request.url))
            return setLocaleInResponse(
              response,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
          }

          try {
            // Получаем данные о товаре
            const {data: productData} = await axiosClassic.get<ICardFull>(`/products/${productId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
                'Accept-Language': localeFromSubdomain || 'en',
                'X-Locale': localeFromSubdomain || 'en'
              }
            })

            const productOwnerId = productData?.user.id
            console.log('📦 Владелец товара:', productOwnerId, 'Текущий пользователь:', userData.id)

            // Админ имеет доступ ко всем товарам
            if (userData.role === 'Admin') {
              console.log('👑 Admin имеет доступ к редактированию любого товара')
              const response = NextResponse.next()
              return setLocaleInResponse(
                response,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )
            }

            // Проверяем, является ли пользователь владельцем товара
            if (productOwnerId !== userData.id) {
              console.log('❌ Пользователь не является владельцем товара, редирект на /create-card')
              const response = NextResponse.redirect(new URL('/create-card', request.url))
              return setLocaleInResponse(
                response,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )
            }

            console.log('✅ Пользователь является владельцем товара, доступ разрешен')
            const response = NextResponse.next()
            return setLocaleInResponse(
              response,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
          } catch (error) {
            console.error('❌ Ошибка при получении данных товара:', error)
            // Если товар не найден или произошла ошибка, редиректим на /create-card
            const response = NextResponse.redirect(new URL('/create-card', request.url))
            return setLocaleInResponse(
              response,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
          }
        }

        // Для маршрутов /create-card и /create-card/ просто разрешаем доступ Vendor и Admin
        console.log('✅ Доступ к базовому маршруту create-card разрешен')
        const response = NextResponse.next()
        return setLocaleInResponse(
          response,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      } catch (error) {
        console.error('❗ Не удалось получить данные пользователя:', error)

        // Пытаемся обновить токен
        console.log('🔄 Попытка обновления токена')
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

          console.log('✅ Токен успешно обновлен')

          // Создаем новый ответ и устанавливаем обновленные токены
          const response = NextResponse.next()
          response.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
          setLocaleInResponse(response, localeFromSubdomain || 'en', shouldSetLocaleCookie, acceptLanguageFromRequest)

          // Повторяем проверку с новым токеном
          const {data: userData} = await instance.get<User>('/me', {
            headers: {
              Authorization: `Bearer ${tokenData.accessToken}`,
              'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
            }
          })

          // Проверяем роль пользователя
          if (userData.role !== 'Vendor' && userData.role !== 'Admin') {
            console.log('❌ Доступ запрещен для роли:', userData.role)
            const redirectResponse = NextResponse.redirect(new URL('/', request.url))
            redirectResponse.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
            return setLocaleInResponse(
              redirectResponse,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
          }

          return response
        } catch (e) {
          console.error('❌ Не удалось обновить токен:', e)
          const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
          setLocaleInResponse(
            redirectResponse,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
          return removeTokensFromResponse(redirectResponse)
        }
      }
    }

    if (protectedAdminRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      console.log('🛡️ Обнаружен admin маршрут:', pathname)

      // Проверка наличия refresh токена
      if (!refreshToken) {
        console.log('❌ Нет refresh токена, редирект на /login')
        const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
        return setLocaleInResponse(
          redirectResponse,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      }

      console.log('🔄 Проверка авторизации пользователя с accessToken')

      try {
        // Пытаемся получить данные пользователя с текущим accessToken
        const {data: userData} = await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
          }
        })
        console.log('✅ Пользователь авторизован, доступ разрешен')

        if (userData.role === 'Admin') {
          console.log('👑 Admin имеет доступ ко всем маршрутам')
          const response = NextResponse.next()
          return setLocaleInResponse(
            response,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        } else {
          const redirectResponse = NextResponse.redirect(new URL('/', request.url))
          return setLocaleInResponse(
            redirectResponse,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        }
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
          response.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
          setLocaleInResponse(response, localeFromSubdomain || 'en', shouldSetLocaleCookie, acceptLanguageFromRequest)

          console.log('🔐 Новый accessToken установлен в cookies')

          try {
            // Проверяем авторизацию с новым токеном
            console.log(process.env.INTERNAL_REQUEST_SECRET)
            const {data: userData} = await instance.get<User>('/me', {
              headers: {
                Authorization: `Bearer ${tokenData.accessToken}`,
                'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
              }
            })
            console.log('✅ Авторизация с новым токеном успешна')

            if (userData.role === 'Admin') {
              console.log('👑 Admin имеет доступ ко всем маршрутам')
              return response
            }

            if (userData.role === 'Vendor' && pathname === '/profile') {
              console.log('🔀 Перенаправление User с ролью Vendor на /vendor')
              const redirectResponse = NextResponse.redirect(new URL('/vendor', request.url))
              redirectResponse.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
              return setLocaleInResponse(
                redirectResponse,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )
            } else if (userData.role === 'User' && pathname === '/vendor') {
              console.log('🔀 Перенаправление User с ролью User на /profile')
              const redirectResponse = NextResponse.redirect(new URL('/profile', request.url))
              redirectResponse.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
              return setLocaleInResponse(
                redirectResponse,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )
            }

            return response
          } catch (e) {
            console.error('❌ Не удалось авторизоваться даже с новым токеном:', e)
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
            setLocaleInResponse(
              redirectResponse,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
            return removeTokensFromResponse(redirectResponse)
          }
        } catch (e) {
          console.error('❌ Не удалось обновить токен:', e)
          const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
          setLocaleInResponse(
            redirectResponse,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
          return removeTokensFromResponse(redirectResponse)
        }
      }
    }

    // Обработка защищенных маршрутов
    if (protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      console.log('🛡️ Обнаружен защищенный маршрут:', pathname)

      // Проверка наличия refresh токена
      if (!refreshToken) {
        console.log('❌ Нет refresh токена, редирект на /login')
        const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
        return setLocaleInResponse(
          redirectResponse,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      }

      console.log('🔄 Проверка авторизации пользователя с accessToken')
      try {
        // Пытаемся получить данные пользователя с текущим accessToken
        const {data: userData} = await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
          }
        })
        console.log('✅ Пользователь авторизован, доступ разрешен')

        // Проверка роли и перенаправление
        // Admin имеет доступ ко всем маршрутам
        if (userData.role === 'Admin') {
          console.log('👑 Admin имеет доступ ко всем маршрутам')
          const response = NextResponse.next()
          return setLocaleInResponse(
            response,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        }

        if (userData.role === 'Vendor' && pathname === '/profile') {
          console.log('🔀 Перенаправление User с ролью Vendor на /vendor')
          const response = NextResponse.redirect(new URL('/vendor', request.url))
          return setLocaleInResponse(
            response,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        } else if (userData.role === 'User' && pathname === '/vendor') {
          console.log('🔀 Перенаправление User с ролью User на /profile')
          const response = NextResponse.redirect(new URL('/profile', request.url))
          return setLocaleInResponse(
            response,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        }

        const response = NextResponse.next()
        return setLocaleInResponse(
          response,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
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
          response.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
          setLocaleInResponse(response, localeFromSubdomain || 'en', shouldSetLocaleCookie, acceptLanguageFromRequest)

          console.log('🔐 Новый accessToken установлен в cookies')

          try {
            // Проверяем авторизацию с новым токеном
            console.log(process.env.INTERNAL_REQUEST_SECRET)
            const {data: userData} = await instance.get<User>('/me', {
              headers: {
                Authorization: `Bearer ${tokenData.accessToken}`,
                'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
              }
            })
            console.log('✅ Авторизация с новым токеном успешна')

            if (userData.role === 'Admin') {
              console.log('👑 Admin имеет доступ ко всем маршрутам')
              return response
            }

            if (userData.role === 'Vendor' && pathname === '/profile') {
              console.log('🔀 Перенаправление User с ролью Vendor на /vendor')
              const redirectResponse = NextResponse.redirect(new URL('/vendor', request.url))
              redirectResponse.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
              return setLocaleInResponse(
                redirectResponse,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )
            } else if (userData.role === 'User' && pathname === '/vendor') {
              console.log('🔀 Перенаправление User с ролью User на /profile')
              const redirectResponse = NextResponse.redirect(new URL('/profile', request.url))
              redirectResponse.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
              return setLocaleInResponse(
                redirectResponse,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )
            }

            return response
          } catch (e) {
            console.error('❌ Не удалось авторизоваться даже с новым токеном:', e)
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
            setLocaleInResponse(
              redirectResponse,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
            return removeTokensFromResponse(redirectResponse)
          }
        } catch (e) {
          console.error('❌ Не удалось обновить токен:', e)
          const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
          setLocaleInResponse(
            redirectResponse,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
          return removeTokensFromResponse(redirectResponse)
        }
      }
    }

    // Обработка публичных маршрутов (login, register)
    if (publicRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      console.log('🌐 Обнаружен публичный маршрут:', pathname)

      // Если нет токенов, разрешаем доступ к публичным маршрутам
      if (!accessToken && !refreshToken) {
        console.log('✅ Доступ к публичному маршруту разрешен (нет токенов)')
        const response = NextResponse.next()
        return setLocaleInResponse(
          response,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      }

      // Если есть refreshToken, проверяем авторизацию
      if (refreshToken) {
        console.log('🔄 Проверка существующей авторизации на публичном маршруте')
        try {
          // Пытаемся получить данные пользователя с текущим accessToken
          const {data: userData} = await instance.get<User>('/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
            }
          })
          console.log('✅ Пользователь уже авторизован, редирект на главную')

          // Перенаправление в зависимости от роли
          if (userData.role === 'Admin') {
            console.log('👑 Admin перенаправляется на главную')
            const redirectResponse = NextResponse.redirect(new URL('/profile', request.url))
            return setLocaleInResponse(
              redirectResponse,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
          } else if (userData.role === 'Vendor') {
            console.log('🔀 Перенаправление Vendor на /vendor')
            const redirectResponse = NextResponse.redirect(new URL('/vendor', request.url))
            return setLocaleInResponse(
              redirectResponse,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
          } else if (userData.role === 'User') {
            console.log('🔀 Перенаправление User на /profile')
            const redirectResponse = NextResponse.redirect(new URL('/profile', request.url))
            return setLocaleInResponse(
              redirectResponse,
              localeFromSubdomain || 'en',
              shouldSetLocaleCookie,
              acceptLanguageFromRequest
            )
          }

          const redirectResponse = NextResponse.redirect(new URL('/profile', request.url))
          return setLocaleInResponse(
            redirectResponse,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
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

            // Проверяем данные пользователя с новым токеном
            try {
              const {data: userData} = await instance.get<User>('/me', {
                headers: {
                  Authorization: `Bearer ${tokenData.accessToken}`,
                  'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
                }
              })

              // Перенаправление в зависимости от роли
              let redirectUrl = '/'
              if (userData.role === 'Admin') {
                console.log('👑 Admin перенаправляется на главную')
                redirectUrl = '/profile'
              } else if (userData.role === 'Vendor') {
                console.log('🔀 Перенаправление Vendor на /vendor')
                redirectUrl = '/vendor'
              } else if (userData.role === 'User') {
                console.log('🔀 Перенаправление User на /profile')
                redirectUrl = '/profile'
              }

              // Создаем редирект и устанавливаем обновленные токены
              const response = NextResponse.redirect(new URL(redirectUrl, request.url))
              response.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
              setLocaleInResponse(
                response,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )

              console.log('🔐 Новый accessToken установлен в cookies на публичном маршруте')

              return response
            } catch (userError) {
              console.error('❌ Не удалось получить данные пользователя после обновления токена:', userError)
              // На публичном маршруте мы просто разрешаем доступ, если получение данных не удалось
              const response = NextResponse.next()
              setLocaleInResponse(
                response,
                localeFromSubdomain || 'en',
                shouldSetLocaleCookie,
                acceptLanguageFromRequest
              )
              return removeTokensFromResponse(response)
            }
          } catch (e) {
            console.error('❌ Не удалось обновить токен на публичном маршруте:', e)
            // На публичном маршруте мы просто разрешаем доступ, если обновление не удалось
            // При этом удаляем невалидные токены
            const response = NextResponse.next()
            setLocaleInResponse(response, localeFromSubdomain || 'en', shouldSetLocaleCookie, acceptLanguageFromRequest)
            return removeTokensFromResponse(response)
          }
        }
      }

      console.log('✅ Доступ к публичному маршруту разрешен')
      const response = NextResponse.next()
      return setLocaleInResponse(
        response,
        localeFromSubdomain || 'en',
        shouldSetLocaleCookie,
        acceptLanguageFromRequest
      )
    }

    // Обработка страницы товара /card/[id] — тихий рефреш протухшего accessToken
    if (pathnameWithoutLocale === '/card' || pathnameWithoutLocale.startsWith('/card/')) {
      console.log('🛍️ Обнаружен маршрут /card:', pathname)

      let accessTokenValid = false

      if (accessToken) {
        try {
          await instance.get<User>('/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
            }
          })
          accessTokenValid = true
          console.log('✅ accessToken на /card валиден')
        } catch (error) {
          console.error('❗ accessToken на /card невалиден:', error)
        }
      }

      if (!accessTokenValid && refreshToken) {
        try {
          const {data: tokenData} = await axiosClassic.patch<{accessToken: string}>(
            '/me/current-session/refresh',
            {refreshToken},
            {headers: {'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!}}
          )

          console.log('✅ accessToken обновлён для /card')

          // Обновляем cookie в самом request, чтобы серверные компоненты
          // этого же запроса сразу увидели свежий токен
          request.cookies.set('accessToken', tokenData.accessToken)
          const response = NextResponse.next({request: {headers: request.headers}})
          response.cookies.set('accessToken', tokenData.accessToken, {maxAge: 60 * 60 * 24 * 7})
          return setLocaleInResponse(
            response,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        } catch (e) {
          console.error('❌ Не удалось обновить токен на /card:', e)
          const response = NextResponse.next()
          setLocaleInResponse(response, localeFromSubdomain || 'en', shouldSetLocaleCookie, acceptLanguageFromRequest)
          return removeTokensFromResponse(response)
        }
      }

      const response = NextResponse.next()
      return setLocaleInResponse(
        response,
        localeFromSubdomain || 'en',
        shouldSetLocaleCookie,
        acceptLanguageFromRequest
      )
    }

    if (pathname.startsWith('/data-vendor/')) {
      console.log('🚀 Middleware запущен для пути data-vendor:', request.nextUrl.pathname)

      // Извлекаем ID из пути URL
      const pathSegments = pathname.split('/')
      const id = pathSegments[2] // Получаем ID из /data-vendor/{id}

      console.log('ищем продавца с id:', id)

      // Проверяем, что ID существует и валиден
      if (!id || isNaN(Number(id))) {
        console.log('❌ Невалидный ID продавца:', id)
        // Вместо notFound() делаем редирект на 404 страницу
        const redirectResponse = NextResponse.redirect(new URL('/404', request.url))
        return setLocaleInResponse(
          redirectResponse,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      }

      try {
        const {data} = await axiosClassic.get<User>(`/vendor/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
          }
        })

        console.log('✅ Найден продавец:', data.role)

        const {data: userData} = await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
          }
        })

        if (data.id === userData.id) {
          const response = NextResponse.redirect(new URL('/vendor', request.url))
          return setLocaleInResponse(
            response,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        }

        const response = NextResponse.next()
        return setLocaleInResponse(
          response,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      } catch (e) {
        console.error('❌ Ошибка при получении данных продавца:', e)

        // Проверяем статус ошибки
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = e as any
        if (error?.response?.status === 404 || error?.response?.status === 400) {
          // Продавец не найден или невалидный запрос - редирект на 404
          const redirectResponse = NextResponse.redirect(new URL('/404', request.url))
          return setLocaleInResponse(
            redirectResponse,
            localeFromSubdomain || 'en',
            shouldSetLocaleCookie,
            acceptLanguageFromRequest
          )
        }

        // Для других ошибок просто продолжаем
        const response = NextResponse.next()
        return setLocaleInResponse(
          response,
          localeFromSubdomain || 'en',
          shouldSetLocaleCookie,
          acceptLanguageFromRequest
        )
      }
    }

    // Для всех остальных маршрутов
    console.log('🌍 Обычный маршрут, продолжаем выполнение')
    const response = NextResponse.next()
    return setLocaleInResponse(response, localeFromSubdomain || 'en', shouldSetLocaleCookie, acceptLanguageFromRequest)
  } catch (error) {
    console.error('💥 Критическая ошибка в middleware:', error)
    // В случае критической ошибки просто продолжаем выполнение
    const response = NextResponse.next()
    const localeFromSubdomain = getLocaleFromSubdomain(hostnameFromHeaders || '')

    // Устанавливаем куку даже в случае ошибки
    const existingLocaleCookie = request.cookies.get('NEXT_LOCALE')?.value
    const shouldSetCookie = localeFromSubdomain && !existingLocaleCookie

    return setLocaleInResponse(
      response,
      localeFromSubdomain || 'en',
      shouldSetCookie || false,
      acceptLanguageFromRequest
    )
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico|json|xml|txt)).*)']
}
