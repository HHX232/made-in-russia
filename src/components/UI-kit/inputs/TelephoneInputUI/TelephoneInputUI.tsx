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
  isOnlyShow?: boolean
  extraStyle?: React.CSSProperties
}

// Функция для получения кода страны
// В TelephoneInputUI.tsx обновите функцию getCountryCode:

const getCountryCode = (country: TNumberStart): string => {
  // TODO вернуть логи
  // console.log('getCountryCode called with:', country, 'type:', typeof country)

  switch (country) {
    case 'Belarus':
      // console.log('Returning +375 for Belarus')
      return '+375'
    case 'China':
      // console.log('Returning +86 for China')
      return '+86'
    case 'Russia':
      // console.log('Returning +7 for Russia')
      return '+7'
    case 'Kazakhstan':
      // console.log('Returning +7 for Kazakhstan')
      return '+7'
    case 'other':
      // console.log('Returning + for other')
      return '+'
    default:
      // ВАЖНО: если пришло неизвестное значение, возвращаем '+'
      console.warn('Unknown country in getCountryCode:', country)
      return '+'
  }
}
// Функция для получения максимальной длины номера
const getMaxLength = (country: TNumberStart): number => {
  switch (country) {
    case 'Belarus':
      return 9
    case 'China':
      return 11
    case 'Russia':
    case 'Kazakhstan':
      return 10
    case 'other':
    default:
      return 25
  }
}

export const TelephoneInputUI: FC<ITelephoneProps> = ({
  currentValue = '',
  onSetValue,
  error = '',
  numberStartWith = 'other',
  extraClass,
  isOnlyShow,
  extraStyle
}) => {
  const id = useId()

  // console.log('TelephoneInputUI render:', {
  //   currentValue,
  //   numberStartWith,
  //   currentValueLength: currentValue.length
  // })

  // Инициализируем startValue правильным кодом страны
  const [startValue, setStartValue] = useState(() => {
    const code = getCountryCode(numberStartWith)
    // console.log('Initial startValue:', code, 'for country:', numberStartWith)
    return code
  })
  const [inputValue, setInputValue] = useState(() => {
    // console.log('Initial inputValue:', currentValue)
    return currentValue
  })
  const [formattedValue, setFormattedValue] = useState(() => {
    // Форматируем начальное значение при инициализации
    const formatted = formatPhoneNumber(currentValue, numberStartWith)
    // console.log('Initial formattedValue:', formatted, 'from:', currentValue)
    return formatted
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Format the phone number based on country
  function formatPhoneNumber(value: string, country: TNumberStart) {
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

  // Обновляем значение при изменении currentValue извне (после инициализации)
  useEffect(() => {
    console.log('currentValue useEffect:', {
      currentValue,
      inputValue,
      isInitialized,
      numberStartWith
    })

    if (currentValue !== inputValue) {
      // console.log('Updating from currentValue:', currentValue)
      setInputValue(currentValue)
      const formatted = formatPhoneNumber(currentValue, numberStartWith)
      setFormattedValue(formatted)
      // console.log('Set formatted to:', formatted)
    }
  }, [currentValue, numberStartWith])

  // Set country code when country changes
  useEffect(() => {
    // console.log('Country change useEffect:', {
    //   numberStartWith,
    //   isInitialized,
    //   currentInputValue: inputValue,
    //   currentValue
    // })

    // Устанавливаем код страны
    const code = getCountryCode(numberStartWith)
    const maxLength = getMaxLength(numberStartWith)

    // console.log('Setting country code:', code)
    setStartValue(code)

    // Если это не первая инициализация
    if (isInitialized) {
      // Используем currentValue если inputValue пустой
      const valueToUse = inputValue || currentValue
      // Обрезаем номер до допустимой длины для новой страны
      const cleanedValue = valueToUse.replace(/\D/g, '').slice(0, maxLength)

      // Форматируем значение
      const newFormattedValue = formatPhoneNumber(cleanedValue, numberStartWith)

      // console.log('Country change - updating values:', {
      //   valueToUse,
      //   cleanedValue,
      //   newFormattedValue
      // })

      setInputValue(cleanedValue)
      setFormattedValue(newFormattedValue)
      onSetValue(cleanedValue)
    } else {
      // При первой инициализации форматируем currentValue если он есть
      if (currentValue) {
        const cleanedValue = currentValue.replace(/\D/g, '').slice(0, maxLength)
        const newFormattedValue = formatPhoneNumber(cleanedValue, numberStartWith)

        // console.log('First init with value:', {
        //   currentValue,
        //   cleanedValue,
        //   newFormattedValue
        // })

        setInputValue(cleanedValue)
        setFormattedValue(newFormattedValue)
      }
      // console.log('First initialization completed')
      setIsInitialized(true)
    }
  }, [numberStartWith, currentValue])

  // Handle input changes - это единственное место где должен вызываться onSetValue при вводе пользователя
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, '')

    // Получаем максимальную длину для текущей страны
    const maxLength = getMaxLength(numberStartWith)

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
          disabled={isOnlyShow}
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
