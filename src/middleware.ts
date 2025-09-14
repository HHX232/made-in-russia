import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import instance, {axiosClassic} from './api/api.interceptor'
import Cookies from 'js-cookie'
import {User} from './services/users.types'
import ICardFull from './services/card/card.types'

const getLocaleFromPathname = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (['en', 'ru', 'zh'].includes(firstSegment)) {
    return firstSegment
  }
  return null
}

const createLocalizedURL = (path: string, locale: string | null): string => {
  if (locale) {
    return `/${locale}${path.startsWith('/') ? path : `/${path}`}`
  }
  return path.startsWith('/') ? path : `/${path}`
}

const getPathnameWithoutLocale = (pathname: string): string => {
  const locale = getLocaleFromPathname(pathname)
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/'
  }
  return pathname
}

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

const protectedRoutes = ['/basket', '/profile', '/vendor', '/create-card']
const protectedAdminRoutes = ['/admin']
const publicRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  console.log('🚀 Middleware запущен для пути:', request.nextUrl.pathname)

  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next()
    const locale = getLocaleFromPathname(request.nextUrl.pathname)
    if (locale) {
      response.headers.set('x-locale', locale)
    }
    return response // Пропускаем для API
  }

  try {
    const {pathname} = request.nextUrl
    const locale = getLocaleFromPathname(pathname)
    const pathnameWithoutLocale = getPathnameWithoutLocale(pathname)
    console.log('🌐 Обнаружена локаль:', locale, 'Путь без локали:', pathnameWithoutLocale)

    // Проверяем наличие токенов в запросе
    const accessToken = request.cookies.get('accessToken')?.value || ''
    const refreshToken = request.cookies.get('refreshToken')?.value || ''

    console.log('📌 Проверка токенов:', {
      accessTokenExists: !!accessToken,
      refreshTokenExists: !!refreshToken,
      path: pathnameWithoutLocale
    })

    // Обработка маршрутов create-card
    if (pathnameWithoutLocale === '/create-card' || pathnameWithoutLocale.startsWith('/create-card/')) {
      console.log('🎨 Обнаружен маршрут create-card:', pathnameWithoutLocale)

      console.log('locale in start middleware', locale)
      // Проверка наличия refresh токена
      if (!refreshToken) {
        console.log('❌ Нет refresh токена, редирект на /login')
        const loginUrl = createLocalizedURL('/login', locale)
        const response = NextResponse.redirect(new URL(loginUrl, request.url))
        response.headers.set('x-locale', locale || 'en')
        return response
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
          const homeUrl = createLocalizedURL('/', locale)
          const response = NextResponse.redirect(new URL(homeUrl, request.url))
          response.headers.set('x-locale', locale || 'en')
          return response
        }

        // Если это маршрут с ID товара
        if (pathnameWithoutLocale.startsWith('/create-card/') && pathnameWithoutLocale !== '/create-card') {
          const pathSegments = pathnameWithoutLocale.split('/')
          const productId = pathSegments[2]

          console.log('🔍 Проверка доступа к товару с ID:', productId)

          if (!productId || isNaN(Number(productId))) {
            console.log('❌ Невалидный ID товара:', productId)
            const createCardUrl = createLocalizedURL('/create-card', locale)
            const response = NextResponse.redirect(new URL(createCardUrl, request.url))
            response.headers.set('x-locale', locale || 'en')
            return response
          }

          try {
            // Получаем данные о товаре
            const {data: productData} = await axiosClassic.get<ICardFull>(`/products/${productId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
                'Accept-Language': locale || 'en',
                'X-Locale': locale || 'en'
              }
            })

            const productOwnerId = productData?.user.id
            console.log('📦 Владелец товара:', productOwnerId, 'Текущий пользователь:', userData.id)

            // Админ имеет доступ ко всем товарам
            if (userData.role === 'Admin') {
              console.log('👑 Admin имеет доступ к редактированию любого товара')
              const response = NextResponse.next()
              response.headers.set('x-locale', locale || 'en')
              return response
            }

            // Проверяем, является ли пользователь владельцем товара
            if (productOwnerId !== userData.id) {
              console.log('❌ Пользователь не является владельцем товара, редирект на /create-card')
              const createCardUrl = createLocalizedURL('/create-card', locale)
              const response = NextResponse.redirect(new URL(createCardUrl, request.url))
              response.headers.set('x-locale', locale || 'en')
              return response
            }

            console.log('✅ Пользователь является владельцем товара, доступ разрешен')
            const response = NextResponse.next()
            response.headers.set('x-locale', locale || 'en')
            return response
          } catch (error) {
            console.error('❌ Ошибка при получении данных товара:', error)
            // Если товар не найден или произошла ошибка, редиректим на /create-card
            const createCardUrl = createLocalizedURL('/create-card', locale)
            const response = NextResponse.redirect(new URL(createCardUrl, request.url))
            response.headers.set('x-locale', locale || 'en')
            return response
          }
        }

        // Для маршрута /create-card без ID просто разрешаем доступ Vendor и Admin
        const response = NextResponse.next()
        response.headers.set('x-locale', locale || 'en')
        return response
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
          response.cookies.set('accessToken', tokenData.accessToken)

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
            const homeUrl = createLocalizedURL('/', locale)
            const redirectResponse = NextResponse.redirect(new URL(homeUrl, request.url))
            redirectResponse.cookies.set('accessToken', tokenData.accessToken)
            redirectResponse.headers.set('x-locale', locale || 'en')
            return redirectResponse
          }

          response.headers.set('x-locale', locale || 'en')
          return response
        } catch (e) {
          console.error('❌ Не удалось обновить токен:', e)
          const loginUrl = createLocalizedURL('/login', locale)
          const redirectResponse = NextResponse.redirect(new URL(loginUrl, request.url))
          redirectResponse.headers.set('x-locale', locale || 'en')
          return removeTokensFromResponse(redirectResponse)
        }
      }
    }

    if (protectedAdminRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      console.log('🛡️ Обнаружен admin маршрут:', pathnameWithoutLocale)

      // Проверка наличия refresh токена
      if (!refreshToken) {
        console.log('❌ Нет refresh токена, редирект на /login')
        const loginUrl = createLocalizedURL('/login', locale)
        const redirectResponse = NextResponse.redirect(new URL(loginUrl, request.url))
        redirectResponse.headers.set('x-locale', locale || 'en')
        return redirectResponse
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
          response.headers.set('x-locale', locale || 'en')
          return response
        } else {
          const homeUrl = createLocalizedURL('/', locale)
          const redirectResponse = NextResponse.redirect(new URL(homeUrl, request.url))
          redirectResponse.headers.set('x-locale', locale || 'en')
          return redirectResponse
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
          response.cookies.set('accessToken', tokenData.accessToken)
          // refreshToken остается прежним, если сервер не вернул новый
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
              response.headers.set('x-locale', locale || 'en')
              return response
            }

            if (userData.role === 'Vendor' && pathnameWithoutLocale === '/profile') {
              console.log('🔀 Перенаправление User с ролью Vendor на /vendor')
              const redirectResponse = NextResponse.redirect(
                new URL(createLocalizedURL('/vendor', locale), request.url)
              )
              redirectResponse.cookies.set('accessToken', tokenData.accessToken)
              redirectResponse.headers.set('x-locale', locale || 'en')
              return redirectResponse
            } else if (userData.role === 'User' && pathnameWithoutLocale === '/vendor') {
              console.log('🔀 Перенаправление User с ролью User на /profile')
              const redirectResponse = NextResponse.redirect(
                new URL(createLocalizedURL('/profile', locale), request.url)
              )
              redirectResponse.cookies.set('accessToken', tokenData.accessToken)
              redirectResponse.headers.set('x-locale', locale || 'en')
              return redirectResponse
            }

            return response
          } catch (e) {
            console.error('❌ Не удалось авторизоваться даже с новым токеном:', e)
            const loginUrl = createLocalizedURL('/login', locale)
            const redirectResponse = NextResponse.redirect(new URL(loginUrl, request.url))
            redirectResponse.headers.set('x-locale', locale || 'en')
            return removeTokensFromResponse(redirectResponse)
          }
        } catch (e) {
          console.error('❌ Не удалось обновить токен:', e)
          const loginUrl = createLocalizedURL('/login', locale)
          const redirectResponse = NextResponse.redirect(new URL(loginUrl, request.url))
          redirectResponse.headers.set('x-locale', locale || 'en')
          return removeTokensFromResponse(redirectResponse)
        }
      }
    }

    // Обработка защищенных маршрутов
    if (protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      console.log('🛡️ Обнаружен защищенный маршрут:', pathnameWithoutLocale)

      // Проверка наличия refresh токена
      if (!refreshToken) {
        console.log('❌ Нет refresh токена, редирект на /login')
        const loginUrl = createLocalizedURL('/login', locale)
        const redirectResponse = NextResponse.redirect(new URL(loginUrl, request.url))
        redirectResponse.headers.set('x-locale', locale || 'en')
        return redirectResponse
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
          response.headers.set('x-locale', locale || 'en')
          return response
        }

        if (userData.role === 'Vendor' && pathnameWithoutLocale === '/profile') {
          console.log('🔀 Перенаправление User с ролью Vendor на /vendor')
          const vendorUrl = createLocalizedURL('/vendor', locale)
          const response = NextResponse.redirect(new URL(vendorUrl, request.url))
          response.headers.set('x-locale', locale || 'en')
          return response
        } else if (userData.role === 'User' && pathnameWithoutLocale === '/vendor') {
          console.log('🔀 Перенаправление User с ролью User на /profile')
          const profileUrl = createLocalizedURL('/profile', locale)
          const response = NextResponse.redirect(new URL(profileUrl, request.url))
          response.headers.set('x-locale', locale || 'en')
          return response
        }

        const response = NextResponse.next()
        response.headers.set('x-locale', locale || 'en')
        return response
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
              response.headers.set('x-locale', locale || 'en')
              return response
            }

            if (userData.role === 'Vendor' && pathnameWithoutLocale === '/profile') {
              console.log('🔀 Перенаправление User с ролью Vendor на /vendor')
              const redirectResponse = NextResponse.redirect(
                new URL(createLocalizedURL('/vendor', locale), request.url)
              )
              redirectResponse.cookies.set('accessToken', tokenData.accessToken)
              redirectResponse.headers.set('x-locale', locale || 'en')
              return redirectResponse
            } else if (userData.role === 'User' && pathnameWithoutLocale === '/vendor') {
              console.log('🔀 Перенаправление User с ролью User на /profile')
              const redirectResponse = NextResponse.redirect(
                new URL(createLocalizedURL('/profile', locale), request.url)
              )
              redirectResponse.cookies.set('accessToken', tokenData.accessToken)
              redirectResponse.headers.set('x-locale', locale || 'en')
              return redirectResponse
            }

            return response
          } catch (e) {
            console.error('❌ Не удалось авторизоваться даже с новым токеном:', e)
            const loginUrl = createLocalizedURL('/login', locale)
            const redirectResponse = NextResponse.redirect(new URL(loginUrl, request.url))
            redirectResponse.headers.set('x-locale', locale || 'en')
            return removeTokensFromResponse(redirectResponse)
          }
        } catch (e) {
          console.error('❌ Не удалось обновить токен:', e)
          const loginUrl = createLocalizedURL('/login', locale)
          const redirectResponse = NextResponse.redirect(new URL(loginUrl, request.url))
          redirectResponse.headers.set('x-locale', locale || 'en')
          return removeTokensFromResponse(redirectResponse)
        }
      }
    }

    // Обработка публичных маршрутов (login, register)
    if (publicRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      console.log('🌐 Обнаружен публичный маршрут:', pathnameWithoutLocale)

      // Если нет токенов, разрешаем доступ к публичным маршрутам
      if (!accessToken && !refreshToken) {
        console.log('✅ Доступ к публичному маршруту разрешен (нет токенов)')
        const response = NextResponse.next()
        response.headers.set('x-locale', locale || 'en')
        return response
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
            const homeUrl = createLocalizedURL('/', locale)
            const redirectResponse = NextResponse.redirect(new URL(homeUrl, request.url))
            redirectResponse.headers.set('x-locale', locale || 'en')
            return redirectResponse
          } else if (userData.role === 'Vendor') {
            console.log('🔀 Перенаправление Vendor на /vendor')
            const vendorUrl = createLocalizedURL('/vendor', locale)
            const redirectResponse = NextResponse.redirect(new URL(vendorUrl, request.url))
            redirectResponse.headers.set('x-locale', locale || 'en')
            return redirectResponse
          } else if (userData.role === 'User') {
            console.log('🔀 Перенаправление User на /profile')
            const profileUrl = createLocalizedURL('/profile', locale)
            const redirectResponse = NextResponse.redirect(new URL(profileUrl, request.url))
            redirectResponse.headers.set('x-locale', locale || 'en')
            return redirectResponse
          }

          const homeUrl = createLocalizedURL('/', locale)
          const redirectResponse = NextResponse.redirect(new URL(homeUrl, request.url))
          redirectResponse.headers.set('x-locale', locale || 'en')
          return redirectResponse
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
                redirectUrl = '/'
              } else if (userData.role === 'Vendor') {
                console.log('🔀 Перенаправление Vendor на /vendor')
                redirectUrl = '/vendor'
              } else if (userData.role === 'User') {
                console.log('🔀 Перенаправление User на /profile')
                redirectUrl = '/profile'
              }

              // Создаем редирект и устанавливаем обновленные токены
              const redirectUrlNew = createLocalizedURL(redirectUrl, locale)
              const response = NextResponse.redirect(new URL(redirectUrlNew, request.url))
              response.cookies.set('accessToken', tokenData.accessToken)
              response.headers.set('x-locale', locale || 'en')
              // refreshToken остается прежним
              console.log('🔐 Новый accessToken установлен в cookies на публичном маршруте')

              return response
            } catch (userError) {
              console.error('❌ Не удалось получить данные пользователя после обновления токена:', userError)
              // На публичном маршруте мы просто разрешаем доступ, если получение данных не удалось
              const response = NextResponse.next()
              response.headers.set('x-locale', locale || 'en')
              return removeTokensFromResponse(response)
            }
          } catch (e) {
            console.error('❌ Не удалось обновить токен на публичном маршруте:', e)
            // На публичном маршруте мы просто разрешаем доступ, если обновление не удалось
            // При этом удаляем невалидные токены
            const response = NextResponse.next()
            response.headers.set('x-locale', locale || 'en')
            return removeTokensFromResponse(response)
          }
        }
      }

      console.log('✅ Доступ к публичному маршруту разрешен')
      const response = NextResponse.next()
      response.headers.set('x-locale', locale || 'en')
      return response
    }

    if (pathnameWithoutLocale.startsWith('/data-vendor/')) {
      console.log('🚀 Middleware запущен для пути:', request.nextUrl.pathname)

      // Извлекаем ID из пути URL
      const pathSegments = pathnameWithoutLocale.split('/')
      const id = pathSegments[2] // Получаем ID из /data-vendor/{id}

      console.log('ищем продавца с id:', id)

      // Проверяем, что ID существует и валиден
      if (!id || isNaN(Number(id))) {
        console.log('❌ Невалидный ID продавца:', id)
        // Вместо notFound() делаем редирект на 404 страницу
        const redirectResponse = NextResponse.redirect(new URL(createLocalizedURL('/404', locale), request.url))
        redirectResponse.headers.set('x-locale', locale || 'en')
        return redirectResponse
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
          response.headers.set('x-locale', locale || 'en')
          return response
        }
        const response = NextResponse.next()
        response.headers.set('x-locale', locale || 'en')
        return response
      } catch (e) {
        console.error('❌ Ошибка при получении данных продавца:', e)

        // Проверяем статус ошибки
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = e as any
        if (error?.response?.status === 404 || error?.response?.status === 400) {
          // Продавец не найден или невалидный запрос - редирект на 404
          const redirectResponse = NextResponse.redirect(new URL(createLocalizedURL('/404', locale), request.url))
          redirectResponse.headers.set('x-locale', locale || 'en')
          return redirectResponse
        }

        // Для других ошибок просто продолжаем
        const response = NextResponse.next()
        response.headers.set('x-locale', locale || 'en')
        return response
      }
    }

    // Для всех остальных маршрутов
    console.log('🌍 Обычный маршрут, продолжаем выполнение')
    const response = NextResponse.next()
    response.headers.set('x-locale', locale || 'en')
    return response
  } catch (error) {
    console.error('💥 Критическая ошибка в middleware:', error)
    // В случае критической ошибки просто продолжаем выполнение
    const response = NextResponse.next()
    const locale = getLocaleFromPathname(request.nextUrl.pathname)
    response.headers.set('x-locale', locale || 'en')
    return response
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico|json|xml|txt)).*)']
}
