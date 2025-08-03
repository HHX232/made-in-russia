import {FC, useState, useEffect} from 'react'
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

  // Функция для получения всех категорий с учетом вложенности
  const flattenCategories = (categories: Category[], level = 0): Array<Category & {level: number}> => {
    const result: Array<Category & {level: number}> = []

    categories.forEach((category) => {
      result.push({...category, level})
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, level + 1))
      }
    })

    return result
  }

  const flattenedCategories = flattenCategories(allCategories)

  const filteredCategories = flattenedCategories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleSelectCategory = (category: Category & {level: number}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {level, ...categoryWithoutLevel} = category
    setSelectedCategory(categoryWithoutLevel as ICategory)
    setSearchQuery('')
    setIsDropdownOpen(false)
  }

  const handleRemoveCategory = () => {
    setSelectedCategory(null)
  }

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
            >
              ×
            </button>
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
                onClick={() => setIsDropdownOpen(false)}
              />
              <div id='cy-create-card-product-category-dropdown' className={styles.cat__dropdown}>
                {filteredCategories.length === 0 ? (
                  <div className={styles.cat__noResults}>{t('categoryNotFound')}</div>
                ) : (
                  <div className={styles.cat__dropdownList}>
                    {filteredCategories.map((category) => (
                      <button
                        id='cy-create-card-product-category-dropdown-item-add'
                        key={category.id}
                        type='button'
                        onClick={() => handleSelectCategory(category)}
                        className={`${styles.cat__dropdownItem} ${
                          styles[`cat__dropdownItem--level${category.level}`]
                        } ${selectedCategory?.id === category.id ? styles['cat__dropdownItem--selected'] : ''}`}
                        style={{paddingLeft: `${12 + category.level * 20}px`}}
                      >
                        {category.level > 0 && (
                          <span className={styles.cat__levelIndicator}>{'└'.repeat(category.level)}</span>
                        )}
                        {category.imageUrl && (
                          <img src={category.imageUrl} alt={category.name} className={styles.cat__dropdownImage} />
                        )}
                        <span className={styles.cat__dropdownName}>{category.name}</span>
                        {selectedCategory?.id === category.id && <span className={styles.cat__checkmark}>✓</span>}
                      </button>
                    ))}
                  </div>
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
