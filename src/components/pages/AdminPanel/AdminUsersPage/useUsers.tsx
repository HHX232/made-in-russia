/* eslint-disable @typescript-eslint/no-explicit-any */
import {User} from '@/store/User/user.slice'
import {useState, useCallback} from 'react'
import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query'

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
  isFetchingNextPage: boolean

  // Методы для управления
  loadUsers: () => void
  loadMoreUsers: () => void
  setFilters: (filters: Partial<UsersFilters>) => void
  clearFilters: () => void
  setSort: (sort: UsersParams['sort'], direction?: UsersParams['direction']) => void
  setPage: (page: number) => void
  refreshUsers: () => Promise<void>
}

// Функция для создания ключа запроса
const createUsersQueryKey = (params: UsersParams, filters: UsersFilters) => [
  'users',
  {
    ...params,
    ...filters
  }
]

// Функция для выполнения запроса к API
const fetchUsers = async (instance: any, params: UsersParams, filters: UsersFilters): Promise<UsersResponse> => {
  // Формируем объект запроса только с заполненными полями
  const requestData: any = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    direction: params.direction
  }

  // Добавляем фильтры только если они заданы
  Object.entries({...params, ...filters}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && !['page', 'size', 'sort', 'direction'].includes(key)) {
      requestData[key] = value
    }
  })

  console.log('Запрос пользователей с параметрами:', requestData)

  const response = await instance.get('/user', {
    params: requestData
  })

  return response.data
}

// Основной хук
const useUsers = (instance: any, initialSize: number = 10): UseUsersReturn => {
  const queryClient = useQueryClient()

  // Состояния для параметров запроса
  const [params, setParams] = useState<Omit<UsersParams, keyof UsersFilters>>({
    page: 0,
    size: initialSize,
    sort: 'registrationDate',
    direction: 'asc'
  })

  const [filters, setFiltersState] = useState<UsersFilters>({})

  // Состояние для отслеживания режима работы
  const [useInfiniteMode, setUseInfiniteMode] = useState(false)

  // Основной запрос с пагинацией (только для обычного режима)
  const {data, error, isLoading, refetch} = useQuery({
    queryKey: createUsersQueryKey({...params, ...filters}, {}),
    queryFn: () => fetchUsers(instance, {...params, ...filters}, {}),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
    enabled: !useInfiniteMode // Отключаем когда используется infinite режим
  })

  // Infinite query для loadMore функциональности
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage: hasInfiniteNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
    error: infiniteError,
    refetch: refetchInfinite
  } = useInfiniteQuery({
    queryKey: ['users-infinite', {...params, ...filters}],
    queryFn: ({pageParam = 0}) => fetchUsers(instance, {...params, ...filters, page: pageParam}, {}),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: useInfiniteMode // Включаем только в infinite режиме
  })

  // Получаем данные в зависимости от режима
  const users = useInfiniteMode ? infiniteData?.pages.flatMap((page) => page.content) || [] : data?.content || []

  const totalElements = useInfiniteMode ? infiniteData?.pages[0]?.totalElements || 0 : data?.totalElements || 0

  const totalPages = useInfiniteMode ? infiniteData?.pages[0]?.totalPages || 0 : data?.totalPages || 0

  const currentPage = useInfiniteMode ? (infiniteData?.pages.length || 1) - 1 : data?.number || 0

  // Методы управления
  const loadUsers = useCallback(() => {
    // Переключаемся в обычный режим и перезагружаем
    setUseInfiniteMode(false)
    queryClient.resetQueries({queryKey: ['users-infinite']})
  }, [queryClient])

  const loadMoreUsers = useCallback(() => {
    if (!useInfiniteMode) {
      // Первый вызов - переключаемся в infinite режим
      setUseInfiniteMode(true)
      return
    }

    if (hasInfiniteNextPage && !isFetchingNextPage) {
      console.log('Загружаем следующую страницу через infinite query')
      fetchNextPage()
    }
  }, [useInfiniteMode, fetchNextPage, hasInfiniteNextPage, isFetchingNextPage])

  const setFilters = useCallback(
    (newFilters: Partial<UsersFilters>) => {
      setFiltersState((prev) => ({
        ...prev,
        ...newFilters
      }))

      // Сбрасываем на первую страницу и переключаемся в обычный режим
      setParams((prev) => ({
        ...prev,
        page: 0
      }))

      setUseInfiniteMode(false)

      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({queryKey: ['users']})
      queryClient.invalidateQueries({queryKey: ['users-infinite']})
    },
    [queryClient]
  )

  const clearFilters = useCallback(() => {
    setFiltersState({})
    setParams((prev) => ({
      ...prev,
      page: 0
    }))

    setUseInfiniteMode(false)

    // Инвалидируем запросы
    queryClient.invalidateQueries({queryKey: ['users']})
    queryClient.invalidateQueries({queryKey: ['users-infinite']})
  }, [queryClient])

  const setSort = useCallback(
    (sort: UsersParams['sort'], direction: UsersParams['direction'] = 'asc') => {
      setParams((prev) => ({
        ...prev,
        sort,
        direction,
        page: 0
      }))

      setUseInfiniteMode(false)

      // Инвалидируем запросы
      queryClient.invalidateQueries({queryKey: ['users']})
      queryClient.invalidateQueries({queryKey: ['users-infinite']})
    },
    [queryClient]
  )

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({
      ...prev,
      page
    }))

    // При смене страницы переключаемся в обычный режим
    setUseInfiniteMode(false)
  }, [])

  const refreshUsers = useCallback(async () => {
    if (useInfiniteMode) {
      await refetchInfinite()
    } else {
      await refetch()
    }
  }, [useInfiniteMode, refetch, refetchInfinite])

  // Обработка ошибок
  const errorMessage = useInfiniteMode
    ? (infiniteError as any)?.response?.data?.message ||
      (infiniteError as any)?.message ||
      (infiniteError ? 'Ошибка загрузки пользователей' : null)
    : (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      (error ? 'Ошибка загрузки пользователей' : null)

  return {
    users,
    loading: useInfiniteMode ? isInfiniteLoading : isLoading,
    error: errorMessage,
    filters,
    totalElements,
    totalPages,
    currentPage,
    hasNextPage: useInfiniteMode ? hasInfiniteNextPage : currentPage + 1 < totalPages,
    isFetchingNextPage,

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
