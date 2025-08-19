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

const plusCircle = '/create-card/plus-circle.svg'
const minusCircle = '/create-card/minusCircle.svg'
const dragHandle = '/create-card/drag-handle.svg'
// const dropdownArrow = '/create-card/dropdown-arrow.svg' // Добавьте иконку стрелки

type TInputType = 'text' | 'number' | 'password' | 'dropdown'

interface RowsInputsProps {
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
  dropdownOptions?: string[][] // Новый prop для опций dropdown'ов
}

// Компонент Dropdown
interface DropdownProps {
  value: string
  options: string[]
  placeholder: string
  onSelect: (value: string) => void
  hasError?: boolean
  inputId: string
}

const Dropdown = ({value, options, placeholder, onSelect, hasError, inputId}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Закрытие при клике вне элемента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Закрытие при скролле страницы
  useEffect(() => {
    const handleScroll = () => {
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('scroll', handleScroll, true)
      return () => document.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  const handleSelect = (option: string) => {
    onSelect(option)
    setIsOpen(false)
  }

  return (
    <div key={inputId} className={styles.dropdown} ref={dropdownRef}>
      <div
        className={`${styles.dropdown__trigger} ${hasError ? styles.error__dropdown : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        id={inputId}
      >
        <span style={{margin: '0 auto'}} className={value ? styles.dropdown__value : styles.dropdown__placeholder}>
          {value || placeholder}
        </span>
        {/* <Image
          src={dropdownArrow}
          alt='dropdown arrow'
          width={12}
          height={8}
          className={`${styles.dropdown__arrow} ${isOpen ? styles.dropdown__arrow__open : ''}`}
        /> */}
      </div>

      {isOpen && (
        <div className={styles.dropdown__list}>
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

// Компонент для сортируемой строки
interface SortableRowProps {
  id: string
  rowIndex: number
  row: string[]
  titles: string[]
  inputsInRowCount: number
  idNames?: string[]
  extraClass?: string
  isLastRow: boolean
  canRemove: boolean
  onUpdateValue: (rowIndex: number, inputIndex: number, value: string) => void
  onRemoveRow: (rowIndex: number) => void
  extraButtonMinusClass?: string
  hasError?: boolean
  inputType?: TInputType[]
  dropdownOptions?: string[][]
}

const SortableRow = ({
  id,
  rowIndex,
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
  dropdownOptions
}: SortableRowProps) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id})

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const renderInput = (value: string, inputIndex: number) => {
    const currentInputType = inputType?.[inputIndex] || 'text'
    const inputId =
      `cy-create-card-row-input-${idNames?.[inputIndex]}` ||
      `cy-create-card-row-input-${inputIndex}-${currentInputType}`

    if (currentInputType === 'dropdown') {
      const options = dropdownOptions?.[inputIndex] || []
      return (
        <Dropdown
          key={inputIndex + inputId}
          value={value}
          options={options}
          placeholder={titles[inputIndex] || 'Выберите значение'}
          onSelect={(newValue) => onUpdateValue(rowIndex, inputIndex, newValue)}
          hasError={hasError && !value}
          inputId={inputId}
        />
      )
    }

    return (
      <TextInputUI
        inputType={currentInputType}
        key={inputIndex}
        idForLabel={inputId}
        theme='lightBlue'
        placeholder={titles[inputIndex] || 'Введите значение'}
        currentValue={value}
        onSetValue={(newValue) => onUpdateValue(rowIndex, inputIndex, newValue)}
        errorValue={hasError && !value ? ' ' : ''}
      />
    )
  }

  return (
    <div id={`cy-row-${idNames?.[0]}-${rowIndex}`} ref={setNodeRef} style={style}>
      <div
        className={`${styles.rows__inputs__box} ${extraClass || ''} ${isDragging ? styles.dragging : ''} ${hasError ? styles.error : ''}`}
      >
        {/* Ручка для перетаскивания */}
        <button
          className={styles.rows__inputs__drag}
          {...attributes}
          {...listeners}
          type='button'
          aria-label='Перетащить строку'
        >
          <Image src={dragHandle} alt='drag' width={12} height={18} />
        </button>

        <div className={styles.rows__inputs__row} style={{gridTemplateColumns: `repeat(${inputsInRowCount}, 1fr)`}}>
          {row.map((value, inputIndex) => renderInput(value, inputIndex))}
        </div>

        <button
          className={`${styles.rows__inputs__remove} ${extraButtonMinusClass}`}
          onClick={() => onRemoveRow(rowIndex)}
          id={`cy-create-card-row-remove-${rowIndex}`}
          type='button'
          aria-label='Удалить строку'
          disabled={!canRemove}
          style={{opacity: canRemove ? 1 : 0.3}}
        >
          <Image src={minusCircle} alt='minus' width={39} height={39} />
        </button>
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
  dropdownOptions
}: RowsInputsProps) => {
  const [rows, setRows] = useState<string[][]>(() => {
    if (rowsInitialValues && rowsInitialValues.length > 0) {
      return rowsInitialValues
    }
    const initialRows = []
    for (let i = 0; i < initialRowsCount; i++) {
      initialRows.push(new Array(inputsInRowCount).fill(''))
    }
    return initialRows
  })

  const [rowIds, setRowIds] = useState<string[]>(() => rows.map((_, index) => `row-${index}-${Date.now()}`))

  useEffect(() => {
    if (controlled && externalValues) {
      if (JSON.stringify(externalValues) !== JSON.stringify(rows)) {
        setRows(externalValues)

        if (externalValues.length !== rowIds.length) {
          const newRowIds = externalValues.map((_, index) =>
            index < rowIds.length ? rowIds[index] : `row-${index}-${Date.now()}`
          )
          setRowIds(newRowIds)
        }
      }
    }
  }, [controlled, externalValues, rowsInitialValues])

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
    if (!errorMessage || minFilledRows === 0) return []

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

  useEffect(() => {
    if (currentRows.length > rowIds.length) {
      const newIds = [...rowIds]
      for (let i = rowIds.length; i < currentRows.length; i++) {
        newIds.push(`row-${i}-${Date.now()}`)
      }
      setRowIds(newIds)
    } else if (currentRows.length < rowIds.length) {
      setRowIds(rowIds.slice(0, currentRows.length))
    }
  }, [currentRows.length])

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
    if (currentRows.length < maxRows) {
      const newRows = [...currentRows, new Array(inputsInRowCount).fill('')]

      if (!controlled) {
        setRows(newRows)
        setRowIds([...rowIds, `row-${currentRows.length}-${Date.now()}`])
      }

      if (onRowsChange) {
        onRowsChange(newRows)
      }
    }
  }

  const removeRow = (rowIndex: number) => {
    if (currentRows.length === 1) return
    const newRows = currentRows.filter((_, index) => index !== rowIndex)
    const newRowIds = rowIds.filter((_, index) => index !== rowIndex)

    if (!controlled) {
      setRows(newRows)
      setRowIds(newRowIds)
    }

    if (onRowsChange) {
      onRowsChange(newRows)
    }
  }

  const updateValue = (rowIndex: number, inputIndex: number, value: string) => {
    const newRows = [...currentRows]
    newRows[rowIndex][inputIndex] = value

    if (!controlled) {
      setRows(newRows)
    }

    onSetValue(rowIndex, inputIndex, value)

    if (onRowsChange) {
      onRowsChange(newRows)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event

    if (over && active.id !== over.id) {
      const oldIndex = rowIds.indexOf(active.id as string)
      const newIndex = rowIds.indexOf(over.id as string)

      const newRows = arrayMove(currentRows, oldIndex, newIndex)
      const newRowIds = arrayMove(rowIds, oldIndex, newIndex)

      if (!controlled) {
        setRows(newRows)
        setRowIds(newRowIds)
      }

      if (onRowsChange) {
        onRowsChange(newRows)
      }

      if (extraClasses.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newExtraClasses = arrayMove([...extraClasses], oldIndex, newIndex)
      }
    }
  }

  return (
    <div className={`${styles.rows__inputs__wrapper} ${errorMessage ? styles.has__error : ''}`}>
      <div className={styles.rows__inputs}>
        {/* Заголовки */}
        <div className={styles.rows__inputs__titles} style={{gridTemplateColumns: `repeat(${inputsInRowCount}, 1fr)`}}>
          {titles.map((title, index) => (
            <p key={index} className={styles.rows__inputs__title}>
              {title}
            </p>
          ))}
        </div>

        {/* Строки с инпутами */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
            <div className={styles.rows__inputs__container}>
              {currentRows.map((row, rowIndex) => (
                <SortableRow
                  extraButtonMinusClass={extraButtonMinusClass}
                  key={rowIds[rowIndex]}
                  inputType={inputType}
                  id={rowIds[rowIndex]}
                  rowIndex={rowIndex}
                  idNames={idNames}
                  row={row}
                  titles={titles}
                  inputsInRowCount={inputsInRowCount}
                  extraClass={extraClasses[rowIndex]}
                  isLastRow={rowIndex === currentRows.length - 1}
                  canRemove={currentRows.length > 1}
                  onUpdateValue={updateValue}
                  onRemoveRow={removeRow}
                  hasError={rowsWithErrors.includes(rowIndex)}
                  dropdownOptions={dropdownOptions}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Кнопка добавления новой строки */}
        {currentRows.length < maxRows && (
          <button
            id={`cy-create-card-row-plus-button-${idNames?.[0] || 'default'}`}
            className={`${styles.rows__inputs__add} ${extraButtonPlusClass}`}
            onClick={addRow}
            type='button'
            aria-label='Добавить строку'
          >
            <Image src={plusCircle} alt='plus' width={39} height={39} />
          </button>
        )}
      </div>

      {/* Блок с ошибкой и счетчиком */}
      {(errorMessage || minFilledRows > 0) && (
        <div className={styles.info__block}>
          {errorMessage && <p className={styles.error__message}>{errorMessage}</p>}
        </div>
      )}
    </div>
  )
}

export default RowsInputs
