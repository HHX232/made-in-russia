'use client'
import {FC, useEffect, useId, useState} from 'react'
import styles from './TelephoneInputUI.module.scss'

export type TNumberStart = 'China' | 'Belarus' | 'Russia' | 'Kazakhstan' | 'other'

interface ITelephoneProps {
  currentValue?: string
  onSetValue: (val: string) => void
  error?: string
  numberStartWith: TNumberStart
}

export const TelephoneInputUI: FC<ITelephoneProps> = ({
  currentValue = '',
  onSetValue,
  error = '',
  numberStartWith = 'other'
}) => {
  const id = useId()
  const [startValue, setStartValue] = useState('+375')
  const [inputValue, setInputValue] = useState(currentValue)
  const [formattedValue, setFormattedValue] = useState('')

  // Set country code based on selected country
  useEffect(() => {
    // Устанавливаем код страны
    let code = ''
    let maxLength = 10 // Значение по умолчанию

    switch (numberStartWith) {
      case 'Belarus':
        code = '+375'
        maxLength = 9 // 9 цифр после кода +375
        break
      case 'China':
        code = '+86'
        maxLength = 11 // 11 цифр после кода +86
        break
      case 'Russia':
      case 'Kazakhstan':
        code = '+7'
        maxLength = 10 // 10 цифр после кода +7
        break
      case 'other':
      default:
        code = ''
        maxLength = 15 // Произвольное значение для "other"
        break
    }

    setStartValue(code)

    // Обрезаем номер до допустимой длины для новой страны
    const cleanedValue = inputValue.replace(/\D/g, '').slice(0, maxLength)

    // Форматируем обрезанное значение
    const newFormattedValue = formatPhoneNumber(cleanedValue, numberStartWith)

    // Обновляем состояния
    setInputValue(cleanedValue)
    setFormattedValue(newFormattedValue)
    onSetValue(newFormattedValue)
  }, [numberStartWith, onSetValue])

  // Format the phone number based on country
  const formatPhoneNumber = (value: string, country: TNumberStart) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '')

    let formatted = ''

    switch (country) {
      case 'Belarus': // Format: (XX) XXX XX XX
        if (digitsOnly.length > 0) formatted += '(' + digitsOnly.substring(0, 2)
        if (digitsOnly.length > 2) formatted += ') ' + digitsOnly.substring(2, 5)
        if (digitsOnly.length > 5) formatted += ' ' + digitsOnly.substring(5, 7)
        if (digitsOnly.length > 7) formatted += ' ' + digitsOnly.substring(7, 9)
        break

      case 'Russia':
      case 'Kazakhstan': // Format: (XXX) XXX XX XX
        if (digitsOnly.length > 0) formatted += '(' + digitsOnly.substring(0, 3)
        if (digitsOnly.length > 3) formatted += ') ' + digitsOnly.substring(3, 6)
        if (digitsOnly.length > 6) formatted += ' ' + digitsOnly.substring(6, 8)
        if (digitsOnly.length > 8) formatted += ' ' + digitsOnly.substring(8, 10)
        break

      case 'China': // Format: (XXX) XXXX XXXX
        if (digitsOnly.length > 0) formatted += '(' + digitsOnly.substring(0, 3)
        if (digitsOnly.length > 3) formatted += ') ' + digitsOnly.substring(3, 7)
        if (digitsOnly.length > 7) formatted += ' ' + digitsOnly.substring(7, 11)
        break

      case 'other':
      default: // Format: (XXX) XXX XXXX
        if (digitsOnly.length > 0) formatted += '(' + digitsOnly.substring(0, 3)
        if (digitsOnly.length > 3) formatted += ') ' + digitsOnly.substring(3, 6)
        if (digitsOnly.length > 6) formatted += ' ' + digitsOnly.substring(6, 10)
        break
    }

    return formatted
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get input value and remove any non-digit characters
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, '')

    // Format the phone number
    const formatted = formatPhoneNumber(digitsOnly, numberStartWith)

    // Update state
    setInputValue(digitsOnly)
    setFormattedValue(formatted)
    onSetValue(digitsOnly)
  }

  return (
    <div className={` ${styles.input__box}`}>
      <label htmlFor={id} className={`${styles.input__box} `}>
        <div
          className={`${styles.box__start} ${error && error?.length > 1 && formattedValue?.length !== 0 && styles.error__box}`}
        >
          {startValue}
        </div>
        <input
          onChange={handleInputChange}
          value={formattedValue}
          id={id}
          type='text'
          className={styles.def__input}
          //  placeholder={getPhoneFormat(numberStartWith)}
        />
      </label>
    </div>
  )
}

export const getPhoneFormat = (country: TNumberStart) => {
  switch (country) {
    case 'Belarus':
      return '(XX) XXX XX XX'
    case 'Russia':
    case 'Kazakhstan':
      return '(XXX) XXX XX XX'
    case 'China':
      return '(XXX) XXXX XXXX'
    case 'other':
    default:
      return '(XXX) XXX XXXX'
  }
}
