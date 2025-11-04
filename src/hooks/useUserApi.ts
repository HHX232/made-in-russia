// hooks/api/useUserApi.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import instance, {axiosClassic} from '@/api/api.interceptor'
import {getAccessToken, getRefreshToken, removeFromStorage, saveTokenStorage} from '@/services/auth/auth.helper'
import {useActions} from '@/hooks/useActions'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {useRouter} from 'next/navigation'

interface User {
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
  avatarUrl: string
}

const USER_QUERY_KEY = ['user'] as const

interface RefreshTokenResponse {
  accessToken: string
}

// Hook для получения данных пользователя
export const useUserQuery = () => {
  const {setUser, clearUser} = useActions()
  const currentLang = useCurrentLanguage()

  return useQuery({
    queryKey: [USER_QUERY_KEY, currentLang],
    queryFn: async (): Promise<User> => {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()

      if (!refreshToken || !accessToken) {
        throw new Error('No tokens available')
      }

      try {
        const response = await instance.get<User>('/me', {
          headers: {
            'Accept-Language': currentLang
          }
        })

        setUser(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to fetch user data:', error)

        if (!refreshToken) {
          clearUser()
          removeFromStorage()
          throw error
        }

        try {
          const {data: tokenData} = await axiosClassic.patch<RefreshTokenResponse>(
            '/me/current-session/refresh',
            {refreshToken},
            {
              headers: {
                'Accept-Language': currentLang
              }
            }
          )

          saveTokenStorage({
            accessToken: tokenData.accessToken,
            refreshToken: refreshToken
          })

          const response = await instance.get<User>('/me', {
            headers: {
              'Accept-Language': currentLang
            }
          })

          setUser(response.data)
          return response.data
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
          clearUser()
          removeFromStorage()
          throw refreshError
        }
      }
    },
    enabled: !!(getAccessToken() && getRefreshToken()),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // НОВОЕ: Добавляем плейсхолдер для мгновенной очистки
    placeholderData: (previousData) => {
      // Если нет токенов, возвращаем undefined вместо старых данных
      const hasTokens = !!(getAccessToken() && getRefreshToken())
      return hasTokens ? previousData : undefined
    }
  })
}

// Hook для логаута
export const useLogout = () => {
  const queryClient = useQueryClient()
  const {clearUser} = useActions()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      try {
        // КРИТИЧНО: Отправляем запрос на сервер для удаления cookies
        await instance.post('/auth/logout', {})
      } catch (error) {
        console.error('Server logout failed:', error)
      }
    },
    onMutate: async () => {
      // 1. ПЕРВЫМ ДЕЛОМ очищаем токены на КЛИЕНТЕ
      removeFromStorage()

      // 2. Затем очищаем Redux state
      clearUser()

      // 3. Отменяем все активные запросы
      await queryClient.cancelQueries()

      // 4. СИНХРОННО очищаем кэш React Query
      queryClient.setQueryData(USER_QUERY_KEY, null)
      queryClient.removeQueries({queryKey: USER_QUERY_KEY})

      // 5. Очищаем весь остальной кэш
      queryClient.clear()
    },
    onError: async () => {
      removeFromStorage()

      clearUser()

      await queryClient.cancelQueries()

      queryClient.setQueryData(USER_QUERY_KEY, null)
      queryClient.removeQueries({queryKey: USER_QUERY_KEY})

      queryClient.clear()
    },
    onSettled: async () => {
      // КРИТИЧНО: Делаем server-side запрос для удаления cookies через API route
      try {
        await fetch('/backend/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Failed to clear server cookies:', error)
      }

      // Редирект после полной очистки
      router.push('/')

      // Принудительная перезагрузка для гарантии синхронизации
      router.refresh()
    }
  })
}

// Hook для обновления аватара
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient()
  const currentLang = useCurrentLanguage()

  return useMutation({
    mutationFn: async (avatarUrl: string): Promise<User> => {
      const response = await instance.patch<User>(
        '/me/avatar',
        {avatarUrl},
        {
          headers: {
            'Accept-Language': currentLang
          }
        }
      )
      return response.data
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_QUERY_KEY, updatedUser)
    }
  })
}

// Утилиты для работы с кэшем пользователя
export const useUserCache = () => {
  const queryClient = useQueryClient()

  return {
    getUserFromCache: () => queryClient.getQueryData<User>(USER_QUERY_KEY),
    invalidateUser: () => queryClient.invalidateQueries({queryKey: USER_QUERY_KEY}),
    removeUserFromCache: () => queryClient.removeQueries({queryKey: USER_QUERY_KEY})
  }
}
