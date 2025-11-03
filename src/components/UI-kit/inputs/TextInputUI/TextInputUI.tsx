'use client'
import {CSSProperties, memo, ReactNode, useCallback, useEffect, useId, useState} from 'react'
import styles from './TextInputUI.module.scss'
import Image, {StaticImageData} from 'next/image'
import cn from 'clsx'
import Link from 'next/link'
import {Url} from 'next/dist/shared/lib/router/router'

const hideIcon = '/hide__text.svg'
const showIcon = '/show__text.svg'

interface ITextInputProps {
  inputType?: 'text' | 'password' | 'email' | 'number' | 'numbersWithSpec'
  extraClass?: string
  extraStyle?: CSSProperties
  placeholder: string
  title?: string | ReactNode
  helpTitle?: string
  isSecret?: boolean
  currentValue: string
  onSetValue: (value: string) => void
  errorValue?: string
  customIcon?: StaticImageData
  customIconOnAlternativeState?: StaticImageData
  linkToHelp?: Url
  theme?: 'dark' | 'light' | 'superWhite' | 'lightBlue' | 'newGray' | 'newWhite'
  // Дополнительные события для input
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onMouseEnter?: (e: React.MouseEvent<HTMLInputElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLInputElement>) => void
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void
  disabled?: boolean
  readOnly?: boolean
  autoComplete?: string
  autoFocus?: boolean
  idForLabel?: string
  refProps?: React.RefObject<HTMLInputElement> | null
  maxLength?: number
}

const TextInputUI = memo<ITextInputProps>(
  ({
    extraClass,
    extraStyle,
    placeholder = '',
    title = '',
    helpTitle,
    isSecret = false,
    currentValue,
    onSetValue,
    errorValue,
    customIcon,
    customIconOnAlternativeState,
    linkToHelp = '',
    theme = 'dark',
    inputType = 'text',
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onMouseEnter,
    onMouseLeave,
    onClick,
    idForLabel,
    disabled = false,
    readOnly = false,
    autoComplete,
    autoFocus = false,
    refProps,
    maxLength
  }) => {
    const [textIsShow, setTextIsShow] = useState(false)
    const [displayValue, setDisplayValue] = useState(isSecret ? currentValue.replace(/./g, '*') : currentValue)
    const id = useId()

    useEffect(() => {
      setDisplayValue(isSecret && !textIsShow ? currentValue.replace(/./g, '*') : currentValue)
    }, [isSecret, textIsShow, currentValue])

    const isValidNumberInput = useCallback((value: string): boolean => {
      return /^-?[\d.,]*$/.test(value)
    }, [])

    const isValidNumbersWithSpec = useCallback((value: string): boolean => {
      return /^[\d\-.,%]*$/.test(value)
    }, [])

    const handleNumberKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (inputType === 'number' && ['e', 'E', '+'].includes(e.key)) {
          e.preventDefault()
          return
        }
        if (onKeyDown) {
          onKeyDown(e)
        }
      },
      [inputType, onKeyDown]
    )

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Проверка на максимальную длину
        if (maxLength !== undefined && value.length > maxLength) {
          return
        }

        if (inputType === 'number' && value !== '' && !isValidNumberInput(value)) {
          return
        }

        if (inputType === 'numbersWithSpec' && value !== '' && !isValidNumbersWithSpec(value)) {
          return
        }

        if (isSecret) {
          // Упрощенная логика для секретного ввода
          if (value.length > displayValue.length) {
            const addedChars = value.slice(displayValue.length)
            const newValue = currentValue + addedChars
            // Проверка на максимальную длину для секретного ввода
            if (maxLength === undefined || newValue.length <= maxLength) {
              onSetValue(newValue)
            }
          } else {
            onSetValue(currentValue.slice(0, value.length))
          }
        } else {
          onSetValue(value)
        }
      },
      [
        inputType,
        isValidNumberInput,
        isValidNumbersWithSpec,
        isSecret,
        displayValue,
        currentValue,
        onSetValue,
        maxLength
      ]
    )

    const toggleTextVisibility = useCallback(() => {
      setTextIsShow((prev) => !prev)
    }, [])

    return (
      <label
        style={{...extraStyle}}
        htmlFor={idForLabel ? idForLabel : id}
        className={cn(extraClass, styles.input__box, {
          [styles.dark]: theme === 'dark',
          [styles.light]: theme === 'light',
          [styles.superWhite]: theme === 'superWhite',
          [styles.lightBlue]: theme === 'lightBlue',
          [styles.newGray]: theme === 'newGray',
          [styles.newWhite]: theme === 'newWhite'
        })}
      >
        <div className={`${styles.titles_box}`}>
          {typeof title === typeof 'string' ? <p className={`${styles.input__title}`}>{title}</p> : title}
          {helpTitle && (
            <Link href={linkToHelp} className={`${styles.help__title}`}>
              {helpTitle}
            </Link>
          )}
        </div>
        <div className={`${styles.input__inner__box} ${errorValue && styles.error__input__inner__box}`}>
          <input
            ref={refProps}
            placeholder={placeholder}
            type={
              isSecret && !textIsShow
                ? 'password'
                : inputType === 'numbersWithSpec'
                  ? 'text'
                  : inputType
                    ? inputType
                    : 'text'
            }
            value={isSecret ? (textIsShow ? currentValue : displayValue) : currentValue}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={handleNumberKeyDown}
            onKeyUp={onKeyUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            className={cn(styles.input, {
              [styles.error__input]: errorValue,
              [styles.number__input]: inputType === 'number' || inputType === 'numbersWithSpec'
            })}
            id={idForLabel ? idForLabel : id}
          />
          {isSecret &&
            (!customIcon ? (
              <div className={`${styles.secret__box}`} onClick={toggleTextVisibility}>
                {textIsShow ? (
                  <Image style={{cursor: 'pointer'}} width={22} height={18} alt='Hide text' src={hideIcon} />
                ) : (
                  <Image style={{cursor: 'pointer'}} width={22} height={18} alt='Show text' src={showIcon} />
                )}
              </div>
            ) : (
              <div className={`${styles.secret__box}`} onClick={toggleTextVisibility}>
                {textIsShow ? (
                  customIconOnAlternativeState ? (
                    <Image src={customIconOnAlternativeState} alt='Hide text' />
                  ) : (
                    <Image src={customIcon} alt='Hide text' />
                  )
                ) : (
                  <Image src={customIcon} alt='Show text' />
                )}
              </div>
            ))}
        </div>
        {errorValue && <div className={`${styles.error__text}`}>{errorValue}</div>}
      </label>
    )
  }
)

TextInputUI.displayName = 'TextInputUIMemo'

export default TextInputUI
