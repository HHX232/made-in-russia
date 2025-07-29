'use client'
import {FC, useRef, ChangeEvent, useCallback, useState, useEffect, useId} from 'react'
import styles from './SearchInputUI.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import {useActions} from '@/hooks/useActions'
import {useDebounce} from '@/utils/debounce'
import {useTranslations} from 'next-intl'
import {axiosClassic} from '@/api/api.interceptor'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

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
}

const SearchInputUI: FC<ISearchProps> = ({placeholder, disabled}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [listIsOpen, setListIsOpen] = useState(false)
  const [hints, setHints] = useState<IHints[]>([])
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const id = useId()
  const {setSearchTitle} = useActions()
  const t = useTranslations('HomePage')
  const currentLang = useCurrentLanguage()
  const debouncedSetSearchTitle = useDebounce(setSearchTitle, 1000)

  const {clearSearchTitle} = useActions()

  useEffect(() => {
    clearSearchTitle()
    return () => {
      clearSearchTitle()
    }
  }, [])

  // Запрос подсказок с debounce
  const fetchHints = useCallback(async (text: string) => {
    if (!text.trim()) {
      setHints([])
      return
    }

    setLoading(true)
    try {
      const res = await axiosClassic.get<IHints[]>('/products/hints', {
        params: {
          text: text
        },
        headers: {
          'Accept-Language': currentLang
        }
      })
      setHints(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Error fetching hints:', error)
      setHints([])
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedFetchHints = useDebounce(fetchHints, 300)

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setListIsOpen(true)

      if (inputRef.current) {
        inputRef.current.value = value
        setInputValue(value)
      }

      debouncedSetSearchTitle(value)
      debouncedFetchHints(value)
    },
    [debouncedSetSearchTitle, debouncedFetchHints]
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectItem = useCallback(
    (text: string) => {
      if (inputRef.current) {
        inputRef.current.value = text
      }
      setInputValue(text)
      setSearchTitle(text)
      setListIsOpen(false)
    },
    [setSearchTitle]
  )

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
          {loading && (
            <div className={styles.loading}>
              <div className={styles.loading__spinner}></div>
              <span>{t('searchLoading')}</span>
            </div>
          )}

          {!loading &&
            hasHints &&
            hints.map((categoryMap, categoryIndex) => (
              <div key={categoryIndex} className={styles.category__group}>
                <div className={styles.category__title}>{categoryMap.category.name}</div>
                {categoryMap.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/card/${product.id}`}
                    className={styles.list__item}
                    onClick={() => {
                      setListIsOpen(false)
                      setInputValue('')
                      setSearchTitle('')
                    }}
                  >
                    <div className={styles.list__item_title}>{product.title}</div>
                  </Link>
                ))}
              </div>
            ))}

          {!loading && !hasHints && (
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
