/* eslint-disable @typescript-eslint/no-explicit-any */
import {useQuery} from '@tanstack/react-query'
import ProductService from '@/services/products/product.service'
import {useCurrentLanguage} from './useCurrentLanguage'
import {useState} from 'react'
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

  return {
    ...useQuery({
      queryKey: ['products', params],
      queryFn: async () => {
        const res = await ProductService.getAll(params, specialRoute, currentLang)
        setResData((prev) => {
          const newUniqueProducts = res.content.filter(
            (newProduct) => !prev.some((prevProduct) => prevProduct.id === newProduct.id)
          )
          return [...prev, ...newUniqueProducts]
        })
        console.log('resData в хуке useProducts', resData)
        return res
      },
      placeholderData: (previousData) => previousData ?? undefined,
      staleTime: 5000 * 60,
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }),
    resData
  }
}
