'use client'
import {useEffect, useState} from 'react'
import styles from './AdminAds.module.scss'
import instance from '@/api/api.interceptor'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {toast} from 'sonner'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'

interface AdTranslations {
  ru?: string
  en?: string
  zh?: string
}

interface AdData {
  id: number
  title: string
  subtitle: string
  imageUrl: string
  creationDate: string
  lastModificationDate: string
  titleTranslations?: AdTranslations
  subtitleTranslations?: AdTranslations
}

interface AdFormData {
  title: string
  titleTranslations: AdTranslations
  subtitle: string
  subtitleTranslations: AdTranslations
  uploadedFiles?: File[]
  activeImages?: string[]
}

const AdminAds = () => {
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLanguage, setActiveLanguage] = useState<'ru' | 'en' | 'zh'>('ru')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAd, setEditingAd] = useState<number | null>(null)
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    titleTranslations: {},
    subtitle: '',
    subtitleTranslations: {},
    uploadedFiles: [],
    activeImages: []
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await instance.get<any>('/advertisements')
      setAds(response?.data)
    } catch (error) {
      console.error('Error fetching ads:', error)
      toast.error('Ошибка при загрузке объявлений')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      titleTranslations: {},
      subtitle: '',
      subtitleTranslations: {},
      uploadedFiles: [],
      activeImages: []
    })
    setErrors({})
    setEditingAd(null)
    setShowCreateForm(false)
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен'
    }

    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'Подзаголовок обязателен'
    }

    if (!editingAd && (!formData.uploadedFiles || formData.uploadedFiles.length === 0)) {
      newErrors.uploadedFiles = 'Необходимо загрузить изображение'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateAd = async () => {
    if (!validateForm()) return

    const loadingToast = toast.loading('Создание объявления...')
    try {
      const formDataToSend = new FormData()

      // Добавляем основные поля
      formDataToSend.append('title', formData.title)
      formDataToSend.append('subtitle', formData.subtitle)

      // Добавляем переводы
      formDataToSend.append('titleTranslations', JSON.stringify(formData.titleTranslations))
      formDataToSend.append('subtitleTranslations', JSON.stringify(formData.subtitleTranslations))

      // Добавляем изображения
      if (formData.uploadedFiles) {
        formData.uploadedFiles.forEach((file) => {
          formDataToSend.append('images', file)
        })
      }

      await instance.post('/advertisements', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.dismiss(loadingToast)
      toast.success('Объявление успешно создано')
      resetForm()
      fetchAds()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error creating ad:', error)
      toast.error('Ошибка при создании объявления')
    }
  }

  const handleUpdateAd = async () => {
    if (!validateForm() || !editingAd) return

    const loadingToast = toast.loading('Обновление объявления...')
    try {
      const updateData = {
        title: formData.title,
        titleTranslations: formData.titleTranslations,
        subtitle: formData.subtitle,
        subtitleTranslations: formData.subtitleTranslations
      }

      await instance.put(`/advertisements/${editingAd}`, updateData)

      toast.dismiss(loadingToast)
      toast.success('Объявление успешно обновлено')
      resetForm()
      fetchAds()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error updating ad:', error)
      toast.error('Ошибка при обновлении объявления')
    }
  }

  const handleDeleteAd = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return

    const loadingToast = toast.loading('Удаление объявления...')
    try {
      await instance.delete(`/advertisements/${id}`)
      toast.dismiss(loadingToast)
      toast.success('Объявление успешно удалено')
      fetchAds()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error deleting ad:', error)
      toast.error('Ошибка при удалении объявления')
    }
  }

  const handleEditAd = (ad: AdData) => {
    setEditingAd(ad.id)
    setFormData({
      title: ad.title,
      titleTranslations: ad.titleTranslations || {},
      subtitle: ad.subtitle,
      subtitleTranslations: ad.subtitleTranslations || {},
      activeImages: [ad.imageUrl],
      uploadedFiles: []
    })
    setShowCreateForm(true)
  }

  const handleUploadedFilesChange = (files: File[]) => {
    setFormData((prev) => ({...prev, uploadedFiles: files}))
    if (errors.uploadedFiles) {
      setErrors((prev) => ({...prev, uploadedFiles: ''}))
    }
  }

  const handleActiveImagesChange = (images: string[]) => {
    setFormData((prev) => ({...prev, activeImages: images}))
  }

  const getTranslatedTitle = (ad: AdData): string => {
    const translations = ad.titleTranslations || {}
    return translations[activeLanguage] || ad.title
  }

  const getTranslatedSubtitle = (ad: AdData): string => {
    const translations = ad.subtitleTranslations || {}
    return translations[activeLanguage] || ad.subtitle
  }

  const filteredAds = ads.filter((ad) => {
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    const title = getTranslatedTitle(ad).toLowerCase()
    const subtitle = getTranslatedSubtitle(ad).toLowerCase()

    return title.includes(searchLower) || subtitle.includes(searchLower)
  })

  const updateTranslation = (field: 'titleTranslations' | 'subtitleTranslations', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLanguage]: value
      }
    }))
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка объявлений...</div>
  }

  return (
    <div className={styles.container__ads}>
      <div className={styles.header}>
        <div className={styles.title__section}>
          <h1 className={styles.title}>Управление рекламными объявлениями</h1>
          <p style={{marginTop: '15px'}}>Всего объявлений: {ads.length}</p>
        </div>

        <div className={styles.controls__section}>
          <div className={styles.search__container}>
            <TextInputUI
              currentValue={searchTerm}
              placeholder='Поиск по объявлениям...'
              onSetValue={setSearchTerm}
              theme='superWhite'
              extraClass={styles.search__input}
            />
          </div>

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

          <button className={styles.create__button} onClick={() => setShowCreateForm(true)}>
            + Создать объявление
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className={styles.create__form}>
          <div className={styles.form__header}>
            <h2 className={styles.form__title}>{editingAd ? 'Редактирование объявления' : 'Создание объявления'}</h2>
            <button className={styles.close__button} onClick={resetForm}>
              ✕
            </button>
          </div>

          <div className={styles.form__content}>
            <div className={styles.form__section}>
              <h3 className={styles.section__title}>Основная информация</h3>

              <div className={styles.input__group}>
                <label className={styles.input__label}>Заголовок (основной)</label>
                <TextInputUI
                  currentValue={formData.title}
                  placeholder='Введите заголовок'
                  onSetValue={(value) => setFormData((prev) => ({...prev, title: value}))}
                  theme='superWhite'
                  extraClass={styles.form__input}
                />
                {errors.title && <span className={styles.error__text}>{errors.title}</span>}
              </div>

              <div className={styles.input__group}>
                <label className={styles.input__label}>Подзаголовок (основной)</label>
                <TextInputUI
                  currentValue={formData.subtitle}
                  placeholder='Введите подзаголовок'
                  onSetValue={(value) => setFormData((prev) => ({...prev, subtitle: value}))}
                  theme='superWhite'
                  extraClass={styles.form__input}
                />
                {errors.subtitle && <span className={styles.error__text}>{errors.subtitle}</span>}
              </div>
            </div>

            <div className={styles.form__section}>
              <h3 className={styles.section__title}>
                Переводы ({activeLanguage === 'ru' ? 'Русский' : activeLanguage === 'en' ? 'English' : '中文'})
              </h3>

              <div className={styles.input__group}>
                <label className={styles.input__label}>Заголовок на {activeLanguage}</label>
                <TextInputUI
                  currentValue={formData.titleTranslations[activeLanguage] || ''}
                  placeholder={`Введите заголовок на ${activeLanguage}`}
                  onSetValue={(value) => updateTranslation('titleTranslations', value)}
                  theme='superWhite'
                  extraClass={styles.form__input}
                />
              </div>

              <div className={styles.input__group}>
                <label className={styles.input__label}>Подзаголовок на {activeLanguage}</label>
                <TextInputUI
                  currentValue={formData.subtitleTranslations[activeLanguage] || ''}
                  placeholder={`Введите подзаголовок на ${activeLanguage}`}
                  onSetValue={(value) => updateTranslation('subtitleTranslations', value)}
                  theme='superWhite'
                  extraClass={styles.form__input}
                />
              </div>
            </div>

            {!editingAd && (
              <div className={styles.form__section}>
                <h3 className={styles.section__title}>Изображение</h3>
                <CreateImagesInput
                  onFilesChange={handleUploadedFilesChange}
                  onActiveImagesChange={handleActiveImagesChange}
                  activeImages={formData.activeImages || []}
                  maxFiles={1}
                  minFiles={1}
                  allowMultipleFiles={false}
                  errorValue={errors.uploadedFiles}
                  setErrorValue={(value: string) => setErrors((prev) => ({...prev, uploadedFiles: value}))}
                  inputIdPrefix='ad-image'
                />
              </div>
            )}

            <div className={styles.form__actions}>
              <button className={styles.submit__button} onClick={editingAd ? handleUpdateAd : handleCreateAd}>
                {editingAd ? 'Обновить' : 'Создать'}
              </button>
              <button className={styles.cancel__button} onClick={resetForm}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.ads__content}>
        <div className={styles.content__header}>
          <div className={styles.current__language}>
            Просмотр на:{' '}
            <span className={styles.language__name}>
              {activeLanguage === 'ru' ? 'Русском' : activeLanguage === 'en' ? 'English' : '中文'}
            </span>
          </div>
          <div className={styles.ads__count}>
            Найдено: {filteredAds.length} из {ads.length}
          </div>
        </div>

        <div className={styles.ads__grid}>
          {filteredAds.map((ad) => (
            <div key={ad.id} className={styles.ad__card}>
              <div className={styles.ad__image}>
                <img src={ad.imageUrl} alt={getTranslatedTitle(ad)} />
              </div>

              <div className={styles.ad__content}>
                <h3 className={styles.ad__title}>{getTranslatedTitle(ad)}</h3>
                <p className={styles.ad__subtitle}>{getTranslatedSubtitle(ad)}</p>

                <div className={styles.ad__meta}>
                  <div className={styles.ad__dates}>
                    <span>Создано: {new Date(ad.creationDate).toLocaleDateString('ru-RU')}</span>
                    <span>Изменено: {new Date(ad.lastModificationDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>

              <div className={styles.ad__actions}>
                <button className={styles.edit__button} onClick={() => handleEditAd(ad)} title='Редактировать'>
                  ✏️
                </button>
                <button className={styles.delete__button} onClick={() => handleDeleteAd(ad.id)} title='Удалить'>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAds.length === 0 && (
          <div className={styles.empty__state}>
            <div className={styles.empty__icon}>📢</div>
            <div className={styles.empty__message}>{searchTerm ? 'Объявления не найдены' : 'Пока нет объявлений'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAds
