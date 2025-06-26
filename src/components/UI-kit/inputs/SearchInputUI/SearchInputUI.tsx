'use client'
import {FC, useRef, ChangeEvent, useCallback, useState, useEffect, useId} from 'react'
import styles from './SearchInputUI.module.scss'
import Image from 'next/image'
import {useActions} from '@/hooks/useActions'
import {useDebounce} from '@/utils/debounce'
import {useTypedSelector} from '@/hooks/useTypedSelector'

const loop = '/loop.svg'
interface ISearchProps {
  placeholder?: string
  disabled?: boolean
}

const SearchInputUI: FC<ISearchProps> = ({placeholder, disabled}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [listIsOpen, setListIsOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const id = useId()
  const {setSearchTitle} = useActions()
  const {searchTitle} = useTypedSelector((state) => state.filters)

  useEffect(() => {
    setInputValue(searchTitle)
  }, [])

  const debouncedSetSearchTitle = useDebounce(setSearchTitle, 1000)

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setListIsOpen(true)

      if (inputRef.current) {
        inputRef.current.value = value
        setInputValue(value)
      }
      debouncedSetSearchTitle(value)
    },
    [debouncedSetSearchTitle]
  )

  const handleSelectItem = useCallback(
    (text: string) => {
      if (inputRef.current) {
        inputRef.current.value = text
      }
      setInputValue(text)

      setSearchTitle(text)
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
          placeholder={`${placeholder || 'Поиск по сайту'}`}
          disabled={disabled}
          className={styles.search__input}
          autoComplete='off'
          value={inputValue}
        />
      </label>
      {inputValue.length > 0 && listIsOpen && (
        <ul className={`${styles.input__list}`}>
          {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((el, index) => {
            const itemText = 'Грав'
            const itemText1 = 'Сух'
            const itemText2 = 'Медная'
            return (
              <li
                onClick={() => {
                  handleSelectItem(
                    index === 0 ? itemText : index === 1 ? itemText1 : index === 2 ? itemText2 : 'Hello world'
                  )
                  setListIsOpen(false)
                }}
                key={index}
                className={`${styles.list__item}`}
              >
                {index === 0 ? itemText : index === 1 ? itemText1 : index === 2 ? itemText2 : 'Hello world'}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default SearchInputUI
