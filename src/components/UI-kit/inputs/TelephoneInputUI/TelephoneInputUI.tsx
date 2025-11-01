/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useEffect, useId, useState, useRef} from 'react'
import styles from './TelephoneInputUI.module.scss'

export type TNumberStart = 'China' | 'Belarus' | 'Russia' | 'Kazakhstan' | 'other'

interface ITelephoneProps {
  currentValue?: string
  onSetValue: (val: string) => void
  error?: string
  extraClass?: string
  isOnlyShow?: boolean
  extraStyle?: React.CSSProperties
}

// Определяем страну по коду
const detectCountryByCode = (value: string): TNumberStart | null => {
  const cleaned = value.replace(/\D/g, '')

  if (cleaned.startsWith('375')) return 'Belarus'
  if (cleaned.startsWith('7')) return 'Russia' // или Kazakhstan
  if (cleaned.startsWith('86')) return 'China'

  return null
}

// Функция форматирования номера с маской вида +X-XXX-XXX-XX-XX
const formatPhoneNumber = (value: string, country: TNumberStart | null): string => {
  const digitsOnly = value.replace(/\D/g, '')

  if (digitsOnly.length === 0) return ''

  let formatted = '+' + digitsOnly[0]

  switch (country) {
    case 'Belarus': // +375-XX-XXX-XX-XX
      if (digitsOnly.length > 1) formatted += digitsOnly.substring(1, 3)
      if (digitsOnly.length > 3) formatted += '-' + digitsOnly.substring(3, 5)
      if (digitsOnly.length > 5) formatted += '-' + digitsOnly.substring(5, 8)
      if (digitsOnly.length > 8) formatted += '-' + digitsOnly.substring(8, 10)
      if (digitsOnly.length > 10) formatted += '-' + digitsOnly.substring(10, 12)
      break

    case 'Russia':
    case 'Kazakhstan': // +7-XXX-XXX-XX-XX
      if (digitsOnly.length > 1) formatted += '-' + digitsOnly.substring(1, 4)
      if (digitsOnly.length > 4) formatted += '-' + digitsOnly.substring(4, 7)
      if (digitsOnly.length > 7) formatted += '-' + digitsOnly.substring(7, 9)
      if (digitsOnly.length > 9) formatted += '-' + digitsOnly.substring(9, 11)
      break

    case 'China': // +86-XXX-XXXX-XXXX
      if (digitsOnly.length > 1) formatted += digitsOnly.substring(1, 2)
      if (digitsOnly.length > 2) formatted += '-' + digitsOnly.substring(2, 5)
      if (digitsOnly.length > 5) formatted += '-' + digitsOnly.substring(5, 9)
      if (digitsOnly.length > 9) formatted += '-' + digitsOnly.substring(9, 13)
      break

    default: // Если не смогли определить страну - просто добавляем дефисы каждые 3-4 цифры
      if (digitsOnly.length > 1) formatted += '-' + digitsOnly.substring(1, 4)
      if (digitsOnly.length > 4) formatted += '-' + digitsOnly.substring(4, 7)
      if (digitsOnly.length > 7) formatted += '-' + digitsOnly.substring(7, 9)
      if (digitsOnly.length > 9) formatted += '-' + digitsOnly.substring(9, 11)
      if (digitsOnly.length > 11) formatted += digitsOnly.substring(11)
      break
  }

  return formatted
}

export const TelephoneInputUI: FC<ITelephoneProps> = ({
  currentValue = '',
  onSetValue,
  error = '',
  extraClass,
  isOnlyShow,
  extraStyle
}) => {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState(() => {
    if (!currentValue) return ''
    const country = detectCountryByCode(currentValue)
    return formatPhoneNumber(currentValue, country)
  })

  // Синхронизация с внешним значением
  useEffect(() => {
    const digitsOnly = currentValue.replace(/\D/g, '')
    const currentDigits = value.replace(/\D/g, '')

    if (digitsOnly !== currentDigits) {
      if (!digitsOnly) {
        setValue('')
      } else {
        const country = detectCountryByCode(digitsOnly)
        setValue(formatPhoneNumber(digitsOnly, country))
      }
    }
  }, [currentValue])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!value) {
      setValue('+')
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value === '+') {
      setValue('')
      onSetValue('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Если пользователь удалил всё
    if (!newValue) {
      setValue('')
      onSetValue('')
      return
    }

    // Если пользователь удалил плюс в начале - возвращаем его
    if (!newValue.startsWith('+')) {
      newValue = '+' + newValue
    }

    // Извлекаем только цифры
    const digitsOnly = newValue.replace(/\D/g, '')

    // Если только плюс без цифр
    if (digitsOnly.length === 0) {
      setValue('+')
      onSetValue('')
      return
    }

    // Определяем страну и форматируем
    const country = detectCountryByCode(digitsOnly)
    const formatted = formatPhoneNumber(digitsOnly, country)

    setValue(formatted)
    onSetValue(digitsOnly)
  }

  return (
    <div className={` ${styles.input__box} ${extraClass}`} style={extraStyle}>
      <label htmlFor={id} className={`${styles.input__box} `}>
        <input
          ref={inputRef}
          disabled={isOnlyShow}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          id={id}
          type='text'
          className={styles.def__input}
          placeholder='+7-777-777-77-77'
        />
      </label>
    </div>
  )
}

// Вспомогательные функции для экспорта
export const getPhoneFormat = (country: TNumberStart) => {
  switch (country) {
    case 'Belarus':
      return '+375-XX-XXX-XX-XX'
    case 'Russia':
    case 'Kazakhstan':
      return '+7-XXX-XXX-XX-XX'
    case 'China':
      return '+86-XXX-XXXX-XXXX'
    case 'other':
    default:
      return '+XXXXXXXXXXX'
  }
}

export const isPhoneNumberValid = (value: string, country: TNumberStart): boolean => {
  const digitsOnly = value.replace(/\D/g, '')

  switch (country) {
    case 'Belarus':
      return digitsOnly.length === 12 // 375 + 9 цифр
    case 'Russia':
    case 'Kazakhstan':
      return digitsOnly.length === 11 // 7 + 10 цифр
    case 'China':
      return digitsOnly.length === 13 // 86 + 11 цифр
    case 'other':
      return digitsOnly.length >= 1
    default:
      return true
  }
}
