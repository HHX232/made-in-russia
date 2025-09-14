// CommentSection/CommentSection.tsx
'use client'
import {useCallback, useEffect, useRef, useState} from 'react'
import CardBottomPage from '../CardBottomPage/CardBottomPage'
import cardService from '@/services/card/card.service'
import ICardFull, {Review} from '@/services/card/card.types'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

// const comm1 = '/comments/comm1.jpg'
// const comm2 = '/comments/comm2.jpg'

interface CommentsSectionProps {
  cardId: string
}

const IntersectionObserverElement = ({observerRef}: {observerRef: (node: HTMLDivElement | null) => void}) => {
  return (
    <div
      style={{
        height: '20px',
        width: '100%',
        background: 'transparent'
      }}
      ref={observerRef}
    />
  )
}

export default function CommentsSection({cardId}: CommentsSectionProps) {
  const [comments, setComments] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef(false)
  const [pageParams, setPageParams] = useState({
    page: 0,
    size: 10
  })

  const [cardDataNew, setCardDataNew] = useState<ICardFull | null>(null)
  const locale = useCurrentLanguage()
  useEffect(() => {
    const loadCardData = async () => {
      try {
        const {data} = await cardService.getFullCardById(cardId, locale)
        setCardDataNew(data as ICardFull)

        if (!cardDataNew) {
          // console.log('not found card data')
        }
      } catch (error) {
        console.error('Error fetching card data:', error)
      }
    }
    loadCardData()
  }, [])

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (!node || !hasMore || isLoading) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && !loadingRef.current && hasMore) {
            loadingRef.current = true
            setHasMore(true)
            setPageParams((prev) => ({
              ...prev,
              page: prev.page + 1
            }))
          }
        },
        {
          root: null,
          rootMargin: '20px',
          threshold: 0.1
        }
      )

      observerRef.current.observe(node)
    },
    [hasMore, isLoading]
  )

  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true)
        setComments([])
        setHasMore(true)
        loadingRef.current = false

        const commentsData = await cardService.getCommentsByCardId(cardId, 0, pageParams.size, locale)
        console.log('commentsData ', commentsData.data)

        if (commentsData.data?.content) {
          setComments(commentsData.data.content)

          const totalPages = commentsData.data.page?.totalPages || 0
          const currentPage = commentsData.data.page?.number || 0
          setHasMore(currentPage + 1 < totalPages)
        } else {
          setComments([])
          setHasMore(false)
        }

        // Сбрасываем страницу на 0
        setPageParams((prev) => ({...prev, page: 0}))
      } catch (error) {
        console.error('Error loading initial comments:', error)
        setComments([])
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (cardId) {
      loadComments()
    }
  }, [cardId, pageParams.size, locale])

  useEffect(() => {
    const loadMoreComment = async () => {
      if (pageParams.page === 0 || !hasMore || !loadingRef.current) return
      try {
        setIsLoading(true)
        loadingRef.current = false
        console.log(`Loading page ${pageParams.page}...`)
        const commentsData = await cardService.getCommentsByCardId(cardId, pageParams.page, pageParams.size, locale)
        if (commentsData.data?.content && commentsData.data.content.length > 0) {
          setComments((prev) => {
            const existingsIds = new Set(prev.map((prev) => prev.id || prev))
            const newComments = commentsData.data.content.filter((comment) => !existingsIds.has(comment.id || comment))
            return [...prev, ...newComments]
          })

          const currentPage = commentsData.data.page?.number || 0
          const totalPages = commentsData.data.page?.totalPages || 0

          if (currentPage + 1 >= totalPages) {
            setHasMore(false)
            console.log('No more comments to load')
          }
        } else {
          setHasMore(false)
        }
      } catch {
        setHasMore(false)
      } finally {
        setIsLoading(false)
        loadingRef.current = false
      }
    }
    if (cardId) {
      loadMoreComment()
    }
  }, [cardId, hasMore, pageParams.page, pageParams.size, locale])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <CardBottomPage
      isLoading={false}
      cardData={cardDataNew ?? null}
      comments={comments}
      specialLastElement={
        hasMore && !isLoading && comments.length > 0 ? (
          <IntersectionObserverElement observerRef={lastElementRef} />
        ) : null
      }
    />
  )
}
