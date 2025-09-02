/* eslint-disable @typescript-eslint/no-explicit-any */
import {useQuery, useQueryClient} from '@tanstack/react-query'
import ProductService from '@/services/products/product.service'
import {useCurrentLanguage} from './useCurrentLanguage'
import {useState, useEffect, useRef} from 'react'
import {Product} from '@/services/products/product.types'

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
  [key: string]: any
}

// 🔑 Общий ключ для всех запросов продуктов
export const PRODUCTS_QUERY_KEY = 'products'

export const useProducts = (params: ProductQueryParams = {}, specialRoute?: string | undefined) => {
  const currentLang = useCurrentLanguage()
  const [resData, setResData] = useState<Product[]>([])
  const prevParamsRef = useRef<string>('')
  const queryClient = useQueryClient()

  // Создаем ключ для отслеживания изменений параметров (исключая page)
  const paramsWithoutPage = {...params}
  delete paramsWithoutPage.page
  const currentParamsKey = JSON.stringify([paramsWithoutPage, specialRoute])

  useEffect(() => {
    if (prevParamsRef.current !== currentParamsKey) {
      setResData([])
      prevParamsRef.current = currentParamsKey
    }
  }, [currentParamsKey])

  const queryKey = [PRODUCTS_QUERY_KEY, params, specialRoute]

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await ProductService.getAll(params, specialRoute, currentLang)

      setResData((prev) => {
        if (!params.page || params.page === 0) {
          return res.content
        }

        const newUniqueProducts = res.content.filter(
          (newProduct) => !prev.some((prevProduct) => prevProduct.id === newProduct.id)
        )

        return [...prev, ...newUniqueProducts]
      })

      return res
    },
    placeholderData: (previousData) => previousData ?? undefined,
    staleTime: 5000 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  const forceRefetch = async () => {
    setResData([])
    await queryClient.invalidateQueries({queryKey: [PRODUCTS_QUERY_KEY]})
    queryResult.refetch()
  }

  return {
    ...queryResult,
    resData,
    forceRefetch
  }
}

export const invalidateProductsCache = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({queryKey: [PRODUCTS_QUERY_KEY]})
}
