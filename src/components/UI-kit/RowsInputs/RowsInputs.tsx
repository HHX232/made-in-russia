'use client'
import {useState, useEffect} from 'react'
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
const dragHandle = '/create-card/drag-handle.svg' // Добавьте иконку для перетаскивания
type TInputType = 'text' | 'number' | 'password'
interface RowsInputsProps {
  titles: string[]
  initialRowsCount?: number
  inputsInRowCount?: number
  maxRows?: number
  rowsInitialValues?: string[][] // Новый prop для инициализации значений
  onSetValue: (rowIndex: number, inputIndex: number, value: string) => void
  onRowsChange?: (rows: string[][]) => void // Callback для передачи всей матрицы
  extraClasses?: string[]
  extraButtonPlusClass?: string
  extraButtonMinusClass?: string
  errorMessage?: string // Сообщение об ошибке
  minFilledRows?: number // Минимальное количество заполненных строк
  inputType?: TInputType[]
}

// Компонент для сортируемой строки
interface SortableRowProps {
  id: string
  rowIndex: number
  row: string[]
  titles: string[]
  inputsInRowCount: number
  extraClass?: string
  isLastRow: boolean
  canRemove: boolean
  onUpdateValue: (rowIndex: number, inputIndex: number, value: string) => void
  onRemoveRow: (rowIndex: number) => void
  extraButtonMinusClass?: string
  hasError?: boolean // Показывать ли ошибку для этой строки
  inputType?: TInputType[]
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
  onUpdateValue,
  onRemoveRow,
  extraButtonMinusClass,
  hasError,
  inputType
}: SortableRowProps) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id})

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`${styles.rows__inputs__box} ${extraClass || ''} ${isDragging ? styles.dragging : ''} ${hasError ? styles.error : ''}`}
      >
        {/* Добавляем ручку для перетаскивания */}
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
          {row.map((value, inputIndex) => (
            <TextInputUI
              inputType={inputType?.[inputIndex] || 'text'}
              key={inputIndex}
              theme='lightBlue'
              placeholder={titles[inputIndex] || 'Введите значение'}
              currentValue={value}
              onSetValue={(newValue) => onUpdateValue(rowIndex, inputIndex, newValue)}
              errorValue={hasError && !value ? ' ' : ''} // Показываем визуальную ошибку для пустых полей
            />
          ))}
        </div>
        <button
          className={`${styles.rows__inputs__remove} ${extraButtonMinusClass}`}
          onClick={() => onRemoveRow(rowIndex)}
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
  inputType
}: RowsInputsProps) => {
  // Инициализируем состояние для всех строк
  const [rows, setRows] = useState<string[][]>(() => {
    // Если есть начальные значения, используем их
    if (rowsInitialValues && rowsInitialValues.length > 0) {
      return rowsInitialValues
    }
    // Иначе создаем пустые строки
    const initialRows = []
    for (let i = 0; i < initialRowsCount; i++) {
      initialRows.push(new Array(inputsInRowCount).fill(''))
    }
    return initialRows
  })

  // Создаем массив идентификаторов для строк
  const [rowIds, setRowIds] = useState<string[]>(() => rows.map((_, index) => `row-${index}-${Date.now()}`))

  // Проверка, полностью ли заполнена строка
  const isRowFullyFilled = (row: string[]) => {
    return row.every((cell) => cell.trim() !== '')
  }

  // Проверка, частично ли заполнена строка
  const isRowPartiallyFilled = (row: string[]) => {
    const filledCells = row.filter((cell) => cell.trim() !== '').length
    return filledCells > 0 && filledCells < row.length
  }

  // Подсчет полностью заполненных строк
  const getFilledRowsCount = () => {
    return rows.filter(isRowFullyFilled).length
  }

  // Проверка, какие строки нужно подсветить как ошибочные
  const getRowsWithErrors = () => {
    if (!errorMessage || minFilledRows === 0) return []

    const filledCount = getFilledRowsCount()

    // Собираем индексы строк с ошибками
    const errorRows: number[] = []

    // Проверяем частично заполненные строки
    rows.forEach((row, index) => {
      if (isRowPartiallyFilled(row)) {
        errorRows.push(index)
      }
    })

    // Если заполнено меньше минимума, подсвечиваем также пустые строки до minFilledRows
    if (filledCount < minFilledRows) {
      rows.forEach((row, index) => {
        if (index < minFilledRows && !isRowFullyFilled(row) && !errorRows.includes(index)) {
          errorRows.push(index)
        }
      })
    }

    return errorRows
  }

  const rowsWithErrors = getRowsWithErrors()

  // Обновляем rowIds при изменении количества строк
  useEffect(() => {
    if (rows.length > rowIds.length) {
      // Добавляем новые ID для новых строк
      const newIds = [...rowIds]
      for (let i = rowIds.length; i < rows.length; i++) {
        newIds.push(`row-${i}-${Date.now()}`)
      }
      setRowIds(newIds)
    } else if (rows.length < rowIds.length) {
      // Удаляем лишние ID
      setRowIds(rowIds.slice(0, rows.length))
    }
  }, [rows.length])

  // Настройка сенсоров для drag and drop
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

  // Добавление новой строки
  const addRow = () => {
    if (rows.length < maxRows) {
      const newRows = [...rows, new Array(inputsInRowCount).fill('')]
      setRows(newRows)
      setRowIds([...rowIds, `row-${rows.length}-${Date.now()}`])
      // Уведомляем родительский компонент об изменении
      if (onRowsChange) {
        onRowsChange(newRows)
      }
    }
  }

  // Удаление строки
  const removeRow = (rowIndex: number) => {
    if (rows.length === 1) return
    const newRows = rows.filter((_, index) => index !== rowIndex)
    const newRowIds = rowIds.filter((_, index) => index !== rowIndex)
    setRows(newRows)
    setRowIds(newRowIds)
    // Уведомляем родительский компонент об изменении
    if (onRowsChange) {
      onRowsChange(newRows)
    }
  }

  // Обновление значения в конкретном инпуте
  const updateValue = (rowIndex: number, inputIndex: number, value: string) => {
    const newRows = [...rows]
    newRows[rowIndex][inputIndex] = value
    setRows(newRows)
    onSetValue(rowIndex, inputIndex, value)
    // Уведомляем родительский компонент об изменении
    if (onRowsChange) {
      onRowsChange(newRows)
    }
  }

  // Обработка окончания перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event

    if (over && active.id !== over.id) {
      const oldIndex = rowIds.indexOf(active.id as string)
      const newIndex = rowIds.indexOf(over.id as string)

      const newRows = arrayMove(rows, oldIndex, newIndex)
      setRows(newRows)
      setRowIds(arrayMove(rowIds, oldIndex, newIndex))

      // Уведомляем родительский компонент об изменении
      if (onRowsChange) {
        onRowsChange(newRows)
      }

      // Если есть extraClasses, также переставляем их
      if (extraClasses.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newExtraClasses = arrayMove([...extraClasses], oldIndex, newIndex)
        // Здесь вам нужно будет добавить callback для обновления extraClasses в родительском компоненте
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
              {rows.map((row, rowIndex) => (
                <SortableRow
                  extraButtonMinusClass={extraButtonMinusClass}
                  key={rowIds[rowIndex]}
                  inputType={inputType}
                  id={rowIds[rowIndex]}
                  rowIndex={rowIndex}
                  row={row}
                  titles={titles}
                  inputsInRowCount={inputsInRowCount}
                  extraClass={extraClasses[rowIndex]}
                  isLastRow={rowIndex === rows.length - 1}
                  canRemove={rows.length > 1}
                  onUpdateValue={updateValue}
                  onRemoveRow={removeRow}
                  hasError={rowsWithErrors.includes(rowIndex)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Кнопка добавления новой строки */}
        {rows.length < maxRows && (
          <button
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
