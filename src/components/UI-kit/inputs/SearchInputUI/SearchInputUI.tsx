'use client'
import {FC, useRef, ChangeEvent, useCallback, useState, useEffect} from 'react'
import styles from './SearchInputUI.module.scss'
import Image from 'next/image'

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

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setListIsOpen(true)
    if (inputRef.current) {
      inputRef.current.value = e.target.value
      setInputValue(e.target.value)
    }
  }, [])

  const handleSelectItem = useCallback((text: string) => {
    if (inputRef.current) {
      inputRef.current.value = text
    }
    setInputValue(text)
  }, [])
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
      <label htmlFor='inputID' className={styles.search__label}>
        <Image src={loop} width={16} height={16} alt='search icon' className={styles.search__icon} />
        <input
          type='text'
          id='inputID'
          ref={inputRef}
          onClick={() => setListIsOpen(true)}
          onChange={handleInputChange}
          placeholder={`${placeholder || 'Введите текст...'}`}
          disabled={disabled}
          className={styles.search__input}
          autoComplete='off'
          value={inputValue}
        />
      </label>
      {inputValue.length > 0 && listIsOpen && (
        <ul className={`${styles.input__list}`}>
          {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((el, index) => {
            const itemText = 'Hello World ' + (index + 1)
            return (
              <li
                onClick={() => {
                  handleSelectItem(itemText)
                  setListIsOpen(false)
                }}
                key={index}
                className={`${styles.list__item}`}
              >
                {itemText}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default SearchInputUI
