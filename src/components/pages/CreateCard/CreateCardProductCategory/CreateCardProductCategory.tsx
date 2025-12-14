import {FC, useState, useEffect, useRef, JSX} from 'react'
import styles from './CreateCardProductCategory.module.scss'
import {ICategory} from '@/services/card/card.types'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import Image from 'next/image'

interface CreateCardProductCategoryProps {
  initialProductCategory?: ICategory
  onSetCategory: (category: ICategory | null) => void
  errorValue?: string // Новый проп для ошибки
  haveError?: boolean // Булево значение для состояния ошибки
}

const CreateCardProductCategory: FC<CreateCardProductCategoryProps> = ({
  initialProductCategory,
  onSetCategory,
  errorValue = '',
  haveError = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(initialProductCategory || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showError, setShowError] = useState(false) // Локальное состояние для отображения ошибки

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('CreateCardProductCategory')
  const currentLang = useCurrentLanguage()

  // Обработка показа ошибки
  useEffect(() => {
    if ((haveError || errorValue) && !selectedCategory) {
      setShowError(true)
    } else {
      setShowError(false)
    }
  }, [haveError, errorValue, selectedCategory])

  useEffect(() => {
    console.log('allCategories', allCategories)
  }, [allCategories])

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

  useEffect(() => {
    const handleScroll = () => {
      if (isDropdownOpen && searchWrapperRef.current) {
        const rect = searchWrapperRef.current.getBoundingClientRect()
        const isOutOfView = rect.bottom < 0 || rect.top > window.innerHeight

        if (isOutOfView) {
          setIsDropdownOpen(false)
          if (inputRef.current) {
            inputRef.current.blur()
          }
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

  const categoryContainsSearch = (category: Category, searchTerm: string): boolean => {
    if (!searchTerm) return true

    const lowerSearchTerm = searchTerm.toLowerCase()

    if (category.name.toLowerCase().includes(lowerSearchTerm)) {
      return true
    }

    if (category.okved && category.okved.length > 0) {
      const okvedMatch = category.okved.some((code) => code.toLowerCase().includes(lowerSearchTerm))
      if (okvedMatch) {
        return true
      }
    }

    if (category.children && category.children.length > 0) {
      return category.children.some((child) => categoryContainsSearch(child, searchTerm))
    }

    return false
  }

  const getAllMatchingPaths = (categories: Category[], searchTerm: string, currentPath: string[] = []): string[][] => {
    const paths: string[][] = []

    for (const category of categories) {
      const newPath = [...currentPath, category.id.toString()]

      if (categoryContainsSearch(category, searchTerm)) {
        paths.push(newPath)

        if (category.children && category.children.length > 0) {
          const childPaths = getAllMatchingPaths(category.children, searchTerm, newPath)
          paths.push(...childPaths)
        }
      }
    }
    return paths
  }

  const shouldShowCategory = (category: Category, searchTerm: string): boolean => {
    if (!searchTerm) return true
    return categoryContainsSearch(category, searchTerm)
  }

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

  useEffect(() => {
    if (searchQuery) {
      const allPaths = getAllMatchingPaths(allCategories, searchQuery)
      const categoriesToExpand = new Set<string>()

      allPaths.forEach((path) => {
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
    setSelectedCategory(category as ICategory)
    // Скрываем ошибку при выборе категории
    setShowError(false)

    if (category.children && category.children.length > 0) {
      toggleCategoryExpanded(category.id.toString())
    } else {
      setSearchQuery('')
      setIsDropdownOpen(false)
      setExpandedCategories(new Set())
    }
  }

  const handleRemoveCategory = () => {
    setSelectedCategory(null)
  }

  const handleSelectedAreaClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
      setIsDropdownOpen(true)
    }
  }

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
                <Image
                  width={35}
                  height={35}
                  src={category.imageUrl}
                  alt={category.name}
                  className={styles.cat__dropdownImage}
                />
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
      <div
        className={`${styles.cat__selected} ${showError ? styles.cat__selected__error : ''}`}
        onClick={handleSelectedAreaClick}
        style={{cursor: 'pointer'}}
      >
        {!selectedCategory ? (
          <p className={`${styles.cat__empty} ${showError ? styles.cat__empty__error : ''}`}>
            {showError && errorValue ? errorValue : t('emptyCategory')}
          </p>
        ) : (
          <div className={styles.cat__selectedItem}>
            {selectedCategory.imageUrl && (
              <Image
                width={35}
                height={35}
                src={selectedCategory.imageUrl}
                alt={selectedCategory.name}
                className={styles.cat__image}
              />
            )}
            <span className={styles.cat__name}>{selectedCategory.name}</span>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveCategory()
              }}
              className={styles.cat__remove}
              aria-label={'removeCategory'}
            ></button>
          </div>
        )}
      </div>

      {/* {showError && errorValue && <p className={styles.cat__errorMessage}>{errorValue}</p>} */}

      <div className={styles.cat__add}>
        <div ref={searchWrapperRef} className={styles.cat__searchWrapper}>
          <input
            ref={inputRef}
            type='text'
            id='cy-create-card-product-category-search'
            placeholder={t('foundCategoryProcessing')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            className={`${styles.cat__search} ${showError ? styles.cat__search__error : ''}`}
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
