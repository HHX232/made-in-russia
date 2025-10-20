/* eslint-disable @typescript-eslint/no-explicit-any */
import {useQuery, useQueryClient} from '@tanstack/react-query'
import ProductService from '@/services/products/product.service'
import {useCurrentLanguage} from './useCurrentLanguage'
import {useState, useEffect, useRef} from 'react'
import {Product} from '@/services/products/product.types'

export interface ProductQueryParams {
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  delivery?: string[]
  page?: number
  limit?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
  approveStatuses?: 'ALL' | 'APPROVED' | 'PENDING' | ''
  search?: string
  [key: string]: any
}

export const PRODUCTS_QUERY_KEY = 'products'

export const useProducts = (
  params: ProductQueryParams = {},
  resetPageParams: () => void,
  specialRoute?: string | undefined,
  accessToken?: string
) => {
  const currentLang = useCurrentLanguage()

  const [resData, setResData] = useState<Product[]>([])
  const prevParamsRef = useRef<string>('')
  const queryClient = useQueryClient()
  const prevLangRef = useRef<string | null>(currentLang)
  const isInitialMount = useRef(true)

  const paramsWithoutPage = {...params}
  delete paramsWithoutPage.page
  const currentParamsKey = JSON.stringify([paramsWithoutPage, specialRoute])

  const queryKey = [PRODUCTS_QUERY_KEY, currentLang, currentParamsKey, specialRoute, params.page]

  // Отслеживаем изменения параметров
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevParamsRef.current = currentParamsKey
      prevLangRef.current = currentLang
      return
    }

    if (prevParamsRef.current !== currentParamsKey || prevLangRef.current !== currentLang) {
      console.log('🔄 Params or language changed, clearing data')
      resetPageParams()
      setResData([])
      prevParamsRef.current = currentParamsKey
      prevLangRef.current = currentLang
      queryClient.invalidateQueries({queryKey: [PRODUCTS_QUERY_KEY]})
    }
  }, [currentParamsKey, currentLang, queryClient, resetPageParams])

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('🔍 Executing query with params:', params)
      const res = await ProductService.getAll(
        {...params, approveStatuses: params.approveStatuses === 'ALL' ? '' : params.approveStatuses},
        specialRoute,
        currentLang,
        accessToken
      )

      console.log('✅ Query result:', res?.content?.length || 0, 'products')
      return res
    },
    placeholderData: (previousData) => previousData ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  })

  // Обновляем resData при получении данных
  useEffect(() => {
    if (queryResult.data?.content) {
      console.log('📥 API response received:', queryResult.data.content.length, 'products')

      setResData((prev) => {
        if (!params.page || params.page === 0) {
          console.log('✅ Replacing data (first page)')
          return queryResult.data.content
        }

        console.log('➕ Adding to existing data')
        const newUniqueProducts = queryResult.data.content.filter(
          (newProduct) => !prev.some((prevProduct) => prevProduct.id === newProduct.id)
        )

        return [...prev, ...newUniqueProducts]
      })
    }
  }, [queryResult.data, params.page])

  const forceRefetch = async () => {
    console.log('🔄 Force refetch')
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
