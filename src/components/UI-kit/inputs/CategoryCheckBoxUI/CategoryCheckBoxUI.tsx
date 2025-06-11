'use client'
import {CSSProperties, FC, useId, useState, useEffect} from 'react'
import styles from './CategoryCheckBoxUI.module.scss'
import {useDebouncedCallback} from 'use-debounce'
import {useDispatch, useSelector} from 'react-redux'
import {useActions} from '@/hooks/useActions'
import {TypeRootState} from '@/store/store'
import {selectFilter} from '@/store/Filters/filters.slice'

interface ICheckBoxUIProps {
  title: string
  setCheckedOnFirstRender?: boolean
  extraClass?: string
  extraStyles?: CSSProperties
  onChange?: (checked: boolean, title: string) => void
  debounceTime?: number
  filterName: string
}

const CategoryCheckBoxUI: FC<ICheckBoxUIProps> = ({
  title,
  setCheckedOnFirstRender = false,
  extraClass,
  extraStyles,
  onChange,
  debounceTime = 1500,
  filterName
}) => {
  const id = useId()
  const dispatch = useDispatch()
  const {setFilter} = useActions()

  const actualFilterName = filterName || title

  const isCheckedFromRedux = useSelector((state: TypeRootState) => selectFilter(state, actualFilterName))
  const [isChecked, setIsChecked] = useState(setCheckedOnFirstRender || isCheckedFromRedux)

  useEffect(() => {
    const initialState = setCheckedOnFirstRender || isCheckedFromRedux
    setIsChecked(initialState)

    if (setCheckedOnFirstRender && !isCheckedFromRedux) {
      dispatch(setFilter({filterName: actualFilterName, checked: true}))
    }
  }, [setCheckedOnFirstRender, isCheckedFromRedux, actualFilterName, dispatch, setFilter])

  const debouncedOnChange = useDebouncedCallback((checked: boolean) => {
    dispatch(setFilter({filterName: actualFilterName, checked}))

    if (onChange) {
      onChange(checked, actualFilterName)
    }
  }, debounceTime)

  const handleChange = () => {
    const newCheckedState = !isChecked

    setIsChecked(newCheckedState)
    debouncedOnChange(newCheckedState)
  }

  return (
    <label style={{...extraStyles}} className={`${styles.checkbox__container} ${extraClass || ''}`} htmlFor={id}>
      <div
        style={{minHeight: '20px', minWidth: '20px'}}
        className={`${styles.checkbox__visual} ${isChecked ? styles.checkbox__visual_checked : ''}`}
      ></div>
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

export default CategoryCheckBoxUI
