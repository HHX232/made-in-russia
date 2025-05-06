import {CSSProperties, FC, useId, useState} from 'react'
import styles from './TextInputUI.module.scss'
import Image, {StaticImageData} from 'next/image'
import hideIcon from '@/assets/images/hide__text.svg'
import showIcon from '@/assets/images/show__text.svg'
import Link from 'next/link'
import {Url} from 'next/dist/shared/lib/router/router'

interface ITextInputProps {
  extraClass?: string
  extraStyle?: CSSProperties
  placeholder: string
  title: string
  helpTitle?: string
  isSecret?: boolean
  currentValue: string
  onSetValue: (value: string) => void
  errorValue?: string
  customIcon?: StaticImageData
  customIconOnAlternativeState?: StaticImageData
  linkToHelp?: Url
}

const TextInputUI: FC<ITextInputProps> = ({
  extraClass,
  extraStyle,
  placeholder = '',
  title = '',
  helpTitle,
  isSecret,
  currentValue,
  onSetValue,
  errorValue,
  customIcon,
  customIconOnAlternativeState,
  linkToHelp = ''
}) => {
  const [textIsShow, setTextIsShow] = useState(false)
  const [displayValue, setDisplayValue] = useState(isSecret ? currentValue.replace(/./g, '*') : currentValue)
  const id = useId()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (isSecret) {
      if (value.length > displayValue.length) {
        const addedChars = value.slice(displayValue.length)
        const newValue = currentValue + addedChars
        onSetValue(newValue)
        setDisplayValue(displayValue + addedChars.replace(/./g, '*'))
      } else {
        const newValue = value.length === 0 ? '' : currentValue.slice(0, value.length)
        onSetValue(newValue)
        setDisplayValue(newValue.replace(/./g, '*'))
      }
    } else {
      onSetValue(value)
    }
  }

  const toggleTextVisibility = () => {
    setTextIsShow(!textIsShow)
  }

  return (
    <label style={{...extraStyle}} htmlFor={id} className={`${extraClass} ${styles.input__box}`}>
      <div className={`${styles.titles_box}`}>
        {title && <p className={`${styles.input__title}`}>{title}</p>}
        {helpTitle && (
          <Link href={linkToHelp} className={`${styles.help__title}`}>
            {helpTitle}
          </Link>
        )}
      </div>
      <div className={`${styles.input__inner__box} ${errorValue && styles.error__input__inner__box}`}>
        <input
          placeholder={placeholder}
          type={isSecret && !textIsShow ? 'password' : 'text'}
          value={textIsShow ? currentValue : displayValue}
          onChange={handleChange}
          className={`${styles.input} ${errorValue && styles.error__input}`}
          id={id}
        />
        {isSecret &&
          (!customIcon ? (
            <div className={`${styles.secret__box}`} onClick={toggleTextVisibility}>
              {textIsShow ? (
                <Image width={22} height={18} alt='Hide text' src={hideIcon} />
              ) : (
                <Image width={22} height={18} alt='Show text' src={showIcon} />
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

export default TextInputUI

//example const [text, setText] = useState('')
// <TextInputUI
// helpTitle='Help?'
// errorValue='Error '
// isSecret
// currentValue={text}
// onSetValue={setText}
// placeholder='Write...'
// title='title'
// />
