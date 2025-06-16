import {Review} from '@/services/card/card.types'
import commentsService from '@/services/comments/comments.service'
import {useCallback, useEffect, useRef, useState} from 'react'

interface UseProductReviewsOptions {
  size?: number
  minRating?: number
  maxRating?: number
  specialRoute?: string
}

export function useProductReviews(options: UseProductReviewsOptions = {}) {
  const {size = 10, minRating, maxRating, specialRoute} = options

  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const loadingRef = useRef(false)
  const initialLoadDone = useRef(false)

  // Загрузка первой страницы
  useEffect(() => {
    const loadInitialReviews = async () => {
      try {
        console.log('Loading initial reviews...')
        setIsLoading(true)
        setReviews([])
        setHasMore(true)
        setPage(0)
        loadingRef.current = false
        initialLoadDone.current = false

        const {data} = await commentsService.getCommentsByMyProducts({
          page: 0,
          size,
          minRating,
          maxRating,
          specialRoute
        })

        console.log('Initial reviews response:', data)

        if (data?.content) {
          setReviews(data.content)
          // Проверяем по количеству элементов
          const loadedCount = data.content.length
          const totalElements = data?.totalElements || data?.page?.totalElements || 0
          setTotalElements(totalElements)
          const hasMoreElements = loadedCount < totalElements
          setHasMore(hasMoreElements)
          console.log(
            `Initial load complete. Total elements: ${totalElements}, Loaded: ${loadedCount}, Has more: ${hasMoreElements}`
          )
        } else {
          setReviews([])
          setHasMore(false)
        }

        initialLoadDone.current = true
      } catch (error) {
        console.error('Error loading initial reviews:', error)
        setReviews([])
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialReviews()
  }, [size, minRating, maxRating])

  // Загрузка следующих страниц
  const loadMoreReviews = useCallback(async () => {
    console.log('loadMoreReviews called', {
      loadingRef: loadingRef.current,
      hasMore,
      page,
      initialLoadDone: initialLoadDone.current,
      specialRoute
    })

    // Проверяем только loadingRef и hasMore, убираем проверку page === 0
    if (loadingRef.current || !hasMore) {
      console.log('Skipping load:', {loading: loadingRef.current, hasMore})
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
      console.log(`Loading page ${nextPage}...`)

      const {data} = await commentsService.getCommentsByMyProducts({
        page: nextPage,
        size,
        minRating,
        maxRating,
        specialRoute
      })

      console.log(`Page ${nextPage} response:`, data)

      if (data?.content && data.content.length > 0) {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((review) => review.id))
          const newReviews = data.content.filter((review) => !existingIds.has(review.id))
          console.log(`Adding ${newReviews.length} new reviews`)
          return [...prev, ...newReviews]
        })

        setPage(nextPage)

        // Проверяем по общему количеству загруженных элементов
        const totalLoaded = reviews.length + data.content.length
        const totalElements = data.page?.totalElements || data?.totalElements || 0
        setTotalElements(totalElements)
        const hasMoreElements = totalLoaded < totalElements
        setHasMore(hasMoreElements)
        console.log(
          `Page ${nextPage} loaded. Total elements: ${totalElements}, Total loaded: ${totalLoaded}, Has more: ${hasMoreElements}`
        )
      } else {
        console.log('No content in response or empty content array')
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more reviews:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [page, hasMore, size, minRating, maxRating])

  return {
    reviews,
    isLoading,
    hasMore,
    loadMoreReviews,
    totalElements
  }
}
