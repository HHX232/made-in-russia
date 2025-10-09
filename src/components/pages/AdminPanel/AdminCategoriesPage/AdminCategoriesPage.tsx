/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {FC, useState} from 'react'
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

export interface Category {
  id: number
  slug: string
  name: string
  imageUrl?: string
  okved: string[] | null
  children: Category[]
  childrenCount: number
  creationDate: string
  lastModificationDate: string
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
    return (currentQuery as any).data || []
  }

  const isLoading =
    categoriesQueries.isLoading ||
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending

  // Валидация формата ОКВЭД кодов
  // const validateOkvedCode = (code: string): boolean => {
  //   // ОКВЭД коды имеют формат XX.XX или XX.XX.X или XX.XX.XX
  //   const okvedPattern = /^\d{2}\.\d{2}(\.\d{1,2})?$/
  //   return okvedPattern.test(code)
  // }

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
      children: category.children as any,
      parentId: parentId ?? null,
      okvedString: (category.okved || []).join(', '), // Сохраняем как строку
      okvedCategories: category.okved || []
    })
    setIsCreating(false)
  }

  const handleCreateCategory = (parentId?: number) => {
    setEditingCategory({
      slug: '',
      name: '',
      children: [],
      parentId: parentId ?? null,
      okvedString: '', // Пустая строка для нового элемента
      okvedCategories: []
    })
    setIsCreating(true)
  }

  const handleSaveCategory = async () => {
    if (!editingCategory) return

    try {
      const nameTranslations = {en: '', ru: '', zh: ''}
      nameTranslations[activeLanguage] = editingCategory.name

      // Разделяем строку ОКВЭД на массив только при сохранении
      const okvedCodes = (editingCategory.okvedString || '')
        .split(',')
        .map((code: any) => code.trim())
        .filter((code: any) => code.length > 0)

      // const invalidOkvedCodes = okvedCodes.filter((code: any) => !validateOkvedCode(code))

      // if (invalidOkvedCodes.length > 0) {
      //   alert(
      //     `Неверный формат ОКВЭД кодов: ${invalidOkvedCodes.join(', ')}\nФормат должен быть: XX.XX или XX.XX.X или XX.XX.XX`
      //   )
      //   return
      // }

      const payload = {
        name: editingCategory.name,
        slug: editingCategory.slug.replace(/^(l[1-5]_)+/, ''),
        parentId: editingCategory.parentId || null,
        nameTranslations,
        okvedCategories: okvedCodes,
        image: editingCategory.image ? editingCategory.image : ''
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

    // Просто сохраняем строку как есть, без разделения
    setEditingCategory({
      ...editingCategory,
      okvedString: value
    })
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
            <span className={styles.category__slug}>/{category.slug}</span>
            {category.okved && category.okved.length > 0 && (
              <div style={{fontSize: '13px'}} className={styles.category__okved}>
                ОКВЭД: {category.okved.join(', ')}
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

          <div className={styles.form__field}>
            <label className={styles.form__label}>
              ОКВЭД коды (через запятую)
              {/* <span className={styles.form__hint}>Формат: XX.XX или XX.XX.X (например: 01.11, 47.19, 01.13.2)</span> */}
            </label>

            {/* Использование обычного input вместо TextInputUI для ОКВЭД */}
            <TextInputUI
              inputType='text'
              currentValue={okvedValue}
              onSetValue={(e) => handleOkvedChange(e)}
              placeholder='Введите ОКВЭД коды через запятую (например: 01.11, 01.12, 47.19)'
              // className={`${styles.form__input} ${styles.okved__input}`}
              theme='superWhite'
              disabled={isLoading}
            />

            {/* {okvedValue.trim() && (
              <div className={styles.okved__preview}>
                Превью кодов:{' '}
                {okvedValue.split(',').map((code: any, index: any) => {
                  const trimmedCode = code.trim()
                  if (!trimmedCode) return null

                  return (
                    <span
                      key={index}
                      className={`${styles.okved__code} ${validateOkvedCode(trimmedCode) ? styles.valid : styles.invalid}`}
                    >
                      {trimmedCode}
                    </span>
                  )
                })}
              </div>
            )} */}
          </div>

          <div className={styles.form__field}>
            <label className={styles.form__label}>Изображение категории (горизонтальное)</label>
            <CreateImagesInput
              extraClass={styles.admin__categories__page__images}
              maxFiles={1}
              inputIdPrefix='category'
              onActiveImagesChange={(images) => {
                if (images.length > 0) {
                  setEditingCategory({...editingCategory, imageUrl: images[0]})
                } else {
                  setEditingCategory({...editingCategory, imageUrl: undefined})
                }
              }}
              activeImages={editingCategory.imageUrl ? [editingCategory.imageUrl] : []}
              onFilesChange={(files) => {
                if (files.length > 0) {
                  setEditingCategory({...editingCategory, image: files[0]})
                } else {
                  setEditingCategory({...editingCategory, image: undefined})
                }
              }}
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
        </div>

        <button className={styles.add__main__button} onClick={() => handleCreateCategory()} disabled={isLoading}>
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

// import {FC, useEffect, useState} from 'react'
// import styles from './AdminCategoriesPage.module.scss'
// import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
// import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
// import instance from '@/api/api.interceptor'
// import {getAccessToken} from '@/services/auth/auth.helper'

// export interface Category {
//   id: number
//   slug: string
//   name: string
//   imageUrl?: string
//   children: Category[]
//   creationDate: string
//   lastModificationDate: string
//   okvedCategories: string[]
// }

// interface EditingCategory {
//   id?: number
//   slug: string
//   name: string
//   imageUrl?: string
//   children: Category[]
//   parentId?: number | null
//   image?: File
//   okvedCategories?: string[]
// }

// const AdminCategoriesPage: FC = () => {
//   const [categoriesRu, setCategoriesRu] = useState<Category[]>([])
//   const [categoriesEn, setCategoriesEn] = useState<Category[]>([])
//   const [categoriesZh, setCategoriesZh] = useState<Category[]>([])

//   const [activeLanguage, setActiveLanguage] = useState<'ru' | 'en' | 'zh'>('ru')
//   const [loading, setLoading] = useState(true)
//   const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
//   const [isCreating, setIsCreating] = useState(false)
//   const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const [categoriesRussian, categoriesEnglish, categoriesChinese] = await Promise.all([
//           instance.get('/categories?lang=ru'),
//           instance.get('/categories?lang=en'),
//           instance.get('/categories?lang=zh')
//         ])
//         setCategoriesRu(categoriesRussian.data as Category[])
//         setCategoriesEn(categoriesEnglish.data as Category[])
//         setCategoriesZh(categoriesChinese.data as Category[])
//       } catch (error) {
//         console.error('Error fetching categories:', error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchCategories()
//   }, [])

//   const getCurrentCategories = (): Category[] => {
//     switch (activeLanguage) {
//       case 'ru':
//         return categoriesRu
//       case 'en':
//         return categoriesEn
//       case 'zh':
//         return categoriesZh
//       default:
//         return categoriesRu
//     }
//   }

//   const setCurrentCategories = (categories: Category[]) => {
//     switch (activeLanguage) {
//       case 'ru':
//         setCategoriesRu(categories)
//         break
//       case 'en':
//         setCategoriesEn(categories)
//         break
//       case 'zh':
//         setCategoriesZh(categories)
//         break
//     }
//   }

//   const toggleCategoryExpansion = (categoryId: number) => {
//     const newExpanded = new Set(expandedCategories)
//     if (newExpanded.has(categoryId)) {
//       newExpanded.delete(categoryId)
//     } else {
//       newExpanded.add(categoryId)
//     }
//     setExpandedCategories(newExpanded)
//   }

//   const handleEditCategory = (category: Category, parentId?: number) => {
//     setEditingCategory({
//       id: category.id,
//       slug: category.slug,
//       name: category.name,
//       imageUrl: category.imageUrl,
//       children: category.children,
//       parentId: parentId ?? null,
//       okvedCategories: category.okvedCategories || []
//     })
//     setIsCreating(false)
//   }

//   const handleCreateCategory = (parentId?: number) => {
//     setEditingCategory({
//       slug: '',
//       name: '',
//       children: [],
//       parentId: parentId ?? null,
//       okvedCategories: []
//     })
//     setIsCreating(true)
//   }

//   const handleSaveCategory = async () => {
//     if (!editingCategory) return

//     try {
//       setLoading(true)

//       const token = getAccessToken()
//       if (!token) {
//         alert('Ошибка авторизации, пожалуйста, войдите снова')
//         setLoading(false)
//         return
//       }

//       const formData = new FormData()

//       const nameTranslations = {en: '', ru: '', zh: ''}
//       nameTranslations[activeLanguage] = editingCategory.name

//       const dataPayload = {
//         name: editingCategory.name,
//         slug: editingCategory.slug.replace(/^(l[1-5]_)+/, ''),
//         parentId: editingCategory.parentId || null,
//         nameTranslations, // Заполняем только для активного языка
//         okvedCategories: editingCategory.okvedCategories || []
//       }

//       // Оборачиваем JSON в Blob и добавляем в formData
//       const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
//       formData.append('data', jsonBlob)

//       // Если выбран файл (изображение) - добавляем как бинарник
//       if (editingCategory.image) {
//         formData.append('image', editingCategory.image)
//       }

//       const url = isCreating
//         ? `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/categories`
//         : `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/categories/${editingCategory.id}`
//       const method = isCreating ? 'POST' : 'PUT'

//       const response = await fetch(url, {
//         method,
//         headers: {
//           Authorization: `Bearer ${token}`
//           // НЕ ставим Content-Type — браузер выставит multipart/form-data с подходящими границами
//         },
//         body: formData
//       })

//       if (!response.ok) {
//         const errorText = await response.text()
//         throw new Error(`Ошибка ${response.status}: ${errorText}`)
//       }

//       alert(isCreating ? 'Категория создана успешно!' : 'Категория обновлена успешно!')

//       setEditingCategory(null)
//       setIsCreating(false)

//       // Перезагружаем категории после сохранения
//       setLoading(true)
//       const [categoriesRussian, categoriesEnglish, categoriesChinese] = await Promise.all([
//         instance.get('/categories?lang=ru'),
//         instance.get('/categories?lang=en'),
//         instance.get('/categories?lang=zh')
//       ])
//       setCategoriesRu(categoriesRussian.data as Category[])
//       setCategoriesEn(categoriesEnglish.data as Category[])
//       setCategoriesZh(categoriesChinese.data as Category[])
//     } catch (error) {
//       console.error('Error saving category:', error)
//       alert('Ошибка при сохранении категории')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDeleteCategory = async (categoryId: number) => {
//     if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

//     try {
//       setLoading(true)
//       await instance.delete(`/categories/${categoryId}`)
//       alert('Категория удалена успешно!')

//       // Убираем из локального стейта после удаления
//       setCurrentCategories(getCurrentCategories().filter((cat) => cat.id !== categoryId))
//     } catch (error) {
//       console.error('Error deleting category:', error)
//       alert('Ошибка при удалении категории')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCancelEdit = () => {
//     setEditingCategory(null)
//     setIsCreating(false)
//   }

//   const renderCategory = (category: Category, level: number = 0, parentId?: number) => {
//     const isExpanded = expandedCategories.has(category.id)
//     const hasChildren = category.children && category.children.length > 0
//     const isFirstLevel = level === 0

//     return (
//       <div key={category.id} className={styles.category__item}>
//         <div
//           className={`${styles.category__header} ${styles[`level__${level}`]}`}
//           style={{paddingLeft: `${level * 20}px`}}
//         >
//           {hasChildren && (
//             <button
//               className={`${styles.expand__button} ${isExpanded ? styles.expanded : ''}`}
//               onClick={() => toggleCategoryExpansion(category.id)}
//               aria-label={isExpanded ? 'Свернуть категорию' : 'Развернуть категорию'}
//             >
//               ▶
//             </button>
//           )}

//           {isFirstLevel && category.imageUrl && (
//             <img src={category.imageUrl} alt={category.name} className={styles.category__image} />
//           )}

//           <div className={styles.category__info}>
//             <span className={styles.category__name}>{category.name}</span>
//             <span className={styles.category__slug}>/{category.slug}</span>
//             {category.okvedCategories && category.okvedCategories.length > 0 && (
//               <div className={styles.category__okved}>ОКВЭД: {category.okvedCategories.join(', ')}</div>
//             )}
//           </div>

//           <div className={styles.category__actions}>
//             <button className={styles.edit__button} onClick={() => handleEditCategory(category, parentId)}>
//               Редактировать
//             </button>
//             <button className={styles.add__button} onClick={() => handleCreateCategory(category.id)}>
//               Добавить подкатегорию
//             </button>
//             <button className={styles.delete__button} onClick={() => handleDeleteCategory(category.id)}>
//               Удалить
//             </button>
//           </div>
//         </div>

//         {hasChildren && isExpanded && (
//           <div className={styles.category__children}>
//             {category.children.map((child) => renderCategory(child, level + 1, category.id))}
//           </div>
//         )}
//       </div>
//     )
//   }

//   const renderEditForm = () => {
//     if (!editingCategory) return null

//     const isFirstLevel = !editingCategory.parentId

//     return (
//       <div className={styles.edit__form__overlay}>
//         <div className={styles.edit__form}>
//           <h3 className={styles.form__title}>{isCreating ? 'Создание категории' : 'Редактирование категории'}</h3>

//           <div className={styles.form__field}>
//             <label className={styles.form__label}>Название категории</label>
//             <TextInputUI
//               currentValue={editingCategory.name}
//               placeholder='Введите название категории'
//               onSetValue={(value) => setEditingCategory({...editingCategory, name: value})}
//               theme='superWhite'
//               extraClass={styles.form__input}
//             />
//           </div>

//           <div className={styles.form__field}>
//             <label className={styles.form__label}>Slug (URL)</label>
//             <TextInputUI
//               currentValue={editingCategory.slug}
//               placeholder='Введите slug категории'
//               onSetValue={(value) => setEditingCategory({...editingCategory, slug: value})}
//               theme='superWhite'
//               extraClass={styles.form__input}
//             />
//           </div>

//           <div className={styles.form__field}>
//             <label className={styles.form__label}>OKVED коды (через точку)</label>
//             <TextInputUI
//               currentValue={(editingCategory.okvedCategories || []).join('. ')}
//               placeholder='Введите OKVED коды через точку'
//               onSetValue={(value) =>
//                 setEditingCategory({
//                   ...editingCategory,
//                   okvedCategories: value
//                     .split('.')
//                     .map((s) => s.trim())
//                     .filter(Boolean)
//                 })
//               }
//               theme='superWhite'
//               extraClass={styles.form__input}
//             />
//           </div>

//           {isFirstLevel && (
//             <div className={styles.form__field}>
//               <label className={styles.form__label}>Изображение категории (горизонтальное)</label>
//               <CreateImagesInput
//                 extraClass={styles.admin__categories__page__images}
//                 maxFiles={1}
//                 inputIdPrefix='category'
//                 onActiveImagesChange={(images) => {
//                   if (images.length > 0) {
//                     setEditingCategory({...editingCategory, imageUrl: images[0]})
//                   } else {
//                     setEditingCategory({...editingCategory, imageUrl: undefined})
//                   }
//                 }}
//                 activeImages={editingCategory.imageUrl ? [editingCategory.imageUrl] : []}
//                 onFilesChange={(files) => {
//                   if (files.length > 0) {
//                     setEditingCategory({...editingCategory, image: files[0]})
//                   } else {
//                     setEditingCategory({...editingCategory, image: undefined})
//                   }
//                 }}
//               />
//             </div>
//           )}

//           <div className={styles.form__actions}>
//             <button
//               className={styles.save__button}
//               onClick={handleSaveCategory}
//               disabled={loading || !editingCategory.name || !editingCategory.slug}
//             >
//               {loading ? 'Сохранение...' : 'Сохранить'}
//             </button>
//             <button className={styles.cancel__button} onClick={handleCancelEdit}>
//               Отмена
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (loading && !editingCategory) {
//     return <div className={styles.loading}>Загрузка категорий...</div>
//   }

//   return (
//     <div className={styles.admin__categories__page}>
//       <div className={styles.header}>
//         <h1 className={styles.title}>Управление категориями</h1>

//         <div className={styles.language__switcher}>
//           <button
//             className={`${styles.language__button} ${activeLanguage === 'ru' ? styles.active : ''}`}
//             onClick={() => setActiveLanguage('ru')}
//           >
//             Русский
//           </button>
//           <button
//             className={`${styles.language__button} ${activeLanguage === 'en' ? styles.active : ''}`}
//             onClick={() => setActiveLanguage('en')}
//           >
//             English
//           </button>
//           <button
//             className={`${styles.language__button} ${activeLanguage === 'zh' ? styles.active : ''}`}
//             onClick={() => setActiveLanguage('zh')}
//           >
//             中文
//           </button>
//         </div>

//         <button className={styles.add__main__button} onClick={() => handleCreateCategory()}>
//           Добавить категорию
//         </button>
//       </div>

//       <div className={styles.categories__content}>
//         <div className={styles.current__language}>
//           Редактирование категорий:{' '}
//           <span className={styles.language__name}>
//             {activeLanguage === 'ru' ? 'Русский' : activeLanguage === 'en' ? 'English' : '中文'}
//           </span>
//         </div>

//         <div className={styles.categories__list}>
//           {getCurrentCategories().map((category) => renderCategory(category))}
//         </div>

//         {getCurrentCategories().length === 0 && (
//           <div className={styles.empty__state}>
//             <p>Категории не найдены</p>
//             <button className={styles.add__first__button} onClick={() => handleCreateCategory()}>
//               Создать первую категорию
//             </button>
//           </div>
//         )}
//       </div>

//       {renderEditForm()}
//     </div>
//   )
// }

// export default AdminCategoriesPage
