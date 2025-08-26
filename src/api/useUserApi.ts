// hooks/api/useUserApi.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import instance, {axiosClassic} from '@/api/api.interceptor'
import {getAccessToken, getRefreshToken, removeFromStorage, saveTokenStorage} from '@/services/auth/auth.helper'
import {useActions} from '@/hooks/useActions'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {User} from '@/store/User/user.slice'

const USER_QUERY_KEY = ['user'] as const

interface RefreshTokenResponse {
  accessToken: string
}

// Hook для получения данных пользователя
export const useUserQuery = () => {
  const {setUser, clearUser} = useActions() // используем ваш кастомный хук
  const currentLang = useCurrentLanguage()

  return useQuery({
    queryKey: USER_QUERY_KEY,
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

        // Сохраняем данные через ваш action
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
          // Пытаемся обновить токен
          const {data: tokenData} = await axiosClassic.patch<RefreshTokenResponse>(
            '/me/current-session/refresh',
            {refreshToken},
            {
              headers: {
                'Accept-Language': currentLang
              }
            }
          )

          // Сохраняем новый токен
          saveTokenStorage({
            accessToken: tokenData.accessToken,
            refreshToken: refreshToken
          })

          // Повторяем запрос с новым токеном
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
    enabled: !!(getAccessToken() && getRefreshToken()), // Запрос выполняется только если есть токены
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут (бывший cacheTime)
    retry: false, // Не повторяем автоматически, так как у нас есть логика обновления токенов
    refetchOnWindowFocus: false
  })
}

// Hook для логаута
export const useLogout = () => {
  const queryClient = useQueryClient()
  const {clearUser} = useActions()

  return useMutation({
    mutationFn: async () => {
      // Здесь можно добавить API вызов для логаута на сервере
      removeFromStorage()
    },
    onSuccess: () => {
      clearUser()
      queryClient.removeQueries({queryKey: USER_QUERY_KEY})
      queryClient.clear() // Очищаем весь кэш при логауте
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
      // Обновляем кэш пользователя
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
