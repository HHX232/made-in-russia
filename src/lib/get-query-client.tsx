// lib/get-query-client.ts
import {QueryClient} from '@tanstack/react-query'

let browserQueryClient: QueryClient | undefined = undefined

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 минута
        gcTime: 10 * 60 * 1000, // 10 минут
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Не повторяем запросы с 401/403 ошибками
          if (error && typeof error === 'object' && 'status' in error) {
            const status = error.status as number
            if (status === 401 || status === 403) return false
          }
          return failureCount < 3
        }
      }
    }
  })
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Сервер: всегда создаем новый query client
    return makeQueryClient()
  } else {
    // Браузер: создаем query client один раз
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
