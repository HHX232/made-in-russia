import {FC, useState, useEffect, useRef, JSX} from 'react'
import styles from './CreateCardProductCategory.module.scss'
import {ICategory} from '@/services/card/card.types'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

interface CreateCardProductCategoryProps {
  initialProductCategory?: ICategory
  onSetCategory: (category: ICategory | null) => void
}

const CreateCardProductCategory: FC<CreateCardProductCategoryProps> = ({initialProductCategory, onSetCategory}) => {
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(initialProductCategory || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const dropdownRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('CreateCardProductCategory')
  const currentLang = useCurrentLanguage()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const categories = await CategoriesService.getAll(currentLang)
        setAllCategories(categories)
        setError(null)
      } catch (err) {
        setError(t('errorLoadingCategoryes'))
        console.error('Error fetching categories:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    onSetCategory(selectedCategory)
  }, [selectedCategory, onSetCategory])

  // Обработчик скролла для закрытия списка (только скролл страницы, не списка)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (isDropdownOpen && dropdownRef.current) {
        // Проверяем, что скролл происходит не внутри нашего дропдауна
        if (!dropdownRef.current.contains(e.target as Node)) {
          setIsDropdownOpen(false)
        }
      }
    }

    if (isDropdownOpen) {
      window.addEventListener('scroll', handleScroll, true)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [isDropdownOpen])

  // Улучшенная функция для проверки, содержит ли категория или её дети искомый текст
  const categoryContainsSearch = (category: Category, searchTerm: string): boolean => {
    if (!searchTerm) return true

    const lowerSearchTerm = searchTerm.toLowerCase()

    // Проверяем саму категорию
    if (category.name.toLowerCase().includes(lowerSearchTerm)) {
      return true
    }

    // Рекурсивно проверяем всех детей
    if (category.children && category.children.length > 0) {
      return category.children.some((child) => categoryContainsSearch(child, searchTerm))
    }

    return false
  }

  // Функция для получения всех путей к категориям, содержащим поисковый запрос
  const getAllMatchingPaths = (categories: Category[], searchTerm: string, currentPath: string[] = []): string[][] => {
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

  // Функция для определения, должна ли категория быть видимой
  const shouldShowCategory = (category: Category, searchTerm: string): boolean => {
    if (!searchTerm) return true
    return categoryContainsSearch(category, searchTerm)
  }

  // Функция для подсчета видимых категорий (для определения наличия результатов)
  const countVisibleCategories = (categories: Category[], searchTerm: string): number => {
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
    if (searchQuery) {
      const allPaths = getAllMatchingPaths(allCategories, searchQuery)
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
  }, [searchQuery, allCategories])

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSelectCategory = (category: Category) => {
    // Всегда выбираем категорию как активную
    setSelectedCategory(category as ICategory)

    // Если у категории есть дети, то переключаем состояние раскрытия
    if (category.children && category.children.length > 0) {
      toggleCategoryExpanded(category.id.toString())
    } else {
      // Если детей нет, закрываем список полностью
      setSearchQuery('')
      setIsDropdownOpen(false)
      setExpandedCategories(new Set())
    }
  }

  const handleRemoveCategory = () => {
    setSelectedCategory(null)
  }

  // Рекурсивная функция для рендеринга категорий с поддержкой глубокого поиска
  const renderCategories = (categories: Category[], level = 0): JSX.Element[] => {
    return categories
      .filter((category) => shouldShowCategory(category, searchQuery))
      .map((category) => {
        const isExpanded = expandedCategories.has(category.id.toString())
        const hasChildren = category.children && category.children.length > 0

        return (
          <div key={category.id} className={styles.cat__categoryGroup}>
            <button
              type='button'
              onClick={() => handleSelectCategory(category)}
              className={`${styles.cat__dropdownItem} ${
                styles[`cat__dropdownItem--level${level}`]
              } ${selectedCategory?.id === category.id ? styles['cat__dropdownItem--selected'] : ''}`}
              style={{paddingLeft: `${12 + level * 20}px`}}
            >
              {level > 0 && <span className={styles.cat__levelIndicator}>{'└'.repeat(level)}</span>}

              {hasChildren && (
                <span className={`${styles.cat__expandIcon} ${isExpanded ? styles['cat__expandIcon--expanded'] : ''}`}>
                  ▶
                </span>
              )}

              {category.imageUrl && (
                <img src={category.imageUrl} alt={category.name} className={styles.cat__dropdownImage} />
              )}

              <span className={styles.cat__dropdownName}>{category.name}</span>

              {selectedCategory?.id === category.id && <span className={styles.cat__checkmark}>✓</span>}
            </button>

            {hasChildren && isExpanded && (
              <div className={styles.cat__childrenContainer}>{renderCategories(category.children!, level + 1)}</div>
            )}
          </div>
        )
      })
  }

  // Функция для рендеринга сообщения "Не найдено"
  const renderNotFound = () => (
    <div className={styles.cat__notFound}>
      <div className={styles.cat__notFoundContent}>
        <span className={styles.cat__notFoundIcon}>🔍</span>
        <span className={styles.cat__notFoundText}>{t('notFoundCategories')}</span>
        <span className={styles.cat__notFoundSubtext}>{t('tryChangeSearch')}</span>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className={styles.cat__box}>
        <div className={styles.cat__loading}>{t('loadingCategories')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.cat__box}>
        <div className={styles.cat__error}>{error}</div>
      </div>
    )
  }

  return (
    <div className={styles.cat__box}>
      <div className={styles.cat__selected}>
        {!selectedCategory ? (
          <p className={styles.cat__empty}>{t('emptyCategory')}</p>
        ) : (
          <div className={styles.cat__selectedItem}>
            {selectedCategory.imageUrl && (
              <img src={selectedCategory.imageUrl} alt={selectedCategory.name} className={styles.cat__image} />
            )}
            <span className={styles.cat__name}>{selectedCategory.name}</span>
            <button
              type='button'
              onClick={handleRemoveCategory}
              className={styles.cat__remove}
              aria-label={'removeCategory'}
            ></button>
          </div>
        )}
      </div>

      <div className={styles.cat__add}>
        <div className={styles.cat__searchWrapper}>
          <input
            type='text'
            id='cy-create-card-product-category-search'
            placeholder={t('foundCategoryProcessing')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            className={styles.cat__search}
          />

          {isDropdownOpen && (
            <>
              <div
                id='cy-create-card-product-category-backdrop-to-open'
                className={styles.cat__backdrop}
                onClick={() => {
                  setIsDropdownOpen(false)
                  setExpandedCategories(new Set())
                }}
              />
              <div ref={dropdownRef} id='cy-create-card-product-category-dropdown' className={styles.cat__dropdown}>
                {allCategories.length === 0 ? (
                  <div className={styles.cat__noResults}>{t('categoryNotFound')}</div>
                ) : searchQuery && countVisibleCategories(allCategories, searchQuery) === 0 ? (
                  renderNotFound()
                ) : (
                  <div className={styles.cat__dropdownList}>{renderCategories(allCategories)}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateCardProductCategory
