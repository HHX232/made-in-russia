import React, {JSX, useState, useEffect} from 'react'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import styles from './MultiDropSelect.module.scss'

export interface MultiSelectOption {
  id: string | number
  label: string
  value: string
  icon?: string
  children?: MultiSelectOption[]
  imageUrl?: string
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
  isCategories?: boolean
  extraDropListClass?: string
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
  onSetSearchInput,
  isCategories = false,
  extraDropListClass
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // useEffect(() => {
  //   console.log('!=============!')
  //   console.log('CURRENT options', options)
  //   console.log('CURRENT selectedValues', selectedValues)
  //   console.log('!=============!')
  // }, [options, selectedValues])

  // Функция для создания уникального ключа сравнения
  const getComparisonKey = (option: MultiSelectOption): string => {
    return `${option.value?.toLowerCase()}_${option.label?.toLowerCase()}`
  }

  // Функция для поиска категории и получения пути к ней
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const findCategoryPath = (
    categories: MultiSelectOption[],
    searchTerm: string,
    currentPath: string[] = []
  ): string[] => {
    for (const category of categories) {
      const newPath = [...currentPath, category.id.toString()]

      // Если текущая категория соответствует поиску
      if (category.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        return newPath
      }

      // Если есть дети, ищем в них
      if (category.children && category.children.length > 0) {
        const childPath = findCategoryPath(category.children, searchTerm, newPath)
        if (childPath.length > 0) {
          return childPath
        }
      }
    }
    return []
  }

  // Функция для получения всех путей к найденным категориям
  const getAllMatchingPaths = (
    categories: MultiSelectOption[],
    searchTerm: string,
    currentPath: string[] = []
  ): string[][] => {
    const paths: string[][] = []

    for (const category of categories) {
      const newPath = [...currentPath, category.id.toString()]

      // Если текущая категория соответствует поиску
      if (category.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        paths.push(newPath)
      }

      // Если есть дети, ищем в них
      if (category.children && category.children.length > 0) {
        const childPaths = getAllMatchingPaths(category.children, searchTerm, newPath)
        paths.push(...childPaths)
      }
    }
    return paths
  }

  // Функция для проверки, должна ли категория быть видимой при поиске
  const shouldShowCategory = (category: MultiSelectOption, searchTerm: string, currentPath: string[] = []): boolean => {
    if (!searchTerm) return true

    const newPath = [...currentPath, category.id.toString()]

    // Если сама категория подходит под поиск
    if (category.label.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true
    }

    // Если в детях есть подходящие категории
    if (category.children && category.children.length > 0) {
      return category.children.some((child) => shouldShowCategory(child, searchTerm, newPath))
    }

    return false
  }

  // Эффект для автоматического раскрытия категорий при поиске
  useEffect(() => {
    if (searchQuery && isCategories) {
      const allPaths = getAllMatchingPaths(options, searchQuery)
      const categoriesToExpand = new Set<string>()

      // Для каждого найденного пути добавляем все родительские категории для раскрытия
      allPaths.forEach((path) => {
        // Исключаем последний элемент пути (саму найденную категорию)
        for (let i = 0; i < path.length - 1; i++) {
          categoriesToExpand.add(path[i])
        }
      })

      setExpandedCategories(categoriesToExpand)
    }
  }, [searchQuery, isCategories, options])

  // Проверка, выбран ли элемент (исправленная версия)
  const isSelected = (option: MultiSelectOption) => {
    const optionKey = getComparisonKey(option)
    return selectedValues.some((selected) => {
      const selectedKey = getComparisonKey(selected)
      return selectedKey === optionKey
    })
  }

  // Обработчик выбора элемента (исправленная версия)
  const handleSelectOption = (option: MultiSelectOption) => {
    if (isOnlyShow) return

    const optionKey = getComparisonKey(option)
    const isCurrentlySelected = selectedValues.some((selected) => {
      const selectedKey = getComparisonKey(selected)
      return selectedKey === optionKey
    })

    const newSelected = isCurrentlySelected
      ? selectedValues.filter((item) => {
          const itemKey = getComparisonKey(item)
          return itemKey !== optionKey
        })
      : [...selectedValues, option]

    console.log('newSelected', newSelected)
    onChange(newSelected)
  }

  // Обработчик удаления выбранного элемента (исправленная версия)
  const handleRemoveOption = (optionToRemove: MultiSelectOption, e: React.MouseEvent) => {
    if (isOnlyShow) return
    e.stopPropagation()

    const removeKey = getComparisonKey(optionToRemove)
    const newSelected = selectedValues.filter((item) => {
      const itemKey = getComparisonKey(item)
      return itemKey !== removeKey
    })

    onChange(newSelected)
  }

  // Переключение раскрытия категории
  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Обработчик выбора категории
  const handleSelectCategory = (category: MultiSelectOption, e: React.MouseEvent) => {
    if (isOnlyShow) return

    const target = e.target as HTMLElement

    // Если клик был по чекбоксу, не обрабатываем здесь (обработает сам чекбокс)
    if (target.closest(`.${styles.radioWrapper}`)) {
      return
    }

    // Если клик был по стрелке раскрытия, только переключаем раскрытие
    if (target.closest(`.${styles.expandIcon}`)) {
      e.stopPropagation()
      if (category.children && category.children.length > 0) {
        toggleCategoryExpanded(category.id.toString())
      }
      return
    }

    // В остальных случаях выбираем категорию и при необходимости раскрываем
    e.stopPropagation()
    handleSelectOption(category)

    // Если у категории есть дети, также переключаем раскрытие
    if (category.children && category.children.length > 0) {
      toggleCategoryExpanded(category.id.toString())
    }
  }

  // Рекурсивная функция для рендеринга категорий
  const renderCategories = (categories: MultiSelectOption[], level = 0): JSX.Element[] => {
    return categories
      .filter((category) => shouldShowCategory(category, searchQuery))
      .map((category) => {
        const isExpanded = expandedCategories.has(category.id.toString())
        const hasChildren = category.children && category.children.length > 0
        const selected = isSelected(category)

        const categoryElement = (
          <div key={category.id} className={styles.categoryGroup}>
            <div
              className={`${styles.categoryItem} ${
                styles[`categoryItem--level${level}`]
              } ${selected ? styles.categoryItemSelected : ''}`}
              style={{paddingLeft: `${12 + level * 20}px`}}
              onClick={(e) => handleSelectCategory(category, e)}
            >
              {level > 0 && <span className={styles.levelIndicator}>{'└'.repeat(level)}</span>}

              {hasChildren && (
                <span
                  className={`${styles.expandIcon} ${isExpanded ? styles.expandIconExpanded : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCategoryExpanded(category.id.toString())
                  }}
                >
                  ▶
                </span>
              )}

              {(category.imageUrl || category.icon) && (
                <img src={category.imageUrl || category.icon} alt={category.label} className={styles.categoryImage} />
              )}

              <span className={styles.categoryLabel}>{category.label}</span>

              {!isOnlyShow && (
                <div className={styles.radioWrapper}>
                  <RadioButton
                    label=''
                    name={`category-${category.id}`}
                    value={`category-${category.id}`}
                    checked={selected}
                    onChange={() => handleSelectOption(category)}
                    allowUnchecked={true}
                  />
                </div>
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className={styles.childrenContainer}>{renderCategories(category.children!, level + 1)}</div>
            )}
          </div>
        )

        return categoryElement
      })
  }

  // Компонент заголовка дропдауна
  const DropdownTitle = () => (
    <div className={`${styles.dropdownTitle} ${extraClass} ${isOnlyShow ? styles.readOnly : ''}`}>
      {selectedValues.length === 0 ? (
        <span className={styles.placeholder}>{placeholder}</span>
      ) : (
        <div className={styles.selectedItems}>
          {selectedValues.map((item, index) => (
            <span key={`${getComparisonKey(item)}-${index}`} className={styles.selectedItem}>
              {(item.icon || item.imageUrl) && (
                <img src={item.imageUrl || item.icon} alt='' className={styles.itemIcon} />
              )}
              <span className={styles.itemLabel}>{item.label}</span>
              {!isOnlyShow && (
                <button
                  className={styles.removeButton}
                  onClick={(e) => handleRemoveOption(item, e)}
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
    // Поле поиска
    showSearchInput && (
      <input
        key='search-input'
        type='text'
        placeholder={isCategories ? 'Поиск категории...' : 'Поиск...'}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          onSetSearchInput?.(e.target.value)
        }}
        className={styles.cat__search}
      />
    ),

    // Рендерим либо категории, либо обычные опции
    ...(isCategories
      ? renderCategories(options)
      : options
          .filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((option, index) => {
            const selected = isSelected(option)
            return (
              <div
                key={`${getComparisonKey(option)}-${index}`}
                className={`${styles.optionItem} ${selected ? styles.optionSelected : ''}`}
              >
                <div
                  className={styles.optionContent}
                  onClick={(e) => {
                    if (isOnlyShow) return
                    const target = e.target as HTMLElement
                    // Если клик был по чекбоксу, не обрабатываем здесь
                    if (target.closest(`.${styles.radioWrapper}`)) {
                      return
                    }
                    e.stopPropagation()
                    handleSelectOption(option)
                  }}
                  style={isOnlyShow ? {cursor: 'default'} : undefined}
                >
                  {(option.icon || option.imageUrl) && (
                    <img src={option.imageUrl || option.icon} alt='' className={styles.optionIcon} />
                  )}
                  <span className={styles.optionLabel}>{option.label}</span>
                </div>

                {!isOnlyShow && (
                  <div className={styles.radioWrapper}>
                    <RadioButton
                      label=''
                      name={`multiselect-option-${option.id}-${index}`}
                      value={`option-${option.id}-${index}`}
                      checked={selected}
                      onChange={() => handleSelectOption(option)}
                      allowUnchecked={true}
                    />
                  </div>
                )}
              </div>
            )
          })),

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
                if (isCategories) {
                  setExpandedCategories(new Set())
                }
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
        extraListClass={`${styles.dropListContent} ${extraDropListClass}`}
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
