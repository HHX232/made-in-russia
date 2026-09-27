'use client'
import {FC, useState, useRef, useEffect} from 'react'
import styles from './AdminReviewsPage.module.scss'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import instance from '@/api/api.interceptor'
import {normalizePageResponse} from '@/services/products/product.service'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

// Типы для отзывов и пользователей
interface User {
  id: number
  role: 'User' | 'Admin' | string
  email: string
  login: string
  phoneNumber: string
  region: string
  avatarUrl?: string
  registrationDate: string
  lastModificationDate: string
}

interface Media {
  id: number
  mediaType: 'image' | 'video'
  mimeType: string
  url: string
  altText: string
  creationDate: string
  lastModificationDate: string
}

interface Review {
  id: number
  author: User
  text: string
  media: Media[]
  rating: number
  creationDate: string
  lastModificationDate: string
}

interface ReviewsResponse {
  content: Review[]
  pageable: {
    unpaged: boolean
    pageSize: number
    paged: boolean
    pageNumber: number
    offset: number
    sort: {
      unsorted: boolean
      sorted: boolean
      empty: boolean
    }
  }
  totalElements: number
  totalPages: number
  last: boolean
  numberOfElements: number
  size: number
  number: number
  sort: {
    unsorted: boolean
    sorted: boolean
    empty: boolean
  }
  first: boolean
  empty: boolean
}

const TIME_FILTER_OPTIONS = [
  {label: 'Без фильтров', value: undefined},
  {label: 'Сначала новые', value: 'desc'},
  {label: 'Сначала старые', value: 'asc'}
]

const APPROVE_STATUS_OPTIONS = [
  {label: 'Все статусы', value: 'Все статусы'},
  {label: 'Одобрено', value: 'APPROVED'},
  {label: 'На модерации', value: 'PENDING'},
  {label: 'Отклонено', value: 'REJECTED'}
]

// Главный компонент страницы управления отзывами
const AdminReviewsPage: FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalElements, setTotalElements] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)

  const [commentTextFilter, setCommentTextFilter] = useState('')
  const [minRatingFilter, setMinRatingFilter] = useState<number | null>(null)
  const [maxRatingFilter, setMaxRatingFilter] = useState<number | null>(null)

  const [ratingFilter, setRatingFilter] = useState('Все рейтинги')
  const [approveStatusFilter, setApproveStatusFilter] = useState('Все статусы')
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Без фильтров')
  const [timeFilterDirection, setTimeFilterDirection] = useState<'asc' | 'desc' | undefined>(undefined)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [approveStatusDropdownOpen, setApproveStatusDropdownOpen] = useState(false)
  const [timeFilterDropdownOpen, setTimeFilterDropdownOpen] = useState(false)
  const currentLang = useCurrentLanguage()
  // Модалка редактирования
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editText, setEditText] = useState('')
  const [editRating, setEditRating] = useState(5)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    console.log('reviews', reviews)
  }, [reviews])
  const pageSize = 10
  const productId = 1 // В реальном приложении нужно получать из контекста или пропсов

  // Загрузка отзывов из API по странице и фильтрам
  const loadReviews = async (page = 0, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString()
      })

      if (commentTextFilter.trim()) {
        params.append('commentText', commentTextFilter.trim())
      }
      if (minRatingFilter !== null) {
        params.append('minRating', minRatingFilter.toString())
      }
      if (maxRatingFilter !== null) {
        params.append('maxRating', maxRatingFilter.toString())
      }
      if (approveStatusFilter !== 'Все статусы') {
        params.append('approveStatuses', approveStatusFilter)
      }
      if (timeFilterDirection) {
        params.append('sort', 'creationDate')
        params.append('direction', timeFilterDirection)
      }

      const response = await instance.get(`/product-reviews?${params.toString()}`, {
        headers: {
          'Accept-language': currentLang,
          'x-language': currentLang
        }
      })
      const data = normalizePageResponse(response.data as ReviewsResponse)

      setReviews((prev) => {
        // Объединяем старый и новый массив отзывов
        const combined = append ? [...prev, ...data.content] : data.content
        // Используем Map для удаления дублирующих отзывов по уникальному id
        const map = new Map<number, Review>()
        combined.forEach((review) => map.set(review.id, review))
        return Array.from(map.values())
      })

      setTotalElements(data.totalElements)
      setTotalPages(data.totalPages)
      setCurrentPage(data.number)
      setHasNextPage(!data.last)
    } catch (err) {
      setError('Ошибка загрузки отзывов')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка следующей страницы (для бесконечной прокрутки)
  const loadMoreReviews = async () => {
    if (hasNextPage && !loading) {
      await loadReviews(currentPage + 1, true)
    }
  }

  // Обработка выбора фильтра рейтинга
  const handleRatingFilter = (filterValue: string) => {
    setRatingFilter(filterValue)
    setDropdownOpen(false)

    switch (filterValue) {
      case '5 звезд':
        setMinRatingFilter(5)
        setMaxRatingFilter(5)
        break
      case '4 звезды':
        setMinRatingFilter(4)
        setMaxRatingFilter(4)
        break
      case '3 звезды':
        setMinRatingFilter(3)
        setMaxRatingFilter(3)
        break
      case '2 звезды':
        setMinRatingFilter(2)
        setMaxRatingFilter(2)
        break
      case '1 звезда':
        setMinRatingFilter(1)
        setMaxRatingFilter(1)
        break
      case 'Высокие (4-5)':
        setMinRatingFilter(4)
        setMaxRatingFilter(5)
        break
      case 'Низкие (1-2)':
        setMinRatingFilter(1)
        setMaxRatingFilter(2)
        break
      default:
        setMinRatingFilter(null)
        setMaxRatingFilter(null)
        break
    }
  }

  // Обработка фильтра по времени
  const handleTimeFilter = (filterValue: string) => {
    setSelectedTimeFilter(filterValue)
    setTimeFilterDropdownOpen(false)

    const selectedOption = TIME_FILTER_OPTIONS.find((option) => option.label === filterValue)
    const direction = selectedOption?.value

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTimeFilterDirection(direction as any)
  }

  // Обработка поиска
  const handleSearch = (value: string) => {
    setCommentTextFilter(value)
  }

  // Обновляем отзывы при изменении фильтров с debounce в 500 мс
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReviews(0, false)
    }, 500)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentTextFilter, minRatingFilter, maxRatingFilter])

  // Начальная загрузка
  useEffect(() => {
    loadReviews(0, false)
  }, [])

  // Редактировать отзыв, открываем модалку с данными
  const handleEditReview = (reviewId: number) => {
    const review = reviews.find((r) => r.id === reviewId)
    if (!review) return

    setEditingReview(review)
    setEditText(review.text)
    setEditRating(review.rating)
    setEditModalOpen(true)
  }

  // Сохраняем изменения редактирования
  const handleSaveEdit = async () => {
    if (!editingReview) return

    setEditLoading(true)

    try {
      await instance.patch(`/products/${productId}/reviews/${editingReview.id}`, {
        text: editText,
        rating: editRating
      })

      // Обновляем локальный список отзывов
      setReviews((prev) =>
        prev.map((review) =>
          review.id === editingReview.id ? {...review, text: editText, rating: editRating} : review
        )
      )

      setEditModalOpen(false)
      setEditingReview(null)
    } catch (err) {
      console.error(err)
      alert('Ошибка при обновлении отзыва')
    } finally {
      setEditLoading(false)
    }
  }

  // Удаление отзыва
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return

    try {
      await instance.delete(`/product-reviews/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setTotalElements((prev) => prev - 1)
    } catch (err) {
      console.error(err)
      alert('Ошибка при удалении отзыва')
    }
  }

  const handleApproveStatusFilter = (statusValue: string) => {
    setApproveStatusFilter(statusValue)
    setApproveStatusDropdownOpen(false)
  }

  // Получить отображаемое название статуса
  const getApproveStatusLabel = (value: string) => {
    const option = APPROVE_STATUS_OPTIONS.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReviews(0, false)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [commentTextFilter, minRatingFilter, maxRatingFilter, approveStatusFilter, timeFilterDirection])

  // Сброс фильтров
  const clearFilters = () => {
    setCommentTextFilter('')
    setRatingFilter('Все рейтинги')
    setMinRatingFilter(null)
    setMaxRatingFilter(null)
    setApproveStatusFilter('Все статусы')
    setSelectedTimeFilter('Без фильтров')
    setTimeFilterDirection(undefined)
  }

  // Компонент триггера для бесконечной прокрутки
  const LoadMoreTrigger: FC = () => {
    const triggerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!hasNextPage) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !loading) {
              loadMoreReviews()
            }
          })
        },
        {rootMargin: '0px 0px 300px 0px', threshold: 0.1}
      )

      if (triggerRef.current) {
        observer.observe(triggerRef.current)
      }

      return () => {
        if (triggerRef.current) {
          observer.unobserve(triggerRef.current)
        }
      }
    }, [hasNextPage, loading])

    if (!hasNextPage) return null

    return (
      <div ref={triggerRef} className={styles['load-more-trigger']}>
        <div className={styles['load-more-content']}>
          <p>Загружаем больше отзывов...</p>
          <button onClick={loadMoreReviews} disabled={loading} className={styles['load-more-btn']}>
            {loading ? 'Загрузка...' : 'Загрузить еще'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles['admin-reviews-page']}>
        <h1 className={styles['reviews-title']}>Управление отзывами</h1>

        {error && (
          <div className={styles['error-message']} role='alert'>
            Ошибка: {error}
            <button onClick={() => loadReviews()} className={styles['retry-btn']} type='button'>
              Повторить
            </button>
          </div>
        )}

        <div className={styles['reviews-actions']}>
          <input
            type='text'
            className={styles['search-input']}
            placeholder='Поиск по тексту отзыва...'
            value={commentTextFilter}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label='Поиск по тексту отзыва'
          />

          <div className={styles['filter-dropdown']}>
            <div
              tabIndex={0}
              className={styles['dropdown-trigger']}
              role='button'
              aria-haspopup='listbox'
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setDropdownOpen((v) => !v)
              }}
            >
              {ratingFilter}
              <span aria-hidden='true'>▼</span>
            </div>
            {dropdownOpen && (
              <div className={styles['dropdown-content']} role='listbox' tabIndex={-1}>
                {[
                  'Все рейтинги',
                  '5 звезд',
                  '4 звезды',
                  '3 звезды',
                  '2 звезды',
                  '1 звезда',
                  'Высокие (4-5)',
                  'Низкие (1-2)'
                ].map((item) => (
                  <div
                    key={item}
                    role='option'
                    aria-selected={ratingFilter === item}
                    tabIndex={0}
                    className={`${styles['dropdown-item']} ${ratingFilter === item ? styles.active : ''}`}
                    onClick={() => handleRatingFilter(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleRatingFilter(item)
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles['filter-dropdown']}>
            <div
              tabIndex={0}
              className={styles['dropdown-trigger']}
              role='button'
              aria-haspopup='listbox'
              aria-expanded={approveStatusDropdownOpen}
              onClick={() => setApproveStatusDropdownOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setApproveStatusDropdownOpen((v) => !v)
              }}
            >
              {getApproveStatusLabel(approveStatusFilter)}
              <span aria-hidden='true'>▼</span>
            </div>
            {approveStatusDropdownOpen && (
              <div className={styles['dropdown-content']} role='listbox' tabIndex={-1}>
                {APPROVE_STATUS_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    role='option'
                    aria-selected={approveStatusFilter === option.value}
                    tabIndex={0}
                    className={`${styles['dropdown-item']} ${approveStatusFilter === option.value ? styles.active : ''}`}
                    onClick={() => handleApproveStatusFilter(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleApproveStatusFilter(option.value)
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Новый дроплист для фильтра по времени */}
          <div className={styles['filter-dropdown']}>
            <div
              tabIndex={0}
              className={styles['dropdown-trigger']}
              role='button'
              aria-haspopup='listbox'
              aria-expanded={timeFilterDropdownOpen}
              onClick={() => setTimeFilterDropdownOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setTimeFilterDropdownOpen((v) => !v)
              }}
            >
              {selectedTimeFilter}
              <span aria-hidden='true'>▼</span>
            </div>
            {timeFilterDropdownOpen && (
              <div className={styles['dropdown-content']} role='listbox' tabIndex={-1}>
                {TIME_FILTER_OPTIONS.map((option) => (
                  <div
                    key={option.label}
                    role='option'
                    aria-selected={selectedTimeFilter === option.label}
                    tabIndex={0}
                    className={`${styles['dropdown-item']} ${selectedTimeFilter === option.label ? styles.active : ''}`}
                    onClick={() => handleTimeFilter(option.label)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleTimeFilter(option.label)
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles['reviews-count']} aria-live='polite' aria-atomic='true'>
            Всего отзывов: {totalElements}
          </div>

          <button className={styles['clear-filters-btn']} onClick={clearFilters} type='button'>
            Сбросить фильтры
          </button>
        </div>

        <div className={styles['reviews-container']} aria-live='polite' aria-busy={loading}>
          {!loading && reviews.length === 0 && (
            <div className={styles['no-reviews']}>Нет отзывов, соответствующих фильтрам</div>
          )}

          {reviews.map((review) => (
            <div key={review.id} className={styles['review-wrapper']}>
              <Comment
                extra_comm__header__class={styles.extra__comm_wrap}
                product={{title: review.text, previewImageUrl: review.media[0]?.url}}
                {...review}
                isForAdmin
              />
              <div className={styles['review-buttons']}>
                <button
                  onClick={() => handleEditReview(review.id)}
                  className={styles['edit-btn']}
                  type='button'
                  aria-label='Редактировать отзыв'
                  title='Редактировать'
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className={styles['delete-btn']}
                  type='button'
                  aria-label='Удалить отзыв'
                  title='Удалить'
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {loading && reviews.length === 0 && (
            <div className={styles['loading-skeleton']} aria-label='Загрузка отзывов' role='progressbar' />
          )}

          <LoadMoreTrigger />
        </div>
      </div>

      {editModalOpen && editingReview && (
        <div
          className={styles['modal-overlay']}
          role='dialog'
          aria-modal='true'
          aria-labelledby='modal-title'
          onClick={() => {
            if (!editLoading) {
              setEditModalOpen(false)
              setEditingReview(null)
            }
          }}
        >
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()} tabIndex={-1}>
            <h2 className={styles['modal-title']} id='modal-title'>
              Редактирование отзыва
            </h2>
            <form
              className={styles['modal-form']}
              onSubmit={(e) => {
                e.preventDefault()
                if (!editLoading) handleSaveEdit()
              }}
            >
              <div className={styles['form-group']}>
                <label htmlFor='edit-text' className={styles['form-label']}>
                  Текст отзыва
                </label>
                <textarea
                  id='edit-text'
                  className={styles['form-textarea']}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className={styles['form-group']}>
                <span className={styles['form-label']}>Рейтинг</span>
                <div className={styles['rating-selector']} role='radiogroup' aria-label='Рейтинг'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      role='radio'
                      aria-checked={editRating === star}
                      tabIndex={0}
                      className={`${styles['rating-star']} ${star <= editRating ? styles.active : ''}`}
                      onClick={() => !editLoading && setEditRating(star)}
                      onKeyDown={(e) => {
                        if (!editLoading && (e.key === 'Enter' || e.key === ' ')) {
                          setEditRating(star)
                        }
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles['modal-actions']}>
                <button
                  type='button'
                  className={`${styles['modal-btn']} ${styles['cancel-btn']}`}
                  onClick={() => {
                    if (!editLoading) {
                      setEditModalOpen(false)
                      setEditingReview(null)
                    }
                  }}
                  disabled={editLoading}
                >
                  Отмена
                </button>
                <button
                  type='submit'
                  className={`${styles['modal-btn']} ${styles['save-btn']}`}
                  disabled={editLoading || editText.trim() === ''}
                >
                  {editLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminReviewsPage
