/* eslint-disable @typescript-eslint/no-explicit-any */
import {useQuery} from '@tanstack/react-query'
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
  // Поддержка для других произвольных параметров
  [key: string]: any
}

export const useProducts = (params: ProductQueryParams = {}, specialRoute?: string | undefined) => {
  const currentLang = useCurrentLanguage()
  const [resData, setResData] = useState<Product[]>([])
  const prevParamsRef = useRef<string>('')

  // Создаем ключ для отслеживания изменений параметров (исключая page)
  const paramsWithoutPage = {...params}
  delete paramsWithoutPage.page
  const currentParamsKey = JSON.stringify([paramsWithoutPage, specialRoute])

  // Проверяем, изменились ли параметры (исключая page)
  useEffect(() => {
    if (prevParamsRef.current !== currentParamsKey) {
      // Параметры изменились - очищаем накопленные данные
      setResData([])
      prevParamsRef.current = currentParamsKey
    }
  }, [currentParamsKey])

  const queryResult = useQuery({
    queryKey: ['products', params, specialRoute],
    queryFn: async () => {
      const res = await ProductService.getAll(params, specialRoute, currentLang)

      setResData((prev) => {
        // Если это первая страница (page === 0 или undefined) - заменяем данные
        if (!params.page || params.page === 0) {
          console.log('Заменяем данные для первой страницы')
          return res.content
        }

        // Иначе добавляем только уникальные товары
        const newUniqueProducts = res.content.filter(
          (newProduct) => !prev.some((prevProduct) => prevProduct.id === newProduct.id)
        )

        console.log('Добавляем новые товары для страницы:', params.page)
        return [...prev, ...newUniqueProducts]
      })

      return res
    },
    placeholderData: (previousData) => previousData ?? undefined,
    staleTime: 5000 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  // Логируем resData после обновления
  useEffect(() => {
    console.log('resData в хуке useProducts', resData)
  }, [resData])

  return {
    ...queryResult,
    resData
  }
}
