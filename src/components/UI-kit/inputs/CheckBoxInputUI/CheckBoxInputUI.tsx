'use client'
import {CSSProperties, FC, useId, useState} from 'react'
import styles from './CheckBoxInputUI.module.scss'
import {useDebouncedCallback} from 'use-debounce'

interface ICheckBoxUIProps {
  title: string
  setCheckedOnFirstRender?: boolean
  extraClass?: string
  extraStyles?: CSSProperties
  onChange?: (checked: boolean, title: string) => void
  debounceTime?: number
  filterName: string
}

const CheckBoxInputUI: FC<ICheckBoxUIProps> = ({
  title,
  setCheckedOnFirstRender = false,
  extraClass,
  extraStyles,
  onChange,
  debounceTime = 1500,
  filterName
}) => {
  const id = useId()
  const [isChecked, setIsChecked] = useState(setCheckedOnFirstRender)

  const debouncedOnChange = useDebouncedCallback((checked: boolean) => {
    if (onChange) {
      onChange(checked, filterName)
    }
  }, debounceTime)

  const handleChange = () => {
    const newCheckedState = !isChecked
    setIsChecked(newCheckedState)
    debouncedOnChange(newCheckedState)
  }

  return (
    <label style={{...extraStyles}} className={`${styles.checkbox__container} ${extraClass || ''}`} htmlFor={id}>
      <div className={`${styles.checkbox__visual} ${isChecked ? styles.checkbox__visual_checked : ''}`}></div>
      <p className={`fontJaro ${styles.input__text || 'input__text'}`}>{title}</p>
      <input
        id={id}
        onChange={handleChange}
        checked={isChecked}
        className={`${styles.checkbox__hide_input}`}
        type={'checkbox'}
      />
    </label>
  )
}

export default CheckBoxInputUI
