import {useEffect, useState, useRef} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Product} from '@/services/products/product.types'
import ProductService from '@/services/products/product.service'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

interface PageParams {
  page: number
  size: number
  minPrice?: number
  maxPrice?: number
  categoryIds?: string
  title?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL' | '' | 'REJECTED'
  direction?: 'asc' | 'desc'
  deliveryMethodIds?: string
  sort?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface PageResponse {
  content: Product[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  last: boolean
  first: boolean
  numberOfElements: number
  empty: boolean
}

interface UseProductsWithPaginationReturn {
  data: PageResponse | undefined
  products: Product[]
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  error: Error | null
}

/**
 * Хук для работы с продуктами с пагинацией
 * Возвращает ТОЛЬКО продукты текущей страницы, не накапливает их
 *
 * @param params - Параметры запроса (page, size, фильтры и т.д.)
 * @param onReset - Колбэк для сброса (не используется в этой версии)
 * @param specialRoute - Специальный роут для API (опционально)
 * @param accessToken - Токен доступа (опционально)
 * @param enabled - Включить/выключить автоматическую загрузку (по умолчанию true)
 * @returns Объект с данными, состоянием загрузки и ошибками
 *
 * @example
 * const { products, data, isLoading } = useProductsWithPagination(
 *   { page: 0, size: 9, title: 'search' },
 *   () => {},
 *   '/api/products/special',
 *   'token123',
 *   true // enabled
 * )
 */
const useProductsWithPagination = (
  params: PageParams,
  onReset?: () => void,
  specialRoute?: string,
  accessToken?: string
): UseProductsWithPaginationReturn => {
  const [currentPageProducts, setCurrentPageProducts] = useState<Product[]>([])
  const previousPageRef = useRef<number>(-1)
  const currentLang = useCurrentLanguage()
  // Создаем уникальный ключ для React Query
  // Включаем все параметры для правильного кэширования
  const queryKey = [
    'products-pagination',
    currentLang,
    params.page,
    params.size,
    params.minPrice,
    params.maxPrice,
    params.categoryIds,
    params.title,
    params.approveStatuses,
    params.direction,
    params.deliveryMethodIds,
    params.sort,
    specialRoute,
    accessToken
  ]

  // Определяем функцию для загрузки данных
  const fetchProducts = async (): Promise<PageResponse> => {
    console.log('🔄 useProductsWithPagination: Fetching products', {
      page: params.page,
      size: params.size,
      filters: {
        title: params.title,
        categoryIds: params.categoryIds,
        priceRange: `${params.minPrice}-${params.maxPrice}`,
        delivery: params.deliveryMethodIds
      }
    })

    try {
      let response: PageResponse

      if (specialRoute) {
        // Если есть специальный роут
        response = await ProductService.getAll(params, specialRoute, currentLang, accessToken)
      } else {
        // Стандартный запрос
        response = await ProductService.getAll(params, undefined, currentLang, accessToken)
      }

      console.log('✅ useProductsWithPagination: Products fetched successfully', {
        page: response.number,
        contentLength: response.content.length,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.last
      })

      return response
    } catch (error) {
      console.error('❌ useProductsWithPagination: Error fetching products', error)
      throw error
    }
  }

  // Используем React Query для кэширования и управления состоянием
  const {data, isLoading, isError, isFetching, error} = useQuery<PageResponse, Error>({
    queryKey,
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 минут - данные считаются свежими
    gcTime: 1000 * 60 * 10, // 10 минут - время хранения в кэше
    retry: 2, // Повторить запрос 2 раза при ошибке
    refetchOnWindowFocus: false, // Не перезагружать при фокусе окна
    enabled: true // Всегда включено
  })

  // Обновляем продукты текущей страницы при получении новых данных
  useEffect(() => {
    if (data?.content) {
      console.log('📦 useProductsWithPagination: Updating current page products', {
        productsCount: data.content.length,
        page: data.number
      })
      setCurrentPageProducts(data.content)
      previousPageRef.current = params.page
    }
  }, [data, params.page])

  // Сбрасываем продукты при смене страницы (для предотвращения мерцания старых данных)
  useEffect(() => {
    if (previousPageRef.current !== -1 && previousPageRef.current !== params.page) {
      console.log('🔄 useProductsWithPagination: Page changed, clearing products temporarily', {
        from: previousPageRef.current,
        to: params.page
      })
      // Не очищаем продукты полностью, чтобы избежать мерцания
      // React Query покажет кэшированные данные или загрузит новые
    }
  }, [params.page])

  return {
    data,
    products: currentPageProducts, // Возвращаем ТОЛЬКО продукты текущей страницы
    isLoading,
    isError,
    isFetching,
    error: error as Error | null
  }
}
// import {useEffect, useState, useRef} from 'react'
// import {useQuery} from '@tanstack/react-query'
// import {Product} from '@/services/products/product.types'
// import ProductService from '@/services/products/product.service'

export default useProductsWithPagination
