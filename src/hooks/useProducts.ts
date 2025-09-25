/* eslint-disable @typescript-eslint/no-explicit-any */
import {useQuery, useQueryClient} from '@tanstack/react-query'
import ProductService from '@/services/products/product.service'
import {useCurrentLanguage} from './useCurrentLanguage'
import {useState, useEffect, useRef} from 'react'
import {Product} from '@/services/products/product.types'
// import {useTypedSelector} from './useTypedSelector'
// import {useTypedSelector} from './useTypedSelector'

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
  direction?: 'asc' | 'desc'
  approveStatuses?: 'ALL' | 'APPROVED' | 'PENDING' | ''
  search?: string
  [key: string]: any
}

// 🔑 Общий ключ для всех запросов продуктов
export const PRODUCTS_QUERY_KEY = 'products'

export const useProducts = (
  params: ProductQueryParams = {},
  resetPageParams: () => void,
  specialRoute?: string | undefined,
  accessToken?: string
) => {
  const currentLang = useCurrentLanguage()
  console.log('currentLang in useProducts', currentLang)
  // const {currentLangValue} = useTypedSelector((state) => state.currentLangSlice)
  const [resData, setResData] = useState<Product[]>([])
  const prevParamsRef = useRef<string>('')
  const queryClient = useQueryClient()
  const prevLangRef = useRef<string | null>(currentLang)
  // Создаем ключ для отслеживания изменений параметров (исключая page)
  const paramsWithoutPage = {...params}
  delete paramsWithoutPage.page
  const currentParamsKey = JSON.stringify([paramsWithoutPage, specialRoute])

  // Отдельно отслеживаем изменения параметров для очистки данных
  useEffect(() => {
    if (prevParamsRef.current !== currentParamsKey) {
      console.log('Параметры изменились, очищаем данные')
      setResData([])
      prevParamsRef.current = currentParamsKey
    }
  }, [currentParamsKey])

  const queryKey = [PRODUCTS_QUERY_KEY, currentLang, currentParamsKey, specialRoute, params.page]
  useEffect(() => {
    // Clear resData if params or language changed to prevent stale merge
    if (prevParamsRef.current !== currentParamsKey || prevLangRef.current !== currentLang) {
      resetPageParams()
      setResData([])
      prevParamsRef.current = currentParamsKey
      prevLangRef.current = currentLang
      queryClient.invalidateQueries({queryKey: [PRODUCTS_QUERY_KEY]}) // Invalidate cache on language or params change
    }
  }, [currentParamsKey, currentLang, queryClient])
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('Выполняем запрос с параметрами:', params)
      const res = await ProductService.getAll(
        {...params, approveStatuses: params.approveStatuses === 'ALL' ? '' : params.approveStatuses},
        specialRoute,
        currentLang,
        accessToken
      )

      return res
    },
    placeholderData: (previousData) => previousData ?? undefined,
    staleTime: 30000, // 30 секунд
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  // Отдельный useEffect для обновления resData
  useEffect(() => {
    if (queryResult.data) {
      console.log('Получили данные от API:', queryResult.data.content.length, 'товаров')

      setResData((prev) => {
        if (!params.page || params.page === 0) {
          console.log('Заменяем данные (первая страница)')
          return queryResult.data.content
        }

        console.log('Добавляем к существующим данным')
        const newUniqueProducts = queryResult.data.content.filter(
          (newProduct) => !prev.some((prevProduct) => prevProduct.id === newProduct.id)
        )

        return [...prev, ...newUniqueProducts]
      })
    }
  }, [queryResult.data, params.page])

  const forceRefetch = async () => {
    console.log('Принудительное обновление')
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
