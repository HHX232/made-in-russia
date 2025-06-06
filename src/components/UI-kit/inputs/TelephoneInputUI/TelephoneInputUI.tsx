'use client'
import {FC, useEffect, useId, useState} from 'react'
import styles from './TelephoneInputUI.module.scss'

export type TNumberStart = 'China' | 'Belarus' | 'Russia' | 'Kazakhstan' | 'other'

interface ITelephoneProps {
  currentValue?: string
  onSetValue: (val: string) => void
  error?: string
  numberStartWith: TNumberStart
  extraClass?: string
  extraStyle?: React.CSSProperties
}

export const TelephoneInputUI: FC<ITelephoneProps> = ({
  currentValue = '',
  onSetValue,
  error = '',
  numberStartWith = 'other',
  extraClass,
  extraStyle
}) => {
  const id = useId()
  const [startValue, setStartValue] = useState('+375')
  const [inputValue, setInputValue] = useState(currentValue)
  const [formattedValue, setFormattedValue] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Обновляем внутреннее состояние при изменении currentValue извне
  useEffect(() => {
    if (currentValue !== inputValue) {
      setInputValue(currentValue)
      const formatted = formatPhoneNumber(currentValue, numberStartWith)
      setFormattedValue(formatted)
    }
  }, [currentValue])

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
        code = '' // Пустой код для 'other'
        maxLength = 25 // Произвольное значение для "other"
        break
    }

    setStartValue(code)

    // Обрезаем номер до допустимой длины для новой страны
    const cleanedValue = inputValue.replace(/\D/g, '').slice(0, maxLength)

    // Форматируем значение
    const newFormattedValue = formatPhoneNumber(cleanedValue, numberStartWith)

    setInputValue(cleanedValue)
    setFormattedValue(newFormattedValue)

    // НЕ вызываем onSetValue при инициализации или смене страны
    // Вызываем только если это результат действий пользователя
    if (isInitialized) {
      onSetValue(cleanedValue)
    } else {
      setIsInitialized(true)
    }
  }, [numberStartWith])

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
      default: // Без форматирования для неопределенных стран
        formatted = digitsOnly // Просто возвращаем цифры без форматирования
        break
    }

    return formatted
  }

  // Handle input changes - это единственное место где должен вызываться onSetValue
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, '')

    // Получаем максимальную длину для текущей страны
    let maxLength = 25
    switch (numberStartWith) {
      case 'Belarus':
        maxLength = 9
        break
      case 'China':
        maxLength = 11
        break
      case 'Russia':
      case 'Kazakhstan':
        maxLength = 10
        break
    }

    // Ограничиваем ввод максимальной длиной
    const limitedDigits = digitsOnly.slice(0, maxLength)
    const formatted = formatPhoneNumber(limitedDigits, numberStartWith)

    setInputValue(limitedDigits)
    setFormattedValue(formatted)

    // Вызываем onSetValue только при пользовательском вводе
    onSetValue(limitedDigits)
  }

  return (
    <div className={` ${styles.input__box} ${extraClass}`} style={extraStyle}>
      <label htmlFor={id} className={`${styles.input__box} `}>
        <div
          className={`${styles.box__start} ${error && error?.length > 1 && formattedValue?.length !== 0 && styles.error__box}`}
        >
          {startValue.length !== 0 ? startValue : '+'}
        </div>
        <input
          onChange={handleInputChange}
          value={formattedValue}
          id={id}
          type='text'
          className={styles.def__input}
          // placeholder={'please write your telephone'}
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
      return 'XXXXXXXXXX' // Без форматирования для 'other'
  }
}

// Вспомогательная функция для проверки валидности номера
export const isPhoneNumberValid = (value: string, country: TNumberStart): boolean => {
  const digitsOnly = value.replace(/\D/g, '')

  switch (country) {
    case 'Belarus':
      return digitsOnly.length === 9
    case 'Russia':
    case 'Kazakhstan':
      return digitsOnly.length === 10
    case 'China':
      return digitsOnly.length === 11
    case 'other':
      return digitsOnly.length >= 1 // Для 'other' любая длина валидна
    default:
      return false
  }
}
