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
  page?: number // Добавляем параметр page
  minRating?: number
  maxRating?: number
  specialRoute?: string
}

type ResponseData = ProductReviewsResponse | SpecialRouteResponse

export function useProductReviews(options: UseProductReviewsOptions = {}) {
  const {size = 10, page: requestedPage, minRating, maxRating, specialRoute} = options

  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
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
      return data?.page?.content || []
    }
    return data.content || []
  }

  // Вспомогательная функция для получения totalElements
  const getTotalElementsFromData = (data: ResponseData): number => {
    if ('page' in data) {
      return data?.page?.totalElements || data?.page?.page?.totalElements || 0
    }
    return data?.totalElements || data?.page?.totalElements || 0
  }

  // Вспомогательная функция для получения totalPages
  const getTotalPagesFromData = (data: ResponseData): number => {
    console.log('data for getTotalPagesFromData', data)
    if ('page' in data) {
      return data?.page?.totalPages || data?.page?.page?.totalPages || 0
    }
    return data?.totalPages || data?.page?.totalPages || 0
  }

  const currentLang = useCurrentLanguage()

  // Загрузка отзывов (с учетом requestedPage)
  useEffect(() => {
    const loadReviews = async (retryCount = 0) => {
      try {
        setIsLoading(true)
        loadingRef.current = true

        // Используем requestedPage если он передан, иначе 0
        const pageToLoad = requestedPage !== undefined ? requestedPage : 0

        const response = await commentsService.getCommentsByMyProducts({
          page: pageToLoad,
          size,
          minRating,
          maxRating,
          specialRoute,
          currentLang
        })

        const data = extractDataFromResponse(response)
        const content = getContentFromData(data)
        const totalElementsValue = getTotalElementsFromData(data)
        const totalPagesValue = getTotalPagesFromData(data)

        setFullResponseData(data)
        setTotalPages(totalPagesValue)

        if (content.length === 0 && totalElementsValue === 0 && retryCount === 0) {
          setTimeout(() => {
            loadReviews(1)
          }, 200)
          return
        }

        if (content.length > 0) {
          setReviews(content)
          setTotalElements(totalElementsValue)
          setPage(pageToLoad)
          const hasMoreElements = content.length < totalElementsValue
          setHasMore(hasMoreElements)
        } else {
          setReviews([])
          setHasMore(false)
          setTotalElements(0)
        }

        initialLoadDone.current = true
      } catch (error) {
        console.error('Full error object:', error)
        setReviews([])
        setHasMore(false)
        setTotalElements(0)
        setTotalPages(0)
        setFullResponseData(null)
      } finally {
        setIsLoading(false)
        loadingRef.current = false
      }
    }

    loadReviews()
  }, [size, requestedPage, minRating, maxRating, specialRoute, currentLang])

  // Загрузка следующих страниц (для бесконечного скролла - оставляем для обратной совместимости)
  const loadMoreReviews = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    if (!initialLoadDone.current) return

    try {
      loadingRef.current = true
      setIsLoading(true)

      const nextPage = page + 1

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
      const totalElementsValue = getTotalElementsFromData(data)
      const totalPagesValue = getTotalPagesFromData(data)

      setFullResponseData(data)
      setTotalElements(totalElementsValue)
      setTotalPages(totalPagesValue)

      if (content.length > 0) {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((review) => review.id))
          const newReviews = content.filter((review) => !existingIds.has(review.id))
          return [...prev, ...newReviews]
        })
        setPage(nextPage)

        const totalLoaded = reviews.length + content.length
        setHasMore(totalLoaded < totalElementsValue)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error response:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [page, hasMore, size, minRating, maxRating, specialRoute, reviews.length, currentLang])

  return {
    reviews,
    isLoading,
    hasMore,
    loadMoreReviews,
    totalElements,
    totalPages,
    fullResponseData
  }
}
