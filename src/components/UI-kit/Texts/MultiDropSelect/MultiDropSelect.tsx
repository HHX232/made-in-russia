import React, {JSX, useState, useEffect} from 'react'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import styles from './MultiDropSelect.module.scss'
import {useTranslations} from 'next-intl'
import Image from 'next/image'

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
  useNewTheme?: boolean
  useNewThemeTransparent?: boolean
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
  extraDropListClass,
  useNewThemeTransparent = false,
  useNewTheme = true
}) => {
  const t = useTranslations('multiDrop')
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // useEffect(() => {
  //   console.log('optionsss', options)
  // }, [options])

  // Функция для создания уникального ключа сравнения
  const getComparisonKey = (option: MultiSelectOption): string => {
    return `${option.value?.toLowerCase()}_${option.label?.toLowerCase()}`
  }

  // Улучшенная функция для проверки, содержит ли категория или её дети искомый текст
  const categoryContainsSearch = (category: MultiSelectOption, searchTerm: string): boolean => {
    if (!searchTerm) return true

    const lowerSearchTerm = searchTerm.toLowerCase()

    // Проверяем саму категорию
    if (category.label.toLowerCase().includes(lowerSearchTerm)) {
      return true
    }

    // Рекурсивно проверяем всех детей
    if (category.children && category.children.length > 0) {
      return category.children.some((child) => categoryContainsSearch(child, searchTerm))
    }

    return false
  }

  // Функция для получения всех путей к категориям, содержащим поисковый запрос
  const getAllMatchingPaths = (
    categories: MultiSelectOption[],
    searchTerm: string,
    currentPath: string[] = []
  ): string[][] => {
    const paths: string[][] = []

    for (const category of categories) {
      const newPath = [...currentPath, category.id.toString()]

      // Если текущая категория или её дети содержат поисковый запрос
      if (categoryContainsSearch(category, searchTerm)) {
        // Добавляем путь к текущей категории
        paths.push(newPath)

        // Если есть дети, ищем в них рекурсивно
        if (category.children && category.children.length > 0) {
          const childPaths = getAllMatchingPaths(category.children, searchTerm, newPath)
          paths.push(...childPaths)
        }
      }
    }
    return paths
  }

  // Улучшенная функция для определения, должна ли категория быть видимой
  const shouldShowCategory = (category: MultiSelectOption, searchTerm: string): boolean => {
    if (!searchTerm) return true

    // Используем улучшенную функцию проверки
    return categoryContainsSearch(category, searchTerm)
  }

  // Функция для подсчета видимых категорий (для определения наличия результатов)
  const countVisibleCategories = (categories: MultiSelectOption[], searchTerm: string): number => {
    if (!searchTerm) return categories.length

    let count = 0
    for (const category of categories) {
      if (shouldShowCategory(category, searchTerm)) {
        count++
      }
    }
    return count
  }

  // Эффект для автоматического раскрытия категорий при поиске
  useEffect(() => {
    if (searchQuery && isCategories) {
      const allPaths = getAllMatchingPaths(options, searchQuery)
      const categoriesToExpand = new Set<string>()

      // Для каждого найденного пути добавляем все категории для раскрытия
      allPaths.forEach((path) => {
        // Добавляем все элементы пути для раскрытия (включая родительские)
        path.forEach((categoryId) => {
          categoriesToExpand.add(categoryId)
        })
      })

      setExpandedCategories(categoriesToExpand)
    }
  }, [searchQuery, isCategories, options])

  // Проверка, выбран ли элемент
  const isSelected = (option: MultiSelectOption) => {
    const optionKey = getComparisonKey(option)
    return selectedValues.some((selected) => {
      const selectedKey = getComparisonKey(selected)
      return selectedKey === optionKey
    })
  }

  // Обработчик выбора элемента
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

  // Обработчик удаления выбранного элемента
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

    // Если клик был по чекбоксу, не обрабатываем здесь
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
                <Image
                  width={35}
                  height={35}
                  src={category.imageUrl || category.icon || ''}
                  alt={category.label || ''}
                  className={styles.categoryImage}
                />
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
  // Полный компонент DropdownTitle с учётом useNewTheme
  const DropdownTitle: React.FC = () => (
    <div
      className={`
      ${styles.dropdownTitle}
      ${extraClass}
      ${isOnlyShow ? styles.readOnly : ''}
      ${useNewTheme ? styles.newThemeTitle : ''}
      ${useNewThemeTransparent ? styles.newThemeTitleTransparent : ''}
    `}
      onClick={() => !isOnlyShow && setIsOpen(!isOpen)}
    >
      {selectedValues.length === 0 ? (
        <span className={styles.placeholder}>{placeholder}</span>
      ) : (
        <div
          className={`
          ${styles.selectedItems}
          ${useNewTheme ? styles.newThemeItems : ''}
        `}
        >
          {selectedValues.map((item, index) => (
            <span
              key={`${getComparisonKey(item)}-${index}`}
              className={`
              ${styles.selectedItem}
              ${useNewTheme ? styles.newThemeSelectedItem : ''}
            `}
            >
              {(item.icon || item.imageUrl) && (
                <Image
                  width={35}
                  height={35}
                  src={item.imageUrl || item.icon || ''}
                  alt={item.label}
                  className={styles.itemIcon}
                />
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
                      stroke='#FFFFFF'
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

  // Функция для рендеринга сообщения "Не найдено"
  const renderNotFound = () => (
    <div key='not-found' className={styles.notFound}>
      <div className={styles.notFoundContent}>
        <span className={styles.notFoundIcon}>🔍</span>
        <span className={styles.notFoundText}>{isCategories ? t('notFoundCategories') : t('notFoundItems')}</span>
        <span className={styles.notFoundSubtext}>{t('tryChangeSearch')}</span>
      </div>
    </div>
  )

  // Создаем массив элементов для DropList
  const dropListItems = [
    // Поле поиска
    showSearchInput && (
      <input
        key='search-input'
        type='text'
        placeholder={isCategories ? t('searchCategories') : t('searchItems')}
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
      ? (() => {
          const visibleCount = countVisibleCategories(options, searchQuery)
          if (searchQuery && visibleCount === 0) {
            return [renderNotFound()]
          }
          return renderCategories(options)
        })()
      : (() => {
          const filteredOptions = options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
          )

          if (searchQuery && filteredOptions.length === 0) {
            return [renderNotFound()]
          }

          return filteredOptions.map((option, index) => {
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
                    if (target.closest(`.${styles.radioWrapper}`)) {
                      return
                    }
                    e.stopPropagation()
                    handleSelectOption(option)
                  }}
                  style={isOnlyShow ? {cursor: 'default'} : undefined}
                >
                  {(option.icon || option.imageUrl) && (
                    <Image
                      width={35}
                      height={35}
                      src={option.imageUrl || option.icon || ''}
                      alt=''
                      className={styles.optionIcon}
                    />
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
          })
        })()),

    // Разделитель и кнопки (только если не в режиме просмотра и есть результаты)
    ...(!isOnlyShow &&
    (isCategories
      ? countVisibleCategories(options, searchQuery) > 0 || !searchQuery
      : options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ||
        !searchQuery)
      ? [
          // <div style={{pointerEvents: 'none'}} key='divider' className={styles.divider} />,
          // <div key='actions' className={styles.actions}>
          //   <button
          //     type='button'
          //     className={styles.actionButton}
          //     onClick={(e) => {
          //       e.stopPropagation()
          //       onChange([])
          //       if (isCategories) {
          //         setExpandedCategories(new Set())
          //       }
          //     }}
          //     disabled={selectedValues.length === 0}
          //   >
          //     {t('clearAll')}
          //   </button>
          //   <button
          //     type='button'
          //     className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
          //     onClick={(e) => {
          //       e.stopPropagation()
          //       setIsOpen(false)
          //     }}
          //   >
          //     {t('ready')} ({selectedValues.length})
          //   </button>
          // </div>
        ]
      : [])
  ]

  if (isOnlyShow) {
    return (
      <div
        style={{cursor: 'default'}}
        className={`${styles.multiDropSelect} ${styles.readOnly} ${isOnlyShow && styles.onlyShow} ${disabled ? styles.disabled : ''}`}
      >
        <DropdownTitle />
      </div>
    )
  }

  return (
    <div className={`${styles.multiDropSelect} ${isOnlyShow && styles.onlyShow} ${disabled ? styles.disabled : ''} `}>
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
