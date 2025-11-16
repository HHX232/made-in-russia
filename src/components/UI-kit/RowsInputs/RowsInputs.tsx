'use client'
import {useState, useEffect, useRef} from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import TextInputUI from '../inputs/TextInputUI/TextInputUI'
import styles from './RowsInputs.module.scss'
import TextAreaUI from '../TextAreaUI/TextAreaUI'
import {useCurrentLanguageWithCookie} from '@/hooks/useCurrentLanguage'
import {useTranslations} from 'next-intl'

const plusCircle = '/create-card/plus-circle.svg'
const minusCircle = '/create-card/minusCircle.svg'
const dragHandle = '/create-card/drag-handle.svg'

type TInputType = 'text' | 'number' | 'password' | 'dropdown' | 'textarea' | 'numbersWithSpec'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonSizes {
  plus?: {width: number; height: number}
  minus?: {width: number; height: number}
  drag?: {width: number; height: number}
}

interface RowsInputsProps {
  hideTitles?: boolean
  useNewTheme?: boolean
  useOneWord?: boolean
  extra__rows__grid?: string
  specialCreatePlaceholder?: string
  extraTextareaClass?: string
  extraGlobalClass?: string
  createButtonExtraText?: string
  extraPlaceholder?: string
  titles: string[]
  initialRowsCount?: number
  inputsInRowCount?: number
  idNames?: string[]
  maxRows?: number
  rowsInitialValues?: string[][]
  onSetValue: (rowIndex: number, inputIndex: number, value: string) => void
  onRowsChange?: (rows: string[][]) => void
  extraClasses?: string[]
  extraButtonPlusClass?: string
  extraButtonMinusClass?: string
  errorMessage?: string
  minFilledRows?: number
  inputType?: TInputType[]
  controlled?: boolean
  externalValues?: string[][]
  dropdownOptions?: string[][]
  canCreateNewOption?: boolean[]
  showClearButton?: boolean[]
  inputsTheme?: 'dark' | 'light' | 'superWhite' | 'lightBlue'
  textAreaProps?: {
    minRows?: number
    maxRows?: number
    autoResize?: boolean
  }
  buttonsSizes?: ButtonSize
  customButtonSizes?: ButtonSizes
  showDnDButton?: boolean
  isOnlyShow?: boolean
  onBlur?: (rowIndex: number, inputIndex: number, value: string) => void
  onClick?: (rowIndex: number, inputIndex: number, value: string) => void
  onFocus?: (rowIndex: number, inputIndex: number, value: string) => void
  onKeyUp?: (rowIndex: number, inputIndex: number, value: string, event: React.KeyboardEvent) => void
}

const getDefaultButtonSizes = (size: ButtonSize): ButtonSizes => {
  switch (size) {
    case 'small':
      return {
        plus: {width: 28, height: 28},
        minus: {width: 28, height: 28},
        drag: {width: 8, height: 12}
      }
    case 'medium':
      return {
        plus: {width: 34, height: 34},
        minus: {width: 34, height: 34},
        drag: {width: 10, height: 15}
      }
    case 'large':
    default:
      return {
        plus: {width: 39, height: 39},
        minus: {width: 39, height: 39},
        drag: {width: 12, height: 18}
      }
  }
}

interface DropdownProps {
  value: string
  options: string[]
  placeholder: string
  onSelect: (value: string) => void
  hasError?: boolean
  inputId: string
  canCreateNew?: boolean
  showClear?: boolean
  readOnly?: boolean
  useClip?: boolean
  useClipOnSpan?: boolean
  extraDropClass?: string
  useOneWord?: boolean
}

const Dropdown = ({
  value,
  options,
  placeholder,
  onSelect,
  hasError,
  inputId,
  canCreateNew = false,
  showClear = false,
  readOnly = false,
  useClip = true,
  extraDropClass,
  useClipOnSpan = false,
  useOneWord = false
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownListRef = useRef<HTMLDivElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)
  const currentLang = useCurrentLanguageWithCookie()
  const t = useTranslations('dropdown')
  const miniTranslates = {
    ru: 'Создать',
    en: 'Create',
    zh: '创建',
    hi: 'बनाएँ'
  }

  const clearTranslates = {
    ru: 'Очистить',
    en: 'Clear',
    zh: '清除',
    hi: 'साफ़ करें'
  }

  // Функция проверки видимости dropdown меню
  const isDropdownVisible = () => {
    if (!dropdownListRef.current) return true

    const rect = dropdownListRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth

    // Проверяем, находится ли dropdown в пределах экрана
    const isInViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= viewportHeight && rect.right <= viewportWidth

    return isInViewport
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreatingNew(false)
        setCustomValue('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as Element

      // Если скролл происходит внутри самого dropdown - игнорируем
      if (dropdownRef.current && (dropdownRef.current === target || dropdownRef.current.contains(target))) {
        return
      }

      // Проверяем, выходит ли dropdown за пределы экрана
      if (!isDropdownVisible()) {
        setIsOpen(false)
        setIsCreatingNew(false)
        setCustomValue('')
      }
    }

    if (isOpen) {
      // Добавляем слушатель с небольшой задержкой для debounce
      let scrollTimeout: NodeJS.Timeout
      const debouncedScroll = (e: Event) => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => handleScroll(e), 50)
      }

      document.addEventListener('scroll', debouncedScroll, true)
      window.addEventListener('scroll', debouncedScroll)

      return () => {
        clearTimeout(scrollTimeout)
        document.removeEventListener('scroll', debouncedScroll, true)
        window.removeEventListener('scroll', debouncedScroll)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isCreatingNew && customInputRef.current) {
      customInputRef.current.focus()
    }
  }, [isCreatingNew])

  const handleSelect = (option: string) => {
    if (readOnly) return
    onSelect(option)
    setIsOpen(false)
    setIsCreatingNew(false)
    setCustomValue('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (readOnly) return
    onSelect('')
  }

  const handleCreateNew = () => {
    if (readOnly) return
    setIsCreatingNew(true)
  }

  const handleCustomSubmit = () => {
    if (readOnly) return
    if (customValue.trim()) {
      onSelect(customValue.trim())
      setIsOpen(false)
      setIsCreatingNew(false)
      setCustomValue('')
    }
  }

  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (readOnly) return
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomSubmit()
    } else if (e.key === 'Escape') {
      setIsCreatingNew(false)
      setCustomValue('')
    }
  }

  const handleCustomCancel = () => {
    setIsCreatingNew(false)
    setCustomValue('')
  }

  return (
    <div style={{overflowX: useClip ? 'clip' : 'visible'}} key={inputId} className={styles.dropdown} ref={dropdownRef}>
      <div
        className={`${styles.dropdown__trigger} ${hasError ? styles.error__dropdown : ''} ${readOnly ? styles.dropdown__readonly : ''} ${showClear && value ? styles.dropdown__trigger__with__clear : ''}`}
        onClick={() => !readOnly && setIsOpen(!isOpen)}
        id={inputId}
        style={{cursor: readOnly ? 'default' : 'pointer', overflowX: useClipOnSpan ? 'clip' : 'visible'}}
      >
        <span style={{margin: '0 auto'}} className={value ? styles.dropdown__value : styles.dropdown__placeholder}>
          {useOneWord && (value || placeholder || '')?.trim()?.split(' ')[0]}
          {!useOneWord && (value || placeholder || '')?.trim()}
        </span>
        {showClear && value && !readOnly && (
          <button
            type='button'
            className={styles.dropdown__clear__button}
            onClick={handleClear}
            aria-label='Clear value'
          >
            {clearTranslates?.[currentLang as keyof typeof clearTranslates] || 'Clear'}
          </button>
        )}
      </div>

      {isOpen && !readOnly && (
        <div ref={dropdownListRef} className={`${styles.dropdown__list} ${extraDropClass}`}>
          {canCreateNew && (
            <>
              {isCreatingNew ? (
                <div className={styles.dropdown__custom__input__wrapper}>
                  <TextInputUI
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    refProps={customInputRef as any}
                    theme='newGray'
                    onKeyDown={handleCustomKeyPress}
                    extraClass={styles.extra__text__input}
                    placeholder={t('enterValue')}
                    currentValue={customValue}
                    onSetValue={(value) => setCustomValue(value)}
                  />
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '5px'
                    }}
                    className={styles.dropdown__custom__buttons}
                  >
                    <button
                      style={{margin: '0 auto'}}
                      type='button'
                      onClick={handleCustomSubmit}
                      className={styles.dropdown__custom__button__confirm}
                      disabled={!customValue.trim()}
                    >
                      ✓
                    </button>
                    <button
                      style={{margin: '0 auto'}}
                      type='button'
                      onClick={handleCustomCancel}
                      className={styles.dropdown__custom__button__cancel}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`${styles.dropdown__option} ${styles.dropdown__option__create}`}
                  onClick={handleCreateNew}
                >
                  + {miniTranslates?.[currentLang as keyof typeof miniTranslates] || 'en'}
                </div>
              )}
              {options.length > 0 && <div className={styles.dropdown__separator} />}
            </>
          )}
          {options.map((option, index) => (
            <div
              key={index + inputId}
              className={`${styles.dropdown__option} ${option === value ? styles.dropdown__option__selected : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface SortableRowProps {
  id: string
  extra__rows__grid?: string
  rowIndex: number
  row: string[]
  titles: string[]
  extraTextareaClass?: string
  inputsInRowCount: number
  idNames?: string[]
  extraPlaceholder?: string
  extraClass?: string
  isLastRow: boolean
  totalRows: number

  canRemove: boolean
  onUpdateValue: (rowIndex: number, inputIndex: number, value: string) => void
  onRemoveRow: (rowIndex: number) => void
  extraButtonMinusClass?: string
  hasError?: boolean
  inputType?: TInputType[]
  dropdownOptions?: string[][]
  canCreateNewOption?: boolean[]
  showClearButton?: boolean[]
  inputsTheme?: 'dark' | 'light' | 'superWhite' | 'lightBlue' | 'newGray'
  textAreaProps?: {
    minRows?: number
    maxRows?: number
    autoResize?: boolean
  }
  buttonSizes: ButtonSizes
  showDnDButton: boolean
  isOnlyShow?: boolean
  useNewTheme?: boolean
  useOneWord?: boolean
  onBlur?: (rowIndex: number, inputIndex: number, value: string) => void
  onClick?: (rowIndex: number, inputIndex: number, value: string) => void
  onFocus?: (rowIndex: number, inputIndex: number, value: string) => void
  onKeyUp?: (rowIndex: number, inputIndex: number, value: string, event: React.KeyboardEvent) => void
}

const SortableRow = ({
  id,
  rowIndex,
  extraTextareaClass,
  row,
  titles,
  inputsInRowCount,
  extraClass,
  isLastRow,
  canRemove,
  idNames,
  onUpdateValue,
  onRemoveRow,
  extraButtonMinusClass,
  hasError,
  inputType,
  dropdownOptions,
  canCreateNewOption,
  showClearButton,
  inputsTheme,
  textAreaProps,
  buttonSizes,
  showDnDButton,
  isOnlyShow = false,
  onBlur,
  onClick,
  onFocus,
  onKeyUp,
  useNewTheme,
  extraPlaceholder,
  totalRows,
  extra__rows__grid,
  useOneWord
}: SortableRowProps) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id})
  const shouldShowDnD = showDnDButton && !isOnlyShow && totalRows > 1

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const renderInput = (value: string, inputIndex: number, lastElemet: boolean) => {
    const currentInputType = inputType?.[inputIndex] || 'text'
    const inputId =
      `cy-create-card-row-input-${idNames?.[inputIndex]}` ||
      `cy-create-card-row-input-${inputIndex}-${currentInputType}`

    if (currentInputType === 'dropdown') {
      const options = dropdownOptions?.[inputIndex] || []
      const canCreateNew = canCreateNewOption?.[inputIndex] || false
      const showClear = showClearButton?.[inputIndex] || false

      return (
        <Dropdown
          key={inputIndex + inputId}
          useClipOnSpan={lastElemet}
          value={value}
          useClip={!lastElemet}
          options={options}
          useOneWord={useOneWord}
          extraDropClass={(lastElemet && styles.extraDropClass) || ''}
          placeholder={titles[inputIndex] || 'Выберите значение'}
          onSelect={(newValue) => !isOnlyShow && onUpdateValue(rowIndex, inputIndex, newValue)}
          hasError={hasError && !value}
          inputId={inputId}
          canCreateNew={canCreateNew}
          showClear={showClear}
          readOnly={isOnlyShow}
        />
      )
    }

    if (currentInputType === 'textarea') {
      return (
        <TextAreaUI
          key={inputIndex}
          extraClass={`${styles.area__extra__min__height} ${extraTextareaClass}`}
          theme={
            useNewTheme
              ? 'newWhite'
              : inputsTheme
                ? inputsTheme === 'newGray'
                  ? 'newWhite'
                  : inputsTheme
                : 'lightBlue'
          }
          placeholder={extraPlaceholder || titles[inputIndex] || 'value...'}
          currentValue={value}
          onSetValue={(newValue) => !isOnlyShow && onUpdateValue(rowIndex, inputIndex, newValue)}
          errorValue={hasError && !value ? ' ' : ''}
          autoResize={textAreaProps?.autoResize ?? true}
          minRows={textAreaProps?.minRows ?? 2}
          maxRows={textAreaProps?.maxRows ?? 5}
          readOnly={isOnlyShow}
          onBlur={onBlur && !isOnlyShow ? () => onBlur(rowIndex, inputIndex, value) : undefined}
          onClick={onClick && !isOnlyShow ? () => onClick(rowIndex, inputIndex, value) : undefined}
          onFocus={onFocus && !isOnlyShow ? () => onFocus(rowIndex, inputIndex, value) : undefined}
          onKeyUp={onKeyUp && !isOnlyShow ? (event) => onKeyUp(rowIndex, inputIndex, value, event) : undefined}
        />
      )
    }

    return (
      <TextInputUI
        inputType={currentInputType}
        key={inputIndex}
        idForLabel={inputId}
        theme={useNewTheme ? 'newWhite' : inputsTheme ? inputsTheme : 'lightBlue'}
        placeholder={extraPlaceholder || titles[inputIndex] || 'value...'}
        currentValue={value}
        onSetValue={(newValue) => !isOnlyShow && onUpdateValue(rowIndex, inputIndex, newValue)}
        errorValue={hasError && !value ? ' ' : ''}
        readOnly={isOnlyShow}
        onBlur={onBlur && !isOnlyShow ? () => onBlur(rowIndex, inputIndex, value) : undefined}
        onClick={onClick && !isOnlyShow ? () => onClick(rowIndex, inputIndex, value) : undefined}
        onFocus={onFocus && !isOnlyShow ? () => onFocus(rowIndex, inputIndex, value) : undefined}
        onKeyUp={onKeyUp && !isOnlyShow ? (event) => onKeyUp(rowIndex, inputIndex, value, event) : undefined}
      />
    )
  }

  return (
    <div id={`cy-row-${idNames?.[0]}-${rowIndex}`} ref={setNodeRef} style={style}>
      <div
        className={`${styles.rows__inputs__box} ${useNewTheme && styles.without__gap} ${extraClass || ''} ${isDragging ? styles.dragging : ''} ${hasError ? styles.error : ''} ${!shouldShowDnD ? styles.no__drag : ''}`}
      >
        {shouldShowDnD && (
          <button
            className={styles.rows__inputs__drag}
            {...attributes}
            {...listeners}
            type='button'
            aria-label='Перетащить строку'
          >
            <Image
              src={dragHandle}
              alt='drag'
              width={buttonSizes.drag?.width || 12}
              height={buttonSizes.drag?.height || 18}
            />
          </button>
        )}

        <div
          className={`${styles.rows__inputs__row} ${extra__rows__grid}`}
          style={{gridTemplateColumns: `repeat(${inputsInRowCount}, 1fr)`}}
        >
          {row.map((value, inputIndex) => renderInput(value, inputIndex, row.length - 1 === inputIndex))}
        </div>

        {!isOnlyShow && (
          <button
            className={`${styles.rows__inputs__remove} ${extraButtonMinusClass} ${useNewTheme && styles.newButtonTheme}`}
            onClick={() => onRemoveRow(rowIndex)}
            id={`cy-create-card-row-remove-${rowIndex}`}
            type='button'
            aria-label='Удалить строку'
            disabled={!canRemove}
            style={{opacity: canRemove ? 1 : 0.3}}
          >
            {useNewTheme ? (
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M18 6L6 18' stroke='#2F2F2F' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M6 6L18 18' stroke='#2F2F2F' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            ) : (
              <Image
                src={minusCircle}
                alt='minus'
                width={buttonSizes.minus?.width || 39}
                height={buttonSizes.minus?.height || 39}
              />
            )}
          </button>
        )}
      </div>
      {!isLastRow && <div className={styles.gray__bottom__line}></div>}
    </div>
  )
}

const RowsInputs = ({
  titles,
  initialRowsCount = 1,
  inputsInRowCount = 2,
  maxRows = 10,
  rowsInitialValues,
  onSetValue,
  onRowsChange,
  extraButtonPlusClass,
  extraButtonMinusClass,
  extraClasses = [],
  errorMessage = '',
  minFilledRows = 0,
  inputType,
  controlled = false,
  externalValues,
  idNames,
  dropdownOptions,
  canCreateNewOption,
  showClearButton,
  inputsTheme,
  textAreaProps = {
    minRows: 2,
    maxRows: 5,
    autoResize: true
  },
  buttonsSizes = 'large',
  customButtonSizes,
  showDnDButton = true,
  isOnlyShow = false,
  onBlur,
  onClick,
  onFocus,
  onKeyUp,
  extraGlobalClass,
  specialCreatePlaceholder,
  useNewTheme = true,
  hideTitles = false,
  extraTextareaClass,
  createButtonExtraText,
  extraPlaceholder,
  extra__rows__grid,
  useOneWord = false
}: RowsInputsProps) => {
  const t = useTranslations('rowsImputs')
  const [rows, setRows] = useState<string[][]>(() => {
    if (controlled && externalValues && externalValues.length > 0) {
      return externalValues
    }
    if (rowsInitialValues && rowsInitialValues.length > 0) {
      return rowsInitialValues
    }
    const initialRows = []
    for (let i = 0; i < initialRowsCount; i++) {
      initialRows.push(new Array(inputsInRowCount).fill(''))
    }
    return initialRows
  })

  const [rowIds, setRowIds] = useState<string[]>(() => {
    const initialRows =
      controlled && externalValues
        ? externalValues
        : rowsInitialValues && rowsInitialValues.length > 0
          ? rowsInitialValues
          : Array(initialRowsCount)
              .fill(0)
              .map(() => new Array(inputsInRowCount).fill(''))

    return initialRows.map((_, index) => `row-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  })

  const buttonSizes = customButtonSizes || getDefaultButtonSizes(buttonsSizes)

  useEffect(() => {
    if (controlled && externalValues) {
      const currentDataString = JSON.stringify(rows)
      const externalDataString = JSON.stringify(externalValues)

      if (currentDataString !== externalDataString) {
        console.log('🔄 Синхронизация RowsInputs:', {
          external: externalValues,
          current: rows,
          rowIdsLength: rowIds.length
        })

        setRows(externalValues)

        if (externalValues.length !== rowIds.length) {
          const newRowIds = externalValues.map((_, index) =>
            index < rowIds.length
              ? rowIds[index]
              : `row-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          )
          setRowIds(newRowIds)
        }
      }
    }
  }, [controlled, externalValues])

  useEffect(() => {
    const duplicates = rowIds.filter((id, index) => rowIds.indexOf(id) !== index)
    if (duplicates.length > 0) {
      console.warn('🚨 Дублирующиеся rowIds найдены:', duplicates)
    }

    // console.log('📊 RowsInputs Debug:', {
    //   controlled,
    //   externalValuesLength: externalValues?.length || 0,
    //   rowsLength: rows.length,
    //   rowIdsLength: rowIds.length,
    //   currentRowsLength: currentRows.length,
    //   duplicatesFound: duplicates.length > 0,
    //   rowIds: rowIds.slice(0, 3)
    // })
  }, [controlled, externalValues, rows, rowIds])

  const currentRows = controlled && externalValues ? externalValues : rows

  const isRowFullyFilled = (row: string[]) => {
    return row.every((cell) => cell.trim() !== '')
  }

  const isRowPartiallyFilled = (row: string[]) => {
    const filledCells = row.filter((cell) => cell.trim() !== '').length
    return filledCells > 0 && filledCells < row.length
  }

  const getFilledRowsCount = () => {
    return currentRows.filter(isRowFullyFilled).length
  }

  const getRowsWithErrors = () => {
    if (!errorMessage || minFilledRows === 0 || isOnlyShow) return []

    const filledCount = getFilledRowsCount()
    const errorRows: number[] = []

    currentRows.forEach((row, index) => {
      if (isRowPartiallyFilled(row)) {
        errorRows.push(index)
      }
    })

    if (filledCount < minFilledRows) {
      currentRows.forEach((row, index) => {
        if (index < minFilledRows && !isRowFullyFilled(row) && !errorRows.includes(index)) {
          errorRows.push(index)
        }
      })
    }

    return errorRows
  }

  const rowsWithErrors = getRowsWithErrors()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const addRow = () => {
    if (isOnlyShow || currentRows.length >= maxRows) return

    const newRows = [...currentRows, new Array(inputsInRowCount).fill('')]

    if (!controlled) {
      const newRowId = `row-${currentRows.length}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setRows(newRows)
      setRowIds([...rowIds, newRowId])
    }

    if (onRowsChange) {
      onRowsChange(newRows)
    }
  }

  const removeRow = (rowIndex: number) => {
    if (isOnlyShow || currentRows.length === 1) return

    const newRows = currentRows.filter((_, index) => index !== rowIndex)

    if (!controlled) {
      const newRowIds = rowIds.filter((_, index) => index !== rowIndex)
      setRows(newRows)
      setRowIds(newRowIds)
    }

    if (onRowsChange) {
      onRowsChange(newRows)
    }
  }

  const updateValue = (rowIndex: number, inputIndex: number, value: string) => {
    if (isOnlyShow) return

    const newRows = [...currentRows]

    if (!newRows[rowIndex]) {
      console.warn('❌ Попытка обновить несуществующую строку:', rowIndex, 'в массиве длиной:', newRows.length)
      return
    }

    newRows[rowIndex][inputIndex] = value

    if (!controlled) {
      setRows(newRows)
    }

    onSetValue(rowIndex, inputIndex, value)

    if (onRowsChange && !controlled) {
      onRowsChange(newRows)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (isOnlyShow) return

    const {active, over} = event

    if (over && active.id !== over.id) {
      const oldIndex = rowIds.indexOf(active.id as string)
      const newIndex = rowIds.indexOf(over.id as string)

      if (oldIndex === -1 || newIndex === -1) {
        console.warn('❌ Не найден индекс для перетаскивания:', {
          activeId: active.id,
          overId: over.id,
          rowIds: rowIds,
          oldIndex,
          newIndex
        })
        return
      }

      const newRows = arrayMove(currentRows, oldIndex, newIndex)

      if (!controlled) {
        const newRowIds = arrayMove(rowIds, oldIndex, newIndex)
        setRows(newRows)
        setRowIds(newRowIds)
      }

      if (onRowsChange) {
        onRowsChange(newRows)
      }
    }
  }

  if (currentRows.length !== rowIds.length) {
    console.warn('⚠️ Несоответствие длины массивов:', {
      rowsLength: currentRows.length,
      rowIdsLength: rowIds.length,
      controlled
    })
  }
  const shouldShowDnDInTitles = showDnDButton && !isOnlyShow && currentRows.length > 1

  return (
    <div
      className={`${styles.rows__inputs__wrapper} ${extraGlobalClass} ${errorMessage && !isOnlyShow ? styles.has__error : ''}`}
    >
      <div className={styles.rows__inputs}>
        {!hideTitles && (
          <div
            className={`${styles.rows__inputs__titles} ${!shouldShowDnDInTitles ? styles.no__drag : ''}`}
            style={{gridTemplateColumns: `repeat(${inputsInRowCount}, 1fr)`}}
          >
            {titles.map((title, index) => (
              <p key={index} className={styles.rows__inputs__title}>
                {title}
              </p>
            ))}
          </div>
        )}

        <DndContext sensors={isOnlyShow ? [] : sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
            <div className={styles.rows__inputs__container}>
              {currentRows.map((row, rowIndex) => {
                const rowId = rowIds[rowIndex]
                if (!rowId) {
                  console.warn('❌ Отсутствует rowId для индекса:', rowIndex)
                  return null
                }

                return (
                  <SortableRow
                    useOneWord={useOneWord}
                    totalRows={currentRows.length}
                    useNewTheme={useNewTheme}
                    key={rowId}
                    extra__rows__grid={extra__rows__grid}
                    extraTextareaClass={extraTextareaClass}
                    inputsTheme={inputsTheme}
                    extraButtonMinusClass={extraButtonMinusClass}
                    inputType={inputType}
                    id={rowId}
                    rowIndex={rowIndex}
                    idNames={idNames}
                    row={row}
                    extraPlaceholder={extraPlaceholder}
                    titles={titles}
                    inputsInRowCount={inputsInRowCount}
                    extraClass={extraClasses[rowIndex]}
                    isLastRow={rowIndex === currentRows.length - 1}
                    canRemove={currentRows.length > 1}
                    onUpdateValue={updateValue}
                    onRemoveRow={removeRow}
                    hasError={rowsWithErrors.includes(rowIndex)}
                    dropdownOptions={dropdownOptions}
                    canCreateNewOption={canCreateNewOption}
                    showClearButton={showClearButton}
                    textAreaProps={textAreaProps}
                    buttonSizes={buttonSizes}
                    showDnDButton={showDnDButton}
                    isOnlyShow={isOnlyShow}
                    onBlur={onBlur}
                    onClick={onClick}
                    onFocus={onFocus}
                    onKeyUp={onKeyUp}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>

        {currentRows.length < maxRows && !isOnlyShow && (
          <button
            style={{width: useNewTheme ? '100%' : 'auto', transform: useNewTheme ? 'none' : 'inherit'}}
            id={`cy-create-card-row-plus-button-${idNames?.[0] || 'default'}`}
            className={`${styles.rows__inputs__add} ${extraButtonPlusClass}`}
            onClick={addRow}
            type='button'
            aria-label='Добавить строку'
          >
            {useNewTheme ? (
              <div className={styles.newButtonCreateTheme}>
                <p className={styles.create_place_new}>
                  {createButtonExtraText || specialCreatePlaceholder || t('addRow')}
                </p>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M6 12H18' stroke='#2F2F2F' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                  <path d='M12 18V6' stroke='#2F2F2F' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </div>
            ) : (
              <Image
                src={plusCircle}
                alt='plus'
                width={buttonSizes.plus?.width || 39}
                height={buttonSizes.plus?.height || 39}
              />
            )}
          </button>
        )}
      </div>

      {(errorMessage || minFilledRows > 0) && !isOnlyShow && (
        <div className={styles.info__block}>
          {errorMessage && <p className={styles.error__message}>{errorMessage}</p>}
        </div>
      )}
    </div>
  )
}

export default RowsInputs
