'use client'

import {useEffect, useRef, useState} from 'react'
// import CardBottomPage from '../CardBottomPage/CardBottomPage'
import cardService from '@/services/card/card.service'
import ICardFull, {Review} from '@/services/card/card.types'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import dynamic from 'next/dynamic'

const CardBottomPageClient = dynamic(() => import('../CardBottomPage/CardBottomPage'), {ssr: false})

interface CommentsSectionProps {
  cardId: string
}

export default function CommentsSection({cardId}: CommentsSectionProps) {
  const [comments, setComments] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)
  const [pageParams, setPageParams] = useState({
    page: 0,
    size: 5
  })

  const [cardDataNew, setCardDataNew] = useState<ICardFull | null>(null)
  const locale = useCurrentLanguage()

  useEffect(() => {
    const loadCardData = async () => {
      try {
        const {data} = await cardService.getFullCardById(cardId, locale)
        setCardDataNew(data as ICardFull)
      } catch (error) {
        console.error('Error fetching card data:', error)
      }
    }
    loadCardData()
  }, [cardId, locale])

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
  }, [cardId, locale])

  const handleLoadMore = async () => {
    if (loadingRef.current || !hasMore || isLoading) return

    try {
      loadingRef.current = true
      setIsLoading(true)

      const nextPage = pageParams.page + 1
      console.log(`Loading page ${nextPage}...`)

      const commentsData = await cardService.getCommentsByCardId(cardId, nextPage, pageParams.size, locale)

      if (commentsData.data?.content && commentsData.data.content.length > 0) {
        setComments((prev) => {
          const existingsIds = new Set(prev.map((comment) => comment.id || comment))
          const newComments = commentsData.data.content.filter((comment) => !existingsIds.has(comment.id || comment))
          return [...prev, ...newComments]
        })

        const currentPage = commentsData.data.page?.number || 0
        const totalPages = commentsData.data.page?.totalPages || 0

        if (currentPage + 1 >= totalPages) {
          setHasMore(false)
          console.log('No more comments to load')
        }

        setPageParams((prev) => ({...prev, page: nextPage}))
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more comments:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }

  return (
    <CardBottomPageClient
      isLoading={isLoading}
      cardData={cardDataNew ?? ({} as ICardFull)}
      comments={comments}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
    />
  )
}
