'use client'
import {FC, useEffect, useState} from 'react'
import styles from './ProfilePageBottom.module.scss'
import {Review} from '@/services/card/card.types'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import {useTranslations} from 'next-intl'
import instance from '@/api/api.interceptor'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

const ProfilePageBottomDelivery: FC = () => {
  const t = useTranslations('ProfilePage.ProfilePageBottomDelivery')
  const [reviews, setReviews] = useState<Review[]>([])
  const [isClient, setIsClient] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3
  const currentLang = useCurrentLanguage()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await instance.get<{content: Review[]}>('/me/reviews', {
          headers: {
            'Accept-Language': currentLang
          }
        })
        console.log('response reviews', response)
        setReviews(response.data.content)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    fetchReviews()
  }, [currentLang])

  const totalPages = Math.ceil(reviews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReviews = reviews.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []

    // Первая страница
    pages.push(
      <a
        key={1}
        href='#'
        onClick={(e) => {
          e.preventDefault()
          handlePageChange(1)
        }}
        className={`${styles.exp_pagination__link} ${currentPage === 1 ? styles.exp_pagination__link_active : ''}`}
      >
        1
      </a>
    )

    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Многоточие после первой страницы
    if (startPage > 2) {
      pages.push(
        <span key='ellipsis-start' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    // Страницы в середине
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <a
          key={i}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(i)
          }}
          className={`${styles.exp_pagination__link} ${currentPage === i ? styles.exp_pagination__link_active : ''}`}
        >
          {i}
        </a>
      )
    }

    // Многоточие перед последней страницей
    if (endPage < totalPages - 1) {
      pages.push(
        <span key='ellipsis-end' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    // Последняя страница
    if (totalPages > 1) {
      pages.push(
        <a
          key={totalPages}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(totalPages)
          }}
          className={`${styles.exp_pagination__link} ${
            currentPage === totalPages ? styles.exp_pagination__link_active : ''
          }`}
        >
          {totalPages}
        </a>
      )
    }

    return (
      <div className={styles.justify_content_center}>
        <div className={styles.exp_pagination}>
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage - 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_prev} ${
              currentPage === 1 ? styles.exp_pagination__link_disabled : ''
            }`}
          />
          {pages}
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage + 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_next} ${
              currentPage === totalPages ? styles.exp_pagination__link_disabled : ''
            }`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.delivery__box}`}>
      {isClient && reviews?.length === 0 && <p className={styles.no_reviews_message}>{t('noReviews')}</p>}
      {isClient && reviews?.length > 0 && (
        <>
          <ul className={`${styles.delivery__list}`}>
            {currentReviews.map((el, i) => {
              return <Comment key={el.id || i} {...el} />
            })}
          </ul>
          {renderPagination()}
        </>
      )}
    </div>
  )
}

export default ProfilePageBottomDelivery
