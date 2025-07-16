'use client'
import {FC, useEffect, useState} from 'react'
import styles from './AdminCategoriesPage.module.scss'
import CategoriesService from '@/services/categoryes/categoryes.service'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'

export interface Category {
  id: number
  slug: string
  name: string
  imageUrl?: string
  children: Category[]
  creationDate: string
  lastModificationDate: string
}

interface EditingCategory {
  id?: number
  slug: string
  name: string
  imageUrl?: string
  children: Category[]
  parentId?: number
  image?: File
}

const AdminCategoriesPage: FC = () => {
  const [categoriesRu, setCategoriesRu] = useState<Category[]>([])
  const [categoriesEn, setCategoriesEn] = useState<Category[]>([])
  const [categoriesZh, setCategoriesZh] = useState<Category[]>([])
  const [activeLanguage, setActiveLanguage] = useState<'ru' | 'en' | 'zh'>('ru')
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRussion = await CategoriesService.getAll('ru')
        const categoriesEnglish = await CategoriesService.getAll('en')
        const categoriesChinese = await CategoriesService.getAll('zh')

        setCategoriesRu(categoriesRussion)
        setCategoriesEn(categoriesEnglish)
        setCategoriesZh(categoriesChinese)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const getCurrentCategories = () => {
    switch (activeLanguage) {
      case 'ru':
        return categoriesRu
      case 'en':
        return categoriesEn
      case 'zh':
        return categoriesZh
      default:
        return categoriesRu
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setCurrentCategories = (categories: Category[]) => {
    switch (activeLanguage) {
      case 'ru':
        setCategoriesRu(categories)
        break
      case 'en':
        setCategoriesEn(categories)
        break
      case 'zh':
        setCategoriesZh(categories)
        break
    }
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleEditCategory = (category: Category, parentId?: number) => {
    setEditingCategory({
      id: category.id,
      slug: category.slug,
      name: category.name,
      imageUrl: category.imageUrl,
      children: category.children,
      parentId
    })
    setIsCreating(false)
  }

  const handleCreateCategory = (parentId?: number) => {
    setEditingCategory({
      slug: '',
      name: '',
      children: [],
      parentId
    })
    setIsCreating(true)
  }

  const handleSaveCategory = async () => {
    if (!editingCategory) return

    try {
      setLoading(true)
      // Здесь должен быть API вызов для сохранения/создания категории
      console.log('Saving category:', editingCategory)

      // Имитация API вызова
      if (isCreating) {
        alert('Категория создана успешно!')
      } else {
        alert('Категория обновлена успешно!')
      }

      setEditingCategory(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Ошибка при сохранении категории')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

    try {
      setLoading(true)
      // Здесь должен быть API вызов для удаления категории
      console.log('Deleting category:', categoryId)
      alert('Категория удалена успешно!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Ошибка при удалении категории')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setIsCreating(false)
  }

  const renderCategory = (category: Category, level: number = 0, parentId?: number) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0
    const isFirstLevel = level === 0

    return (
      <div key={category.id} className={styles.category__item}>
        <div
          className={`${styles.category__header} ${styles[`level__${level}`]}`}
          style={{paddingLeft: `${level * 20}px`}}
        >
          {hasChildren && (
            <button
              className={`${styles.expand__button} ${isExpanded ? styles.expanded : ''}`}
              onClick={() => toggleCategoryExpansion(category.id)}
            >
              ▶
            </button>
          )}

          {isFirstLevel && category.imageUrl && (
            <img src={category.imageUrl} alt={category.name} className={styles.category__image} />
          )}

          <div className={styles.category__info}>
            <span className={styles.category__name}>{category.name}</span>
            <span className={styles.category__slug}>/{category.slug}</span>
          </div>

          <div className={styles.category__actions}>
            <button className={styles.edit__button} onClick={() => handleEditCategory(category, parentId)}>
              Редактировать
            </button>
            <button className={styles.add__button} onClick={() => handleCreateCategory(category.id)}>
              Добавить подкатегорию
            </button>
            <button className={styles.delete__button} onClick={() => handleDeleteCategory(category.id)}>
              Удалить
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={styles.category__children}>
            {category.children.map((child) => renderCategory(child, level + 1, category.id))}
          </div>
        )}
      </div>
    )
  }

  const renderEditForm = () => {
    if (!editingCategory) return null

    const isFirstLevel = !editingCategory.parentId

    return (
      <div className={styles.edit__form__overlay}>
        <div className={styles.edit__form}>
          <h3 className={styles.form__title}>{isCreating ? 'Создание категории' : 'Редактирование категории'}</h3>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Название категории</label>
            <TextInputUI
              currentValue={editingCategory.name}
              placeholder='Введите название категории'
              onSetValue={(value) => setEditingCategory({...editingCategory, name: value})}
              theme='superWhite'
              extraClass={styles.form__input}
            />
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Slug (URL)</label>
            <TextInputUI
              currentValue={editingCategory.slug}
              placeholder='Введите slug категории'
              onSetValue={(value) => setEditingCategory({...editingCategory, slug: value})}
              theme='superWhite'
              extraClass={styles.form__input}
            />
          </div>

          {isFirstLevel && (
            <div className={styles.form__field}>
              <label className={styles.form__label}>Изображение категории (горизонтальное)</label>
              <CreateImagesInput
                extraClass={styles.admin__categories__page__images}
                maxFiles={1}
                inputIdPrefix='category'
                onActiveImagesChange={(images) => {
                  if (images.length > 0) {
                    setEditingCategory({...editingCategory, imageUrl: images[0]})
                  }
                }}
                activeImages={editingCategory.imageUrl ? [editingCategory.imageUrl] : []}
                onFilesChange={(files) => {
                  if (files.length > 0) {
                    setEditingCategory({...editingCategory, image: files[0]})
                  }
                }}
              />
            </div>
          )}

          <div className={styles.form__actions}>
            <button
              className={styles.save__button}
              onClick={handleSaveCategory}
              disabled={loading || !editingCategory.name || !editingCategory.slug}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button className={styles.cancel__button} onClick={handleCancelEdit}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !editingCategory) {
    return <div className={styles.loading}>Загрузка категорий...</div>
  }

  return (
    <div className={styles.admin__categories__page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление категориями</h1>

        <div className={styles.language__switcher}>
          <button
            className={`${styles.language__button} ${activeLanguage === 'ru' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('ru')}
          >
            Русский
          </button>
          <button
            className={`${styles.language__button} ${activeLanguage === 'en' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('en')}
          >
            English
          </button>
          <button
            className={`${styles.language__button} ${activeLanguage === 'zh' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('zh')}
          >
            中文
          </button>
        </div>

        <button className={styles.add__main__button} onClick={() => handleCreateCategory()}>
          Добавить категорию
        </button>
      </div>

      <div className={styles.categories__content}>
        <div className={styles.current__language}>
          Редактирование категорий:{' '}
          <span className={styles.language__name}>
            {activeLanguage === 'ru' ? 'Русский' : activeLanguage === 'en' ? 'English' : '中文'}
          </span>
        </div>

        <div className={styles.categories__list}>
          {getCurrentCategories().map((category) => renderCategory(category))}
        </div>

        {getCurrentCategories().length === 0 && (
          <div className={styles.empty__state}>
            <p>Категории не найдены</p>
            <button className={styles.add__first__button} onClick={() => handleCreateCategory()}>
              Создать первую категорию
            </button>
          </div>
        )}
      </div>

      {renderEditForm()}
    </div>
  )
}

export default AdminCategoriesPage
