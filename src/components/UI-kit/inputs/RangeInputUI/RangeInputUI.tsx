import React, {useId, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useDebouncedCallback} from 'use-debounce'

import styles from './RangeInputUI.module.scss'
import {TypeRootState} from '@/store/store'
import {selectRangeFilter, setRangeFilter} from '@/store/Filters/filters.slice'

interface RangeInputProps {
  filterName?: string
  title?: string
  min: number
  max: number
  step?: number
  defaultMin?: number
  defaultMax?: number
  onChange?: (min: number, max: number, filterName: string) => void
  debounceTime?: number
}

export const RangeInput: React.FC<RangeInputProps> = ({
  filterName,
  title,
  min,
  max,
  step = 1,
  defaultMin,
  defaultMax,
  onChange,
  debounceTime = 300
}) => {
  const id = useId()
  const dispatch = useDispatch()

  const actualFilterName = filterName || title || id

  // Get values from Redux
  const rangeFromRedux = useSelector((state: TypeRootState) => selectRangeFilter(state, actualFilterName))

  // Set initial values
  const [minValue, setMinValue] = useState(
    defaultMin !== undefined
      ? Math.round(defaultMin)
      : rangeFromRedux?.min !== undefined
        ? Math.round(rangeFromRedux.min)
        : Math.round(min)
  )

  const [maxValue, setMaxValue] = useState(
    defaultMax !== undefined
      ? Math.round(defaultMax)
      : rangeFromRedux?.max !== undefined
        ? Math.round(rangeFromRedux.max)
        : Math.round(max)
  )

  // Calculate percentage positions for the range slider
  const minPos = ((minValue - min) / (max - min)) * 100
  const maxPos = ((maxValue - min) / (max - min)) * 100

  // Update from Redux when necessary
  useEffect(() => {
    if (rangeFromRedux) {
      if (rangeFromRedux.min !== undefined) {
        setMinValue(Math.round(rangeFromRedux.min))
      }
      if (rangeFromRedux.max !== undefined) {
        setMaxValue(Math.round(rangeFromRedux.max))
      }
    }
  }, [rangeFromRedux])

  // Initialize Redux state if default values are provided
  useEffect(() => {
    if ((defaultMin !== undefined || defaultMax !== undefined) && !rangeFromRedux) {
      const initialMin = defaultMin !== undefined ? Math.round(defaultMin) : Math.round(min)
      const initialMax = defaultMax !== undefined ? Math.round(defaultMax) : Math.round(max)

      dispatch(
        setRangeFilter({
          filterName: actualFilterName,
          min: initialMin,
          max: initialMax
        })
      )
    }
  }, [defaultMin, defaultMax, min, max, actualFilterName, dispatch, rangeFromRedux])

  // Handle updates to Redux with debounce
  const debouncedOnChange = useDebouncedCallback((newMin: number, newMax: number) => {
    dispatch(
      setRangeFilter({
        filterName: actualFilterName,
        min: newMin,
        max: newMax
      })
    )

    if (onChange) {
      onChange(newMin, newMax, actualFilterName)
    }
  }, debounceTime)

  // Handle min input change
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (isNaN(value)) return

    const newMin = Math.max(min, Math.min(value, maxValue - step))
    setMinValue(Math.round(newMin))
    debouncedOnChange(Math.round(newMin), maxValue)
  }

  // Handle max input change
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (isNaN(value)) return

    const newMax = Math.min(max, Math.max(value, minValue + step))
    setMaxValue(Math.round(newMax))
    debouncedOnChange(minValue, Math.round(newMax))
  }

  // Mouse events for dragging handles
  const handleMinDrag = (e: React.MouseEvent) => {
    const startX = e.clientX
    const startMinValue = minValue
    const trackRect = (e.currentTarget.parentNode as HTMLElement).getBoundingClientRect()
    const trackWidth = trackRect.width

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaPercentage = (deltaX / trackWidth) * 100
      const deltaValue = (deltaPercentage / 100) * (max - min)

      const newMin = Math.max(min, Math.min(startMinValue + deltaValue, maxValue - step))
      const roundedMin = Math.round(newMin)

      setMinValue(roundedMin)
      debouncedOnChange(roundedMin, maxValue)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMaxDrag = (e: React.MouseEvent) => {
    const startX = e.clientX
    const startMaxValue = maxValue
    const trackRect = (e.currentTarget.parentNode as HTMLElement).getBoundingClientRect()
    const trackWidth = trackRect.width

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaPercentage = (deltaX / trackWidth) * 100
      const deltaValue = (deltaPercentage / 100) * (max - min)

      const newMax = Math.min(max, Math.max(startMaxValue + deltaValue, minValue + step))
      const roundedMax = Math.round(newMax)

      setMaxValue(roundedMax)
      debouncedOnChange(minValue, roundedMax)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <>
      <p className={styles.rangeContainer_title}>{title}</p>
      <div className={styles.rangeContainer}>
        <div className={styles.inputsContainer}>
          <input
            type='number'
            className={styles.valueInput}
            value={minValue}
            onChange={handleMinChange}
            min={min}
            max={maxValue - step}
            step={step}
          />
          <input
            type='number'
            className={styles.valueInput}
            value={maxValue}
            onChange={handleMaxChange}
            min={minValue + step}
            max={max}
            step={step}
          />
        </div>

        <div className={styles.sliderContainer}>
          <div className={styles.sliderTrack} />
          <div
            className={styles.sliderRange}
            style={{
              left: `${minPos}%`,
              width: `${maxPos - minPos}%`
            }}
          />
          <div className={styles.sliderHandle} style={{left: `${minPos}%`}} onMouseDown={handleMinDrag} />
          <div className={styles.sliderHandle} style={{left: `${maxPos}%`}} onMouseDown={handleMaxDrag} />
        </div>
      </div>
    </>
  )
}

export default RangeInput
