'use client'
import {FC, useRef, ChangeEvent, useCallback, useState, useEffect, useId, KeyboardEvent} from 'react'
import styles from './SearchInputUI.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useActions} from '@/hooks/useActions'
import {useDebounce} from '@/utils/debounce'
import {useTranslations, useLocale} from 'next-intl'
import {axiosClassic} from '@/api/api.interceptor'
import {useQuery} from '@tanstack/react-query'

const loop = '/loop.svg'

interface IHintProduct {
  id: number
  title: string
  image: string
}

interface ICategory {
  id: number
  name: string
  image: string | null
  fullSlug: string
}

interface IHints {
  category: ICategory
  products: IHintProduct[]
}

interface ISearchProps {
  placeholder?: string
  disabled?: boolean
  vendorId?: string
  useNewBorder?: boolean
}

// Функция для получения подсказок
const fetchHints = async ({
  text,
  vendorId,
  locale
}: {
  text: string
  vendorId?: string
  locale: string
}): Promise<IHints[]> => {
  if (!text.trim()) {
    return []
  }

  const res = await axiosClassic.get<IHints[]>('/products/hints', {
    params: {
      text: text,
      vendorId: vendorId
    },
    headers: {
      'Accept-Language': locale
    }
  })

  return Array.isArray(res.data) ? res.data : []
}

const SearchInputUI: FC<ISearchProps> = ({placeholder, disabled, vendorId, useNewBorder = false}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [listIsOpen, setListIsOpen] = useState(false)
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const id = useId()
  const router = useRouter()
  const {setSearchTitle, clearSearchTitle} = useActions()
  const t = useTranslations('HomePage')
  const locale = useLocale()

  const debouncedSetSearchTitle = useDebounce(setSearchTitle, 1000)
  const debouncedSetSearchText = useDebounce(setDebouncedSearchText, 300)

  // TanStack Query для получения подсказок
  const {
    data: hints = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['search-hints', debouncedSearchText, locale, vendorId],
    queryFn: () =>
      fetchHints({
        text: debouncedSearchText,
        vendorId,
        locale
      }),
    enabled: debouncedSearchText.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    retryDelay: 1000
  })

  useEffect(() => {
    clearSearchTitle()
    return () => {
      clearSearchTitle()
    }
  }, [clearSearchTitle])

  // Функция перенаправления на страницу поиска
  const handleSearch = useCallback(() => {
    const searchText = inputValue.trim()
    if (searchText) {
      router.push(`/search?textParams=${encodeURIComponent(searchText)}`)
      setListIsOpen(false)
    }
  }, [inputValue, router])

  // Обработка изменения инпута
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setListIsOpen(true)
      setShowAllCategories(false) // Сбрасываем состояние при изменении инпута

      if (inputRef.current) {
        inputRef.current.value = value
        setInputValue(value)
      }

      debouncedSetSearchTitle(value)
      debouncedSetSearchText(value)
    },
    [debouncedSetSearchTitle, debouncedSetSearchText]
  )

  // Обработка нажатия Enter
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      }
    },
    [handleSearch]
  )

  // Функция очистки инпута
  const handleClearInput = useCallback(() => {
    setInputValue('')
    setDebouncedSearchText('')
    setListIsOpen(false)
    setShowAllCategories(false)
    clearSearchTitle()

    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }, [clearSearchTitle])

  // Закрытие списка при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listIsOpen && boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setListIsOpen(false)
        setShowAllCategories(false)
      }
    }

    if (listIsOpen) {
      window.addEventListener('click', handleClickOutside)
    }

    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [listIsOpen])

  // При смене локали обновляем поиск, если есть активный запрос
  useEffect(() => {
    if (debouncedSearchText.trim().length > 0) {
      // TanStack Query автоматически обновит данные благодаря изменению ключа с locale
    }
  }, [locale, debouncedSearchText])

  useEffect(() => {
    console.log('hints', hints)
  }, [hints])

  // Разделяем подсказки на категории с товарами и без
  const emptyCategories = hints.filter((hint) => hint.products.length === 0)
  const categoriesWithProducts = hints.filter((hint) => hint.products.length > 0)

  const hasHints = hints.length > 0
  const showList = inputValue.length > 0 && listIsOpen
  const showClearButton = inputValue.length > 0

  // Определяем нужно ли показывать кнопку "Показать все"
  const shouldShowExpandButton = emptyCategories.length >= 3
  const displayedEmptyCategories =
    shouldShowExpandButton && !showAllCategories ? emptyCategories.slice(0, 3) : emptyCategories

  const handleCloseList = useCallback(() => {
    setListIsOpen(false)
    setInputValue('')
    setDebouncedSearchText('')
    setShowAllCategories(false)
    clearSearchTitle()
  }, [clearSearchTitle])

  const handleToggleCategories = useCallback(() => {
    setShowAllCategories((prev) => !prev)
  }, [])

  return (
    <div ref={boxRef} className={`${styles.search__box} ${disabled ? styles.search__box_disabled : ''}`}>
      <label
        htmlFor={'inputID' + id}
        className={`${styles.search__label} ${useNewBorder && styles.search__label__border}`}
      >
        <input
          type='text'
          id={'inputID' + id}
          ref={inputRef}
          onClick={() => setListIsOpen(true)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={`${placeholder || t('search')}`}
          disabled={disabled}
          className={styles.search__input}
          autoComplete='off'
          value={inputValue}
        />

        <button
          type='button'
          onClick={handleSearch}
          className={styles.search__icon__button}
          aria-label='Search'
          disabled={disabled || !inputValue.trim()}
        >
          <Image src={loop} width={16} height={16} alt='search icon' className={styles.search__icon} />
        </button>

        {/* Кнопка очистки */}
        {showClearButton && (
          <button type='button' onClick={handleClearInput} className={styles.clear__button} aria-label='Clear search'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M12 4L4 12M4 4L12 12'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        )}
      </label>

      {showList && (
        <div className={styles.input__list}>
          {/* Индикатор загрузки */}
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.loading__spinner}></div>
              <span>{t('searchLoading')}</span>
            </div>
          )}

          {/* Ошибка загрузки */}
          {error && !isLoading && (
            <div className={styles.error}>
              <span>{t('searchError') || 'Ошибка поиска'}</span>
            </div>
          )}

          {/* Результаты поиска */}
          {!isLoading && !error && hasHints && (
            <>
              {/* Пустые категории (только ссылки) */}
              {emptyCategories.length > 0 && (
                <div className={styles.empty__categories__wrapper}>
                  <div className={styles.empty__categories}>
                    {displayedEmptyCategories.map((categoryMap, categoryIndex) => (
                      <Link
                        key={`${locale}-empty-${categoryMap.category.id}-${categoryIndex}`}
                        href={`/categories/${categoryMap.category.fullSlug}`}
                        className={styles.empty__category__link}
                        onClick={handleCloseList}
                      >
                        <div className={styles.empty__category__name}>{categoryMap.category.name}</div>
                        <svg
                          width='16'
                          height='16'
                          viewBox='0 0 16 16'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                          className={styles.empty__category__arrow}
                        >
                          <path
                            d='M6 12L10 8L6 4'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </Link>
                    ))}
                  </div>

                  {/* Кнопка "Показать все категории" */}
                  {shouldShowExpandButton && (
                    <div className={styles.expand__button__wrapper}>
                      <div className={styles.expand__blur}></div>
                      <button
                        type='button'
                        onClick={handleToggleCategories}
                        className={styles.expand__button}
                        aria-label={showAllCategories ? 'Свернуть категории' : 'Показать все категории'}
                      >
                        <svg
                          width='20'
                          height='20'
                          viewBox='0 0 20 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                          className={`${styles.expand__icon} ${showAllCategories ? styles.expand__icon__rotated : ''}`}
                        >
                          <path
                            d='M5 7.5L10 12.5L15 7.5'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                        <span>
                          {showAllCategories
                            ? t('hideAllResults')
                            : t('showAllResults') + ` (${emptyCategories.length})`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Категории с товарами */}
              {categoriesWithProducts.map((categoryMap, categoryIndex) => (
                <div key={`${locale}-${categoryMap.category.id}-${categoryIndex}`} className={styles.category__group}>
                  <Link
                    href={`/categories/${categoryMap.category.fullSlug}`}
                    className={styles.category__title}
                    onClick={handleCloseList}
                  >
                    <span>{categoryMap.category.name}</span>
                  </Link>
                  {categoryMap.products.map((product) => (
                    <Link
                      key={`${locale}-${product.id}`}
                      href={`/card/${product.id}`}
                      className={styles.list__item}
                      onClick={handleCloseList}
                    >
                      <div className={styles.list__item_title}>{product.title}</div>
                    </Link>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Нет результатов */}
          {!isLoading && !error && !hasHints && debouncedSearchText.trim().length > 0 && (
            <div className={styles.no__results}>
              <span>{t('noResults')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchInputUI
