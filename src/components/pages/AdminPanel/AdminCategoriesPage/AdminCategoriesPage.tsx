/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {FC, useState, useRef} from 'react'
import styles from './AdminCategoriesPage.module.scss'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {
  useAllCategoriesLanguages,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from '@/services/categoryes/categoryes.service'
import {SupportedLanguage} from '@/store/multilingualDescriptionsInCard/multilingualDescriptions.types'
import Image from 'next/image'

export interface Category {
  id: number
  slug: string
  name: string
  title?: string
  label?: string
  description?: string
  metaDescription?: string
  imageUrl?: string
  iconUrl?: string | null
  okved: string[] | null
  children: Category[]
  childrenCount: number
  creationDate: string
  lastModificationDate: string
}

// Компонент для загрузки SVG/PNG иконок
const IconUploader: FC<{
  iconUrl: string | null
  onIconChange: (file: File | null) => void
  onIconUrlChange: (url: string | null) => void
  disabled?: boolean
}> = ({iconUrl, onIconChange, onIconUrlChange, disabled}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(iconUrl)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('Selected file:', file)
    console.log('File type:', file.type)
    console.log('File size:', file.size)

    // Проверка типа файла
    if (!['image/svg+xml', 'image/png'].includes(file.type)) {
      alert('Пожалуйста, выберите файл формата SVG или PNG')
      return
    }

    // Проверка размера файла (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB')
      return
    }

    // Создаем preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPreview(result)
      onIconUrlChange(result)
    }
    reader.readAsDataURL(file)

    console.log('Calling onIconChange with file:', file)
    onIconChange(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onIconChange(null)
    onIconUrlChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.icon__uploader}>
      <input
        ref={fileInputRef}
        type='file'
        accept='.svg,.png,image/svg+xml,image/png'
        onChange={handleFileSelect}
        disabled={disabled}
        className={styles.icon__uploader__input}
      />

      {preview ? (
        <div className={styles.icon__uploader__preview}>
          <div className={styles.icon__preview__container}>
            <img src={preview} alt='Icon preview' className={styles.icon__preview__image} />
          </div>
          <div className={styles.icon__preview__actions}>
            <button type='button' onClick={handleClick} disabled={disabled} className={styles.icon__change__button}>
              Изменить
            </button>
            <button type='button' onClick={handleRemove} disabled={disabled} className={styles.icon__remove__button}>
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <button type='button' onClick={handleClick} disabled={disabled} className={styles.icon__uploader__button}>
          <svg className={styles.icon__uploader__icon} viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          <span>Выберите SVG или PNG файл</span>
          <span className={styles.icon__uploader__hint}>Максимальный размер: 2MB</span>
        </button>
      )}
    </div>
  )
}

const AdminCategoriesPage: FC = () => {
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('ru')
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  // TanStack Query hooks
  const categoriesQueries = useAllCategoriesLanguages()
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const getCurrentCategories = (): Category[] => {
    const currentQuery = categoriesQueries[activeLanguage]
    console.log('currentQuery', currentQuery.data)
    return (currentQuery as any).data || []
  }

  const isLoading =
    categoriesQueries.isLoading ||
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending

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
      title: category.title || '',
      label: category.label || '',
      description: category.description || '',
      metaDescription: category.metaDescription || '',
      imageUrl: category.imageUrl,
      iconUrl: category.iconUrl || null,
      children: category.children as any,
      parentId: parentId ?? null,
      okvedString: (category.okved || []).join(', '),
      okvedCategories: category.okved || [],
      initialImageUrl: category.imageUrl,
      initialIconUrl: category.iconUrl || null
    })
    setIsCreating(false)
  }

  const handleCreateCategory = (parentId?: number) => {
    setEditingCategory({
      slug: '',
      name: '',
      title: '',
      label: '',
      description: '',
      metaDescription: '',
      children: [],
      parentId: parentId ?? null,
      okvedString: '',
      okvedCategories: [],
      iconUrl: null
    })
    setIsCreating(true)
  }

  const handleSaveCategory = async () => {
    if (!editingCategory) return

    try {
      const nameTranslations = {en: '', ru: '', zh: '', hi: ''}
      nameTranslations[activeLanguage] = editingCategory.name

      const titleTranslations = {en: '', ru: '', zh: '', hi: ''}
      titleTranslations[activeLanguage] = editingCategory.title || ''

      const labelTranslations = {en: '', ru: '', zh: '', hi: ''}
      labelTranslations[activeLanguage] = editingCategory.label || ''

      const descriptionTranslations = {en: '', ru: '', zh: '', hi: ''}
      descriptionTranslations[activeLanguage] = editingCategory.description || ''

      const metaDescriptionTranslations = {en: '', ru: '', zh: '', hi: ''}
      metaDescriptionTranslations[activeLanguage] = editingCategory.metaDescription || ''

      const okvedCodes = (editingCategory.okvedString || '')
        .split(',')
        .map((code: any) => code.trim())
        .filter((code: any) => code.length > 0)

      let saveImage = true
      let saveIcon = true

      if (!isCreating) {
        if (editingCategory.initialImageUrl && editingCategory.imageUrl === null) {
          saveImage = false
        }

        if (editingCategory.initialIconUrl && editingCategory.iconUrl === null) {
          saveIcon = false
        }
      }

      const payload = {
        name: editingCategory.name,
        title: editingCategory.title || '',
        label: editingCategory.label || '',
        description: editingCategory.description || '',
        metaDescription: editingCategory.metaDescription || '',
        slug: editingCategory.slug.replace(/^(l[1-5]_)+/, ''),
        parentId: editingCategory.parentId || null,
        nameTranslations,
        titleTranslations,
        labelTranslations,
        descriptionTranslations,
        metaDescriptionTranslations,
        okvedCategories: okvedCodes,
        image: editingCategory.image || '',
        icon: editingCategory.icon || '',
        saveImage,
        saveIcon
      }

      console.log('payload save', payload)

      if (isCreating) {
        await createCategoryMutation.mutateAsync(payload)
        alert('Категория создана успешно!')
      } else if (editingCategory.id) {
        await updateCategoryMutation.mutateAsync({
          ...payload,
          id: editingCategory.id
        })
        alert('Категория обновлена успешно!')
      }

      setEditingCategory(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Ошибка при сохранении категории')
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

    try {
      await deleteCategoryMutation.mutateAsync(categoryId)
      alert('Категория удалена успешно!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Ошибка при удалении категории')
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setIsCreating(false)
  }

  const handleOkvedChange = (value: string) => {
    if (!editingCategory) return

    setEditingCategory({
      ...editingCategory,
      okvedString: value
    })
  }

  const getLanguageName = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'ru':
        return 'Русский'
      case 'en':
        return 'English'
      case 'zh':
        return '中文'
      case 'hi':
        return 'हिन्दी'
      default:
        return lang
    }
  }

  const renderCategory = (category: Category, level: number = 0, parentId?: number) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0

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
              aria-label={isExpanded ? 'Свернуть категорию' : 'Развернуть категорию'}
            >
              ▶
            </button>
          )}

          {category.imageUrl && <img src={category.imageUrl} alt={category.name} className={styles.category__image} />}

          <div className={styles.category__info}>
            <span className={styles.category__name}>{category.name}</span>
            {category.title && <span className={styles.category__title}>Заголовок: {category.title}</span>}
            {category.label && <span className={styles.category__label}>Метка: {category.label}</span>}
            <span className={styles.category__slug}>/{category.slug}</span>
            {category.description && (
              <div className={styles.category__description}>
                {category.description.length > 100
                  ? `${category.description.substring(0, 100)}...`
                  : category.description}
              </div>
            )}
            {category.metaDescription && (
              <div className={styles.category__meta__description}>
                Meta:{' '}
                {category.metaDescription.length > 100
                  ? `${category.metaDescription.substring(0, 100)}...`
                  : category.metaDescription}
              </div>
            )}
            {category.okved && category.okved.length > 0 && (
              <div style={{fontSize: '13px'}} className={styles.category__okved}>
                ТН ВЭД: {category.okved.join(', ')}
              </div>
            )}
            {category.iconUrl && (
              <div
                style={{backgroundColor: '#000000', maxWidth: 'fit-content'}}
                className={styles.category__icon__info}
              >
                <Image
                  src={category.iconUrl}
                  alt='Category icon'
                  className={styles.category__icon__preview}
                  crossOrigin='anonymous'
                  unoptimized
                  width={15}
                  height={15}
                />
              </div>
            )}
          </div>

          <div className={styles.category__actions}>
            <button
              className={styles.edit__button}
              onClick={() => handleEditCategory(category, parentId)}
              disabled={isLoading}
            >
              Редактировать
            </button>
            <button
              className={styles.add__button}
              onClick={() => handleCreateCategory(category.id)}
              disabled={isLoading}
            >
              Добавить подкатегорию
            </button>
            <button
              className={styles.delete__button}
              onClick={() => handleDeleteCategory(category.id)}
              disabled={isLoading}
            >
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

    const okvedValue = editingCategory.okvedString || ''

    return (
      <div className={styles.edit__form__overlay}>
        <div className={styles.edit__form}>
          <h3 className={styles.form__title}>{isCreating ? 'Создание категории' : 'Редактирование категории'}</h3>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Название категории (name)</label>
            <TextInputUI
              currentValue={editingCategory.name}
              placeholder='Введите название категории'
              onSetValue={(value) => setEditingCategory({...editingCategory, name: value})}
              theme='superWhite'
              extraClass={styles.form__input}
            />
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Заголовок (title)</label>
            <TextInputUI
              currentValue={editingCategory.title}
              placeholder='Введите заголовок категории'
              onSetValue={(value) => setEditingCategory({...editingCategory, title: value})}
              theme='superWhite'
              extraClass={styles.form__input}
            />
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Метка (label)</label>
            <TextInputUI
              currentValue={editingCategory.label}
              placeholder='Введите метку категории'
              onSetValue={(value) => setEditingCategory({...editingCategory, label: value})}
              theme='superWhite'
              extraClass={styles.form__input}
            />
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Описание (description)</label>
            <textarea
              value={editingCategory.description}
              placeholder='Введите описание категории'
              onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
              className={styles.form__textarea}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Мета-описание (metaDescription)</label>
            <textarea
              value={editingCategory.metaDescription}
              placeholder='Введите мета-описание для SEO'
              onChange={(e) => setEditingCategory({...editingCategory, metaDescription: e.target.value})}
              className={styles.form__textarea}
              rows={3}
              disabled={isLoading}
            />
            {/* <span className={styles.form__hint}>{editingCategory.metaDescription?.length || 0} </span> */}
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

          <div className={styles.form__field}>
            <label className={styles.form__label}>Код ТН ВЭД (через запятую)</label>
            <TextInputUI
              inputType='text'
              currentValue={okvedValue}
              onSetValue={(e) => handleOkvedChange(e)}
              placeholder='Введите код ТН ВЭД через запятую (например: 01.11, 01.12, 47.19)'
              theme='superWhite'
              disabled={isLoading}
            />
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Изображение категории (горизонтальное)</label>
            <CreateImagesInput
              extraClass={styles.admin__categories__page__images}
              maxFiles={1}
              inputIdPrefix='category'
              onActiveImagesChange={(images) => {
                console.log('CreateImagesInput onActiveImagesChange:', images)
                if (images.length > 0) {
                  setEditingCategory((prev: any) => ({...prev, imageUrl: images[0]}))
                } else {
                  setEditingCategory((prev: any) => ({...prev, imageUrl: null}))
                }
              }}
              activeImages={editingCategory.imageUrl ? [editingCategory.imageUrl] : []}
              onFilesChange={(files) => {
                console.log('CreateImagesInput onFilesChange:', files)
                if (files.length > 0) {
                  setEditingCategory((prev: any) => ({...prev, image: files[0]}))
                } else {
                  setEditingCategory((prev: any) => ({...prev, image: undefined}))
                }
              }}
            />
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Иконка категории (SVG или PNG)</label>
            <IconUploader
              iconUrl={editingCategory.iconUrl}
              onIconChange={(file) => {
                console.log('IconUploader onIconChange called with:', file)
                setEditingCategory((prev: any) => {
                  console.log('Previous editingCategory:', prev)
                  const updated = {...prev, icon: file}
                  console.log('Updated editingCategory:', updated)
                  return updated
                })
              }}
              onIconUrlChange={(url) => {
                console.log('IconUploader onIconUrlChange called with:', url)
                setEditingCategory((prev: any) => ({...prev, iconUrl: url}))
              }}
              disabled={isLoading}
            />
          </div>

          <div className={styles.form__actions}>
            <button
              className={styles.save__button}
              onClick={handleSaveCategory}
              disabled={isLoading || !editingCategory.name || !editingCategory.slug}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button className={styles.cancel__button} onClick={handleCancelEdit} disabled={isLoading}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading and error states
  if (categoriesQueries.isLoading && !editingCategory) {
    return <div className={styles.loading}>Загрузка категорий...</div>
  }

  if (categoriesQueries.isError) {
    return (
      <div className={styles.error}>
        <p>Ошибка при загрузке категорий: {categoriesQueries.error?.message}</p>
        <button onClick={() => window.location.reload()}>Перезагрузить</button>
      </div>
    )
  }

  return (
    <div className={styles.admin__categories__page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление категориями</h1>

        <div className={styles.language__switcher}>
          <button
            className={`${styles.language__button} ${activeLanguage === 'ru' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('ru')}
            disabled={isLoading}
          >
            Русский
          </button>
          <button
            className={`${styles.language__button} ${activeLanguage === 'en' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('en')}
            disabled={isLoading}
          >
            English
          </button>
          <button
            className={`${styles.language__button} ${activeLanguage === 'zh' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('zh')}
            disabled={isLoading}
          >
            中文
          </button>
          <button
            className={`${styles.language__button} ${activeLanguage === 'hi' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('hi')}
            disabled={isLoading}
          >
            हिन्दी
          </button>
        </div>

        <button className={styles.add__main__button} onClick={() => handleCreateCategory()} disabled={isLoading}>
          Добавить категорию
        </button>
      </div>

      <div className={styles.categories__content}>
        <div className={styles.current__language}>
          Редактирование категорий: <span className={styles.language__name}>{getLanguageName(activeLanguage)}</span>
        </div>

        <div className={styles.categories__list}>
          {getCurrentCategories().map((category) => renderCategory(category))}
        </div>

        {getCurrentCategories().length === 0 && !categoriesQueries.isLoading && (
          <div className={styles.empty__state}>
            <p>Категории не найдены</p>
            <button className={styles.add__first__button} onClick={() => handleCreateCategory()} disabled={isLoading}>
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
