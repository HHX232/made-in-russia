/* eslint-disable @typescript-eslint/no-explicit-any */
import {useQuery} from '@tanstack/react-query'
import ProductService from '@/services/products/product.service'

// Типы для параметров запроса продуктов
export interface ProductQueryParams {
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  delivery?: string[]
  page?: number
  limit?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  // Поддержка для других произвольных параметров
  [key: string]: any
}

export const useProducts = (params: ProductQueryParams = {}, specialRoute?: string | undefined) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => await ProductService.getAll(params, specialRoute),
    placeholderData: (previousData) => previousData ?? undefined,
    // Включаем ручное управление инвалидацией
    // staleTime - время, в течение которого данные считаются "свежими"
    staleTime: 5000 * 60, // 1 минута
    // refetchOnWindowFocus - перезапрос данных при фокусе окна
    refetchOnWindowFocus: false,
    // refetchOnMount - перезапрос данных при монтировании компонента
    refetchOnMount: true
  })
}
