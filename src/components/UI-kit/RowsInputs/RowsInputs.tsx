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
  idNames?: string[]
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
  controlled?: boolean // флаг для включения контролируемого режима
  externalValues?: string[][]
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
  idNames,
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
    <div id={`cy-row-${idNames?.[0]}-${rowIndex}`} ref={setNodeRef} style={style}>
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
              idForLabel={
                `cy-create-card-row-input-${idNames?.[inputIndex]}` ||
                `cy-create-card-row-input-${inputIndex}-${inputType?.[inputIndex]}`
              }
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
  idNames
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
      // В контролируемом режиме синхронизируем с внешними значениями
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
    //  else if (!controlled && rowsInitialValues) {
    //   const isCurrentStateEmpty = rows.every((row) => row.every((cell) => cell.trim() === ''))

    //   if (isCurrentStateEmpty || JSON.stringify(rowsInitialValues) !== JSON.stringify(rows)) {
    //     setRows(rowsInitialValues)

    //     // Обновляем rowIds если количество строк изменилось
    //     if (rowsInitialValues.length !== rowIds.length) {
    //       const newRowIds = rowsInitialValues.map((_, index) =>
    //         index < rowIds.length ? rowIds[index] : `row-${index}-${Date.now()}`
    //       )
    //       setRowIds(newRowIds)
    //     }
    //   }
    // }
  }, [controlled, externalValues, rowsInitialValues])

  // Получаем актуальные значения строк
  const currentRows = controlled && externalValues ? externalValues : rows

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
    return currentRows.filter(isRowFullyFilled).length
  }

  // Проверка, какие строки нужно подсветить как ошибочные
  const getRowsWithErrors = () => {
    if (!errorMessage || minFilledRows === 0) return []

    const filledCount = getFilledRowsCount()

    // Собираем индексы строк с ошибками
    const errorRows: number[] = []

    // Проверяем частично заполненные строки
    currentRows.forEach((row, index) => {
      if (isRowPartiallyFilled(row)) {
        errorRows.push(index)
      }
    })

    // Если заполнено меньше минимума, подсвечиваем также пустые строки до minFilledRows
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

  // Обновляем rowIds при изменении количества строк
  useEffect(() => {
    if (currentRows.length > rowIds.length) {
      // Добавляем новые ID для новых строк
      const newIds = [...rowIds]
      for (let i = rowIds.length; i < currentRows.length; i++) {
        newIds.push(`row-${i}-${Date.now()}`)
      }
      setRowIds(newIds)
    } else if (currentRows.length < rowIds.length) {
      // Удаляем лишние ID
      setRowIds(rowIds.slice(0, currentRows.length))
    }
  }, [currentRows.length])

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
    if (currentRows.length < maxRows) {
      const newRows = [...currentRows, new Array(inputsInRowCount).fill('')]

      if (!controlled) {
        setRows(newRows)
        setRowIds([...rowIds, `row-${currentRows.length}-${Date.now()}`])
      }

      // Уведомляем родительский компонент об изменении
      if (onRowsChange) {
        onRowsChange(newRows)
      }
    }
  }

  // Удаление строки
  const removeRow = (rowIndex: number) => {
    if (currentRows.length === 1) return
    const newRows = currentRows.filter((_, index) => index !== rowIndex)
    const newRowIds = rowIds.filter((_, index) => index !== rowIndex)

    if (!controlled) {
      setRows(newRows)
      setRowIds(newRowIds)
    }

    // Уведомляем родительский компонент об изменении
    if (onRowsChange) {
      onRowsChange(newRows)
    }
  }

  // Обновление значения в конкретном инпуте
  const updateValue = (rowIndex: number, inputIndex: number, value: string) => {
    const newRows = [...currentRows]
    newRows[rowIndex][inputIndex] = value

    if (!controlled) {
      setRows(newRows)
    }

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

      const newRows = arrayMove(currentRows, oldIndex, newIndex)
      const newRowIds = arrayMove(rowIds, oldIndex, newIndex)

      if (!controlled) {
        setRows(newRows)
        setRowIds(newRowIds)
      }

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
