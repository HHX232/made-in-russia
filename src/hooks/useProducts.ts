/* eslint-disable @typescript-eslint/no-explicit-any */
import {useQuery} from '@tanstack/react-query'
import ProductService from '@/services/products/product.service'
import {useCurrentLanguage} from './useCurrentLanguage'

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
  const currentLang = useCurrentLanguage()
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => await ProductService.getAll(params, specialRoute, currentLang),
    placeholderData: (previousData) => previousData ?? undefined,
    staleTime: 5000 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })
}
