import React, {useState} from 'react'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import styles from './MultiDropSelect.module.scss'

export interface MultiSelectOption {
  id: string | number
  label: string
  value: string
  icon?: string
}

interface MultiDropSelectProps {
  options: MultiSelectOption[]
  selectedValues: MultiSelectOption[]
  onChange: (selected: MultiSelectOption[]) => void
  placeholder?: string
  disabled?: boolean
  direction?: 'left' | 'right' | 'bottom' | 'top'
  extraClass?: string
  isOnlyShow?: boolean
  showSearchInput?: boolean
  onSetSearchInput?: (value: string) => void
}

const MultiDropSelect: React.FC<MultiDropSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Выберите элементы...',
  disabled = false,
  direction = 'bottom',
  isOnlyShow = false,
  extraClass,
  showSearchInput = false,
  onSetSearchInput
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // Проверка, выбран ли элемент
  const isSelected = (option: MultiSelectOption) => {
    return selectedValues.some((selected) => selected.id === option.id)
  }

  // Обработчик выбора элемента
  const handleSelectOption = (option: MultiSelectOption) => {
    if (isOnlyShow) return // Блокируем изменения в режиме только просмотра

    const newSelected = isSelected(option)
      ? selectedValues.filter((item) => item.id !== option.id)
      : [...selectedValues, option]

    onChange(newSelected)
  }

  // Обработчик удаления выбранного элемента
  const handleRemoveOption = (optionId: string | number, e: React.MouseEvent) => {
    if (isOnlyShow) return // Блокируем изменения в режиме только просмотра

    e.stopPropagation()
    const newSelected = selectedValues.filter((item) => item.id !== optionId)
    onChange(newSelected)
  }

  // Компонент заголовка дропдауна
  const DropdownTitle = () => (
    <div className={`${styles.dropdownTitle} ${extraClass} ${isOnlyShow ? styles.readOnly : ''}`}>
      {selectedValues.length === 0 ? (
        <span className={styles.placeholder}>{placeholder}</span>
      ) : (
        <div className={styles.selectedItems}>
          {selectedValues.map((item) => (
            <span key={item.id} className={styles.selectedItem}>
              {item.icon && <img src={item.icon} alt='' className={styles.itemIcon} />}
              <span className={styles.itemLabel}>{item.label}</span>
              {!isOnlyShow && (
                <button
                  className={styles.removeButton}
                  onClick={(e) => handleRemoveOption(item.id, e)}
                  type='button'
                  aria-label={`Удалить ${item.label}`}
                >
                  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M9 3L3 9M3 3L9 9'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {!isOnlyShow && (
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}
          width='12'
          height='8'
          viewBox='0 0 12 8'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M1 1.5L6 6.5L11 1.5'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      )}
    </div>
  )

  // Создаем массив элементов для DropList
  const dropListItems = [
    // Каждая опция - отдельный элемент
    showSearchInput && (
      <input
        type='text'
        placeholder='Поиск категории...'
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          onSetSearchInput?.(e.target.value)
        }}
        className={styles.cat__search}
      />
    ),
    ...options
      .filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((option) => {
        const selected = isSelected(option)
        return (
          <div key={option.id} className={`${styles.optionItem} ${selected ? styles.optionSelected : ''}`}>
            <div
              className={styles.optionContent}
              onClick={(e) => {
                if (isOnlyShow) return // Блокируем клики в режиме только просмотра
                e.stopPropagation()
                handleSelectOption(option)
              }}
              style={isOnlyShow ? {cursor: 'default'} : undefined}
            >
              {option.icon && <img src={option.icon} alt='' className={styles.optionIcon} />}
              <span className={styles.optionLabel}>{option.label}</span>
            </div>

            {!isOnlyShow && (
              <div className={styles.radioWrapper}>
                <RadioButton
                  label=''
                  name={`multiselect-option-${option.id}`}
                  value={`option-${option.id}`}
                  checked={selected}
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleSelectOption(option)
                  }}
                  allowUnchecked={true}
                />
              </div>
            )}
          </div>
        )
      }),

    // Разделитель (только если не в режиме просмотра)
    ...(!isOnlyShow ? [<div style={{pointerEvents: 'none'}} key='divider' className={styles.divider} />] : []),

    // Кнопки действий (только если не в режиме просмотра)
    ...(!isOnlyShow
      ? [
          <div key='actions' className={styles.actions}>
            <button
              type='button'
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation()
                onChange([])
              }}
              disabled={selectedValues.length === 0}
            >
              Очистить все
            </button>
            <button
              type='button'
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              Готово ({selectedValues.length})
            </button>
          </div>
        ]
      : [])
  ]

  if (isOnlyShow) {
    return (
      <div
        style={{cursor: 'default'}}
        className={`${styles.multiDropSelect} ${styles.readOnly} ${disabled ? styles.disabled : ''}`}
      >
        <DropdownTitle />
      </div>
    )
  }

  return (
    <div className={`${styles.multiDropSelect} ${disabled ? styles.disabled : ''}`}>
      <DropList
        extraClass={styles.dropList}
        gap='0'
        extraListClass={styles.dropListContent}
        title={<DropdownTitle />}
        isOpen={isOpen}
        direction={direction}
        onOpenChange={setIsOpen}
        items={dropListItems}
      />
    </div>
  )
}

export default MultiDropSelect
