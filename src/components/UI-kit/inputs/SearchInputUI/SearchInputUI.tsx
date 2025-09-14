'use client'
import {FC, useRef, ChangeEvent, useCallback, useState, useEffect, useId} from 'react'
import styles from './SearchInputUI.module.scss'
import Image from 'next/image'
import Link from 'next/link'
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

interface IHints {
  category: {
    id: number
    name: string
    image: string
  }
  products: IHintProduct[]
}

interface ISearchProps {
  placeholder?: string
  disabled?: boolean
  vendorId?: string
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

const SearchInputUI: FC<ISearchProps> = ({placeholder, disabled, vendorId}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [listIsOpen, setListIsOpen] = useState(false)
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const boxRef = useRef<HTMLDivElement | null>(null)
  const id = useId()
  const {setSearchTitle, clearSearchTitle} = useActions()
  const t = useTranslations('HomePage')
  const locale = useLocale() // Используем локаль из next-intl

  const debouncedSetSearchTitle = useDebounce(setSearchTitle, 1000)
  const debouncedSetSearchText = useDebounce(setDebouncedSearchText, 300)

  // TanStack Query для получения подсказок
  const {
    data: hints = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['search-hints', debouncedSearchText, locale, vendorId], // Локаль как часть ключа!
    queryFn: () =>
      fetchHints({
        text: debouncedSearchText,
        vendorId,
        locale
      }),
    enabled: debouncedSearchText.trim().length > 0, // Запрос только если есть текст
    staleTime: 1000 * 60 * 5, // Кеш на 5 минут
    gcTime: 1000 * 60 * 10, // Удаление из памяти через 10 минут
    retry: 1, // Только одна попытка повтора
    retryDelay: 1000
  })

  useEffect(() => {
    clearSearchTitle()
    return () => {
      clearSearchTitle()
    }
  }, [clearSearchTitle])

  // Обработка изменения инпута
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setListIsOpen(true)

      if (inputRef.current) {
        inputRef.current.value = value
        setInputValue(value)
      }

      // Обновляем поисковый запрос с debounce
      debouncedSetSearchTitle(value)
      debouncedSetSearchText(value)
    },
    [debouncedSetSearchTitle, debouncedSetSearchText]
  )

  // Закрытие списка при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listIsOpen && boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setListIsOpen(false)
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

  const hasHints = hints.length > 0
  const showList = inputValue.length > 0 && listIsOpen

  return (
    <div ref={boxRef} className={`${styles.search__box} ${disabled ? styles.search__box_disabled : ''}`}>
      <label htmlFor={'inputID' + id} className={styles.search__label}>
        <Image src={loop} width={16} height={16} alt='search icon' className={styles.search__icon} />
        <input
          type='text'
          id={'inputID' + id}
          ref={inputRef}
          onClick={() => setListIsOpen(true)}
          onChange={handleInputChange}
          placeholder={`${placeholder || t('search')}`}
          disabled={disabled}
          className={styles.search__input}
          autoComplete='off'
          value={inputValue}
        />
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
          {!isLoading &&
            !error &&
            hasHints &&
            hints.map((categoryMap, categoryIndex) => (
              <div key={`${locale}-${categoryIndex}`} className={styles.category__group}>
                <div className={styles.category__title}>{categoryMap.category.name}</div>
                {categoryMap.products.map((product) => (
                  <Link
                    key={`${locale}-${product.id}`}
                    href={`/card/${product.id}`}
                    className={styles.list__item}
                    onClick={() => {
                      setListIsOpen(false)
                      setInputValue('')
                      setDebouncedSearchText('')
                      clearSearchTitle()
                    }}
                  >
                    <div className={styles.list__item_title}>{product.title}</div>
                  </Link>
                ))}
              </div>
            ))}

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
