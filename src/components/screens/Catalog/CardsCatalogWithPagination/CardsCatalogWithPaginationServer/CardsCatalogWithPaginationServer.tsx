/* eslint-disable @typescript-eslint/no-explicit-any */
import {cookies} from 'next/headers'
import CardsCatalogWithPagination from '../CardsCatalogWithPagination'
import ProductService from '@/services/products/product.service'
import {Product} from '@/services/products/product.types'

interface PageParams {
  page: number
  size: number
  minPrice?: number
  maxPrice?: number
  categoryIds?: string
  title?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL' | ''
  direction?: 'asc' | 'desc'
  deliveryMethodIds?: string
  sort?: string
  [key: string]: any
}

interface CardsCatalogServerProps {
  specialRoute?: string
  canCreateNewProduct?: boolean
  onPreventCardClick?: any
  extraButtonsBoxClass?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL'
  direction?: 'asc' | 'desc'
  isForAdmin?: boolean
  pageSize?: number
  searchParams?: {
    page?: string
    categoryIds?: string
    minPrice?: string
    maxPrice?: string
    title?: string
    deliveryMethodIds?: string
  }
}

/**
 * Серверный компонент для SSR с предзагрузкой данных
 * Используйте этот компонент на серверных страницах Next.js для SEO
 *
 * @example
 * // В app/catalog/page.tsx
 * export default async function CatalogPage({ searchParams }) {
 *   return (
 *     <CardsCatalogWithPaginationServer
 *       specialRoute="/api/products"
 *       approveStatuses="APPROVED"
 *       searchParams={searchParams}
 *     />
 *   )
 * }
 */
const CardsCatalogWithPaginationServer = async ({
  specialRoute,
  canCreateNewProduct = false,
  extraButtonsBoxClass,
  approveStatuses = 'ALL',
  direction = 'desc',
  isForAdmin = false,
  pageSize = 9,
  searchParams = {}
}: CardsCatalogServerProps) => {
  console.log('🎯 CardsCatalogWithPaginationServer: Fetching initial data')

  // Получаем токен из cookies
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  // Парсим параметры из URL
  const currentPage = searchParams.page ? parseInt(searchParams.page) - 1 : 0 // URL использует 1-based, API 0-based
  const categoryIds = searchParams.categoryIds || ''
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined
  const title = searchParams.title || ''
  const deliveryMethodIds = searchParams.deliveryMethodIds || ''

  // Формируем параметры запроса
  const params: PageParams = {
    page: currentPage,
    size: pageSize,
    sort: 'creationDate',
    direction: direction,
    approveStatuses: approveStatuses === 'ALL' ? '' : approveStatuses
  }

  if (minPrice !== undefined) params.minPrice = minPrice
  if (maxPrice !== undefined) params.maxPrice = maxPrice
  if (categoryIds) params.categoryIds = categoryIds
  if (title) params.title = title
  if (deliveryMethodIds) params.deliveryMethodIds = deliveryMethodIds

  // Загружаем начальные данные на сервере
  let initialProducts: Product[] | undefined = []
  let initialTotalPages = 0

  try {
    const response = specialRoute
      ? await ProductService.getAll(params, specialRoute, accessToken)
      : await ProductService.getAll(params)

    initialProducts = response.content
    initialTotalPages = response.totalPages

    console.log('✅ Server-side products fetched:', {
      page: response.number,
      contentLength: response.content.length,
      totalPages: response.totalPages
    })
  } catch (error) {
    console.error('❌ Error fetching products on server:', error)
    // В случае ошибки отдаем пустой массив, клиент попробует загрузить сам
  }

  // Передаем предзагруженные данные в клиентский компонент
  return (
    <CardsCatalogWithPagination
      initialProducts={initialProducts}
      initialTotalPages={initialTotalPages}
      initialCurrentPage={currentPage}
      specialRoute={specialRoute}
      canCreateNewProduct={canCreateNewProduct}
      extraButtonsBoxClass={extraButtonsBoxClass}
      approveStatuses={approveStatuses}
      direction={direction}
      isForAdmin={isForAdmin}
      pageSize={pageSize}
    />
  )
}

export default CardsCatalogWithPaginationServer
