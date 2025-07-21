import {Review} from '@/services/card/card.types'
import commentsService from '@/services/comments/comments.service'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useCurrentLanguage} from './useCurrentLanguage'

interface ProductReviewsResponse {
  content: Review[]
  page?: {
    size: number
    number: number
    totalElements: number
    totalPages: number
    content?: Review[]
    page?: {
      size: number
      number: number
      totalElements: number
      totalPages: number
      content?: Review[]
    }
  }
  pageable?: {
    offset: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    paged: boolean
    pageNumber: number
    pageSize: number
    unpaged: boolean
  }
  totalElements?: number
  totalPages?: number
  last?: boolean
  size?: number
  number?: number
  sort?: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements?: number
  first?: boolean
  empty?: boolean
  averageRating?: number
}

interface SpecialRouteResponse {
  page: ProductReviewsResponse
}

interface UseProductReviewsOptions {
  size?: number
  minRating?: number
  maxRating?: number
  specialRoute?: string
}

type ResponseData = ProductReviewsResponse | SpecialRouteResponse

export function useProductReviews(options: UseProductReviewsOptions = {}) {
  const {size = 10, minRating, maxRating, specialRoute} = options

  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [fullResponseData, setFullResponseData] = useState<ResponseData | null>(null)
  const loadingRef = useRef(false)
  const initialLoadDone = useRef(false)

  // Вспомогательная функция для извлечения данных из ответа
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractDataFromResponse = (response: any): ResponseData => {
    return response?.data || response
  }

  // Вспомогательная функция для получения content из ResponseData
  const getContentFromData = (data: ResponseData): Review[] => {
    if ('page' in data) {
      // SpecialRouteResponse
      return data?.page?.content || []
    }
    // ProductReviewsResponse
    return data.content || []
  }

  // Вспомогательная функция для получения totalElements из ResponseData
  const getTotalElementsFromData = (data: ResponseData): number => {
    if ('page' in data) {
      // SpecialRouteResponse
      return data?.page?.totalElements || data?.page?.page?.totalElements || 0
    }
    // ProductReviewsResponse
    return data?.totalElements || data?.page?.totalElements || 0
  }

  const currentLang = useCurrentLanguage()
  // Логирование входных параметров
  useEffect(() => {
    console.log('=== useProductReviews HOOK DEBUG ===')
    console.log('Options received:', options)
    console.log('specialRoute:', specialRoute)
    console.log('size:', size)
    console.log('===================================')
  }, [specialRoute, size])

  // Загрузка первой страницы с возможностью повторной попытки
  useEffect(() => {
    const loadInitialReviews = async (retryCount = 0) => {
      try {
        setIsLoading(true)
        setReviews([])
        setHasMore(true)
        setPage(0)
        loadingRef.current = false
        initialLoadDone.current = false

        // console.log('Calling commentsService.getCommentsByMyProducts...')
        const response = await commentsService.getCommentsByMyProducts({
          page: 0,
          size,
          minRating,
          maxRating,
          specialRoute,
          currentLang
        })
        // console.log('Service call completed')

        console.log('Response received:', response)
        const data = extractDataFromResponse(response)

        const content = getContentFromData(data)
        const totalElementsValue = getTotalElementsFromData(data)

        // Сохраняем полный ответ сервера
        setFullResponseData(data)

        // Проверяем, если ответ пустой и это первая попытка
        if (content.length === 0 && totalElementsValue === 0 && retryCount === 0) {
          // Делаем повторную попытку через 200мс
          setTimeout(() => {
            // console.log('Executing retry...')
            loadInitialReviews(1)
          }, 200)
          return
        }

        if (content.length > 0) {
          console.log('Setting reviews with content:', content)
          setReviews(content)

          // Проверяем по количеству элементов
          const loadedCount = content.length
          setTotalElements(totalElementsValue)
          const hasMoreElements = loadedCount < totalElementsValue
          setHasMore(hasMoreElements)
        } else {
          setReviews([])
          setHasMore(false)
          setTotalElements(0)
        }

        initialLoadDone.current = true
        console.log('Initial load completed')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Full error object:', error)

        setReviews([])
        setHasMore(false)
        setTotalElements(0)
        setFullResponseData(null)
      } finally {
        setIsLoading(false)
        console.log('Loading state set to false')
      }
    }

    loadInitialReviews()
  }, [size, minRating, maxRating, specialRoute])

  // Загрузка следующих страниц
  const loadMoreReviews = useCallback(async () => {
    // Проверяем только loadingRef и hasMore
    if (loadingRef.current || !hasMore) {
      console.log('Skipping load - already loading or no more items')
      return
    }

    // Дополнительная проверка: если первая загрузка еще не завершена
    if (!initialLoadDone.current) {
      console.log('Initial load not done yet')
      return
    }

    try {
      loadingRef.current = true
      setIsLoading(true)

      const nextPage = page + 1
      console.log(`Loading page ${nextPage} with params:`, {
        page: nextPage,
        size,
        minRating,
        maxRating,
        specialRoute
      })

      const response = await commentsService.getCommentsByMyProducts({
        page: nextPage,
        size,
        minRating,
        maxRating,
        specialRoute,
        currentLang
      })

      const data = extractDataFromResponse(response)

      const content = getContentFromData(data)

      // Обновляем полный ответ сервера
      setFullResponseData(data)

      if (content.length > 0) {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((review) => review.id))
          const newReviews = content.filter((review) => !existingIds.has(review.id))

          return [...prev, ...newReviews]
        })

        setPage(nextPage)

        // Проверяем по общему количеству загруженных элементов
        const totalLoaded = reviews.length + content.length
        const totalElementsValue = getTotalElementsFromData(data)
        setTotalElements(totalElementsValue)
        const hasMoreElements = totalLoaded < totalElementsValue
        setHasMore(hasMoreElements)
      } else {
        // console.log('No content in response or empty content array')
        setHasMore(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error response:', error?.response)
      console.error('=========================')
      setHasMore(false)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
      console.log('Load more completed')
    }
  }, [page, hasMore, size, minRating, maxRating, specialRoute, reviews.length])

  return {
    reviews,
    isLoading,
    hasMore,
    loadMoreReviews,
    totalElements,
    fullResponseData
  }
}
