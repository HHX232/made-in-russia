/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useCallback, useEffect, useRef} from 'react'
import {User} from '@/services/users.types'

// Типы для фильтров и параметров запроса
export interface UsersFilters {
  role?: 'admin' | 'user' | 'vendor'
  isEnabled?: boolean
  login?: string
  email?: string
  phoneNumber?: string
  region?: string
}

export interface UsersParams extends UsersFilters {
  page: number
  size: number
  sort: 'registrationDate' | 'lastModificationDate' | 'login' | 'email'
  direction: 'asc' | 'desc'
}

export interface UsersResponse {
  content: User[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  filters: UsersFilters
  totalElements: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean

  // Методы для управления
  loadUsers: () => Promise<void>
  loadMoreUsers: () => Promise<void>
  setFilters: (filters: Partial<UsersFilters>) => void
  clearFilters: () => void
  setSort: (sort: UsersParams['sort'], direction?: UsersParams['direction']) => void
  setPage: (page: number) => void
  refreshUsers: () => Promise<void>
}

// Функция для удаления дубликатов пользователей по ID
const removeDuplicateUsers = (existingUsers: User[], newUsers: User[]): User[] => {
  // Создаем Set с ID существующих пользователей для быстрого поиска
  const existingIds = new Set(existingUsers.map((user) => user.id))

  // Фильтруем новых пользователей, оставляя только тех, которых еще нет
  const uniqueNewUsers = newUsers.filter((user) => !existingIds.has(user.id))

  console.log(
    `Добавляется ${uniqueNewUsers.length} новых пользователей из ${newUsers.length} (${newUsers.length - uniqueNewUsers.length} дубликатов отфильтровано)`
  )

  return [...existingUsers, ...uniqueNewUsers]
}

const useUsers = (
  instance: any, // Ваш axios instance
  initialSize: number = 10
): UseUsersReturn => {
  // Состояния
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  // Параметры запроса
  const [params, setParams] = useState<UsersParams>({
    page: 0,
    size: initialSize,
    sort: 'registrationDate',
    direction: 'asc'
  })

  // Фильтры отдельно для удобства
  const [filters, setFiltersState] = useState<UsersFilters>({})

  // Ref для отслеживания активного запроса
  const activeRequestRef = useRef<AbortController | null>(null)
  const isInitializedRef = useRef(false)

  // Функция выполнения запроса
  const fetchUsers = useCallback(
    async (requestParams: UsersParams, append: boolean = false) => {
      try {
        // Отменяем предыдущий запрос если он есть
        if (activeRequestRef.current) {
          activeRequestRef.current.abort()
        }

        // Создаем новый AbortController
        const abortController = new AbortController()
        activeRequestRef.current = abortController

        setLoading(true)
        setError(null)

        // Формируем объект запроса только с заполненными полями
        const requestData: any = {
          page: requestParams.page,
          size: requestParams.size,
          sort: requestParams.sort,
          direction: requestParams.direction
        }

        // Добавляем фильтры только если они заданы
        Object.entries(requestParams).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            !['page', 'size', 'sort', 'direction'].includes(key)
          ) {
            requestData[key] = value
          }
        })

        console.log('Запрос пользователей с параметрами:', requestData)

        const response = await instance.get('/user', {
          params: requestData,
          signal: abortController.signal
        })

        // Проверяем, что запрос не был отменен
        if (abortController.signal.aborted) {
          return
        }

        const data: UsersResponse = response.data

        setUsers((prev) => {
          if (append) {
            // При добавлении - используем функцию удаления дубликатов
            return removeDuplicateUsers(prev, data.content)
          } else {
            // При замене - просто заменяем весь список
            return data.content
          }
        })

        setTotalElements(data.totalElements)
        setTotalPages(data.totalPages)
        setCurrentPage(data.number)

        console.log(
          `Загружено ${data.content.length} пользователей (страница ${data.number + 1} из ${data.totalPages})`
        )
      } catch (err: any) {
        // Игнорируем ошибки отмененных запросов
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          console.log('Запрос был отменен')
          return
        }

        console.error('Ошибка загрузки пользователей:', err)
        setError(err?.response?.data?.message || err?.message || 'Ошибка загрузки пользователей')
      } finally {
        setLoading(false)
        activeRequestRef.current = null
      }
    },
    [instance]
  )

  // Загрузка пользователей (заменяет текущий список)
  const loadUsers = useCallback(async () => {
    const requestParams = {...params, ...filters}
    await fetchUsers(requestParams, false)
  }, [params, filters, fetchUsers])

  // Загрузка дополнительных пользователей (добавляет к текущему списку)
  const loadMoreUsers = useCallback(async () => {
    if (currentPage + 1 >= totalPages || loading) {
      console.log('Больше страниц нет или уже идет загрузка')
      return
    }

    const nextPageParams = {
      ...params,
      ...filters,
      page: currentPage + 1
    }

    console.log(`Загрузка дополнительной страницы: ${nextPageParams.page} (текущая: ${currentPage})`)
    await fetchUsers(nextPageParams, true)
  }, [params, filters, currentPage, totalPages, fetchUsers, loading])

  // Установка фильтров
  const setFilters = useCallback((newFilters: Partial<UsersFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters
    }))

    // Сбрасываем на первую страницу при изменении фильтров
    setParams((prev) => ({
      ...prev,
      page: 0
    }))
  }, [])

  // Очистка фильтров
  const clearFilters = useCallback(() => {
    setFiltersState({})
    setParams((prev) => ({
      ...prev,
      page: 0
    }))
  }, [])

  // Установка сортировки
  const setSort = useCallback((sort: UsersParams['sort'], direction: UsersParams['direction'] = 'asc') => {
    setParams((prev) => ({
      ...prev,
      sort,
      direction,
      page: 0 // Сбрасываем на первую страницу
    }))
  }, [])

  // Установка страницы
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({
      ...prev,
      page
    }))
  }, [])

  // Обновление пользователей (перезагрузка текущей страницы)
  const refreshUsers = useCallback(async () => {
    await loadUsers()
  }, [loadUsers])

  // Автоматическая загрузка при изменении параметров - ИСПРАВЛЕНО
  useEffect(() => {
    // Загружаем только при инициализации или изменении фильтров/сортировки
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      loadUsers()
    }
  }, [])

  useEffect(() => {
    if (isInitializedRef.current) {
      setCurrentPage(0)
      loadUsers()
    }
  }, [params.sort, params.direction, filters])

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort()
      }
    }
  }, [])

  // Вычисляемые значения
  const hasNextPage = currentPage + 1 < totalPages

  return {
    users,
    loading,
    error,
    filters,
    totalElements,
    totalPages,
    currentPage,
    hasNextPage,

    loadUsers,
    loadMoreUsers,
    setFilters,
    clearFilters,
    setSort,
    setPage,
    refreshUsers
  }
}

export default useUsers
