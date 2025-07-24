/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {useEffect, useState} from 'react'
import {usePathname} from 'next/navigation'
import styles from './AdminAds.module.scss'
import instance from '@/api/api.interceptor'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {toast} from 'sonner'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import {getAccessToken} from '@/services/auth/auth.helper'
import Calendar from '@/components/UI-kit/inputs/Calendar/Calendar'

// Define possible languages
type Language = 'ru' | 'en' | 'zh'

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
  thirdText?: string // New field
  expiresAt?: string // New field for time to live (date string)
  isBig?: boolean // New field for important ads
  titleTranslations?: AdTranslations
  subtitleTranslations?: AdTranslations
  thirdTextTranslations?: AdTranslations // New field for translations
}

interface AdFormData {
  title: string // Main title for display/default
  titleTranslations: AdTranslations
  subtitle: string // Main subtitle for display/default
  subtitleTranslations: AdTranslations
  thirdText: string // Main third text for display/default
  thirdTextTranslations: AdTranslations // New field for translations
  expiresAt?: string // New field for time to live (date string)
  isBig: boolean // New field for important ads
  uploadedFiles?: File[]
  activeImages?: string[]
}

const AdminAds = () => {
  const pathname = usePathname()
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLanguage, setActiveLanguage] = useState<Language>('ru') // Controls which translation is shown/edited in the main form inputs
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAd, setEditingAd] = useState<number | null>(null)
  const [showOnlyImportant, setShowOnlyImportant] = useState(false)
  const [formData, setFormData] = useState<AdFormData>({
    title: '', // This will be dynamically set by translations
    titleTranslations: {ru: '', en: '', zh: ''}, // Initialize all translation fields
    subtitle: '', // This will be dynamically set by translations
    subtitleTranslations: {ru: '', en: '', zh: ''}, // Initialize all translation fields
    thirdText: '', // This will be dynamically set by translations
    thirdTextTranslations: {ru: '', en: '', zh: ''}, // New field for translations
    expiresAt: '', // New field
    isBig: false, // New field for important ads
    uploadedFiles: [],
    activeImages: []
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Extract language from pathname
  const getCurrentLanguage = (): Language => {
    const pathSegments = pathname.split('/')
    const langFromPath = pathSegments[1] as Language
    return ['ru', 'en', 'zh'].includes(langFromPath) ? langFromPath : 'ru'
  }

  const currentLanguage = getCurrentLanguage()

  useEffect(() => {
    setActiveLanguage(currentLanguage)
    fetchAds()
  }, [currentLanguage])

  const fetchAds = async () => {
    try {
      const response = await instance.get<AdData[]>('/advertisements', {
        headers: {
          'x-language': currentLanguage,
          'Accept-Language': currentLanguage
        }
      })
      setAds(response.data)
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
      titleTranslations: {ru: '', en: '', zh: ''},
      subtitle: '',
      subtitleTranslations: {ru: '', en: '', zh: ''},
      thirdText: '',
      thirdTextTranslations: {ru: '', en: '', zh: ''},
      expiresAt: '',
      isBig: false,
      uploadedFiles: [],
      activeImages: []
    })
    setErrors({})
    setEditingAd(null)
    setShowCreateForm(false)
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    // Validation for required fields, using current language as the primary language for mandatory fields
    if (!formData.titleTranslations[currentLanguage]?.trim()) {
      newErrors.title = `Заголовок на ${getLanguageName(currentLanguage)} обязателен`
    }

    if (!formData.subtitleTranslations[currentLanguage]?.trim()) {
      newErrors.subtitle = `Подзаголовок на ${getLanguageName(currentLanguage)} обязателен`
    }

    // Validate expiration date format and future date
    if (formData.expiresAt) {
      const expirationDate = new Date(formData.expiresAt)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison

      if (isNaN(expirationDate.getTime())) {
        newErrors.expiresAt = 'Некорректный формат даты'
      } else if (expirationDate < today) {
        newErrors.expiresAt = 'Дата истечения не может быть в прошлом'
      }
    }

    // thirdText is optional, so no direct validation for its presence unless required

    if (!editingAd && (!formData.uploadedFiles || formData.uploadedFiles.length === 0)) {
      newErrors.uploadedFiles = 'Необходимо загрузить изображение'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return ''
    // Convert YYYY-MM-DD to ISO format with time
    const date = new Date(dateString + 'T12:00:00.000Z')
    return date.toISOString()
  }

  const handleCreateAd = async () => {
    if (!validateForm()) return

    const loadingToast = toast.loading('Создание объявления...')
    try {
      // Get access token
      const token = await getAccessToken()

      const formDataToSend = new FormData()

      // Prepare the data object - use current language as main, others can be empty
      const dataPayload = {
        title: formData.titleTranslations[currentLanguage] || '', // Use current language as main
        subtitle: formData.subtitleTranslations[currentLanguage] || '', // Use current language as main
        thirdText: formData.thirdTextTranslations[currentLanguage] || '', // Use current language as main
        expirationDate: formData.expiresAt ? formatDateForAPI(formData.expiresAt) : null, // Format date for API
        isBig: formData.isBig, // Include isBig field
        titleTranslations: formData.titleTranslations,
        subtitleTranslations: formData.subtitleTranslations,
        thirdTextTranslations: formData.thirdTextTranslations
      }

      // ИСПРАВЛЕНИЕ: Создаем Blob для JSON данных с правильным типом содержимого
      const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
      formDataToSend.append('data', jsonBlob)

      // Append image file(s) - отправляем как бинарный файл
      if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
        // Отправляем файл как бинарный тип, не как строку
        formDataToSend.append('image', formData.uploadedFiles[0])
      } else {
        // Handle case where no image is uploaded but is required
        if (!editingAd) {
          // If creating, image is required
          toast.error('Изображение обязательно для создания объявления')
          toast.dismiss(loadingToast)
          return
        }
      }

      // Отправка через обычный fetch с токеном авторизации
      const response = await fetch('https://exporteru-prorumble.amvera.io/api/v1/advertisements', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // НЕ устанавливаем Content-Type, браузер сам установит правильный тип для FormData
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
      }

      const result = await response.json()
      console.log(result)
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
      // Get access token
      const token = await getAccessToken()

      const formDataToSend = new FormData()

      // Prepare the data object - use current language as main
      const dataPayload = {
        title: formData.titleTranslations[currentLanguage] || '', // Use current language as main
        titleTranslations: formData.titleTranslations,
        subtitle: formData.subtitleTranslations[currentLanguage] || '', // Use current language as main
        subtitleTranslations: formData.subtitleTranslations,
        thirdText: formData.thirdTextTranslations[currentLanguage] || '', // Use current language as main
        thirdTextTranslations: formData.thirdTextTranslations,
        expirationDate: formData.expiresAt ? formatDateForAPI(formData.expiresAt) : null, // Format date for API
        isBig: formData.isBig // Include isBig field
      }

      // ИСПРАВЛЕНИЕ: Создаем Blob для JSON данных с правильным типом содержимого
      const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
      formDataToSend.append('data', jsonBlob)

      // Append image file if new image is uploaded
      if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
        // Отправляем файл как бинарный тип
        formDataToSend.append('image', formData.uploadedFiles[0])
      }

      // Отправка через обычный fetch с токеном авторизации
      const response = await fetch(`https://exporteru-prorumble.amvera.io/api/v1/advertisements/${editingAd}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
          // НЕ устанавливаем Content-Type, браузер сам установит правильный тип для FormData
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
      }

      const result = await response.json()
      console.log(result)
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

    // Convert ISO date back to YYYY-MM-DD format for the input
    let expiresAtFormatted = ''
    if (ad.expiresAt) {
      const date = new Date(ad.expiresAt)
      if (!isNaN(date.getTime())) {
        expiresAtFormatted = date.toISOString().split('T')[0] // Get YYYY-MM-DD part
      }
    }

    setFormData({
      title: ad.title, // These are placeholder, actual values from translations
      titleTranslations: ad.titleTranslations || {ru: '', en: '', zh: ''},
      subtitle: ad.subtitle,
      subtitleTranslations: ad.subtitleTranslations || {ru: '', en: '', zh: ''},
      thirdText: ad.thirdText || '', // Populate new field
      thirdTextTranslations: ad.thirdTextTranslations || {ru: '', en: '', zh: ''}, // Populate new translations
      expiresAt: expiresAtFormatted, // Populate formatted date
      isBig: ad.isBig || false, // Populate isBig field
      activeImages: ad.imageUrl ? [ad.imageUrl] : [],
      uploadedFiles: [] // Clear uploaded files on edit, user must re-upload if needed
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

  // Helper functions to get translated texts based on activeLanguage
  const getTranslatedText = (ad: AdData, field: 'title' | 'subtitle' | 'thirdText'): string => {
    const translations = (ad as any)[`${field}Translations`] || {}
    return translations[activeLanguage] || (ad as any)[field] || ''
  }

  const filteredAds = ads.filter((ad) => {
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      const title = getTranslatedText(ad, 'title').toLowerCase()
      const subtitle = getTranslatedText(ad, 'subtitle').toLowerCase()
      const thirdText = getTranslatedText(ad, 'thirdText').toLowerCase()

      const matchesSearch =
        title.includes(searchLower) || subtitle.includes(searchLower) || thirdText.includes(searchLower)
      if (!matchesSearch) return false
    }

    // Filter by important status
    if (showOnlyImportant && !ad.isBig) {
      return false
    }

    return true
  })

  // Function to update a specific translation field for a given language
  const updateTranslationField = (
    field: 'titleTranslations' | 'subtitleTranslations' | 'thirdTextTranslations',
    lang: Language,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }))
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка объявлений...</div>
  }

  const getLanguageName = (lang: Language) => {
    switch (lang) {
      case 'ru':
        return 'Русский'
      case 'en':
        return 'English'
      case 'zh':
        return '中文'
      default:
        return ''
    }
  }

  const isFieldRequired = (lang: Language) => {
    return lang === currentLanguage
  }

  // Check if ad is expired
  const isAdExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    return expirationDate < now
  }

  return (
    <div className={styles.container__ads}>
      <div className={styles.header}>
        <div className={styles.title__section}>
          <h1 className={styles.title}>Управление рекламными объявлениями</h1>
          <p style={{marginTop: '15px'}}>
            Всего объявлений: {ads.length} | Важных: {ads.filter((ad) => ad.isBig).length} | Текущий язык:{' '}
            <strong>{getLanguageName(currentLanguage)}</strong>
          </p>
        </div>

        <div className={styles.controls__section}>
          <div className={styles.search__container}>
            <TextInputUI
              currentValue={searchTerm}
              placeholder='Поиск по объявлениям...'
              onSetValue={setSearchTerm}
              theme='superWhite' // Keep this theme if it suits your general light design
            />
          </div>

          <div className={styles.filter__controls}>
            <span className={styles.filter__label}>Фильтры:</span>
            <button
              className={`${styles.filter__button} ${showOnlyImportant ? styles.active : ''}`}
              onClick={() => setShowOnlyImportant(!showOnlyImportant)}
            >
              ⭐ Только важные
            </button>
          </div>

          <div className={styles.language__switcher}>
            {(['ru', 'en', 'zh'] as Language[]).map((lang) => (
              <button
                key={lang}
                className={`${styles.language__button} ${activeLanguage === lang ? styles.active : ''}`}
                onClick={() => setActiveLanguage(lang)}
              >
                {getLanguageName(lang)}
                {lang === currentLanguage && <span className={styles.primary__indicator}>★</span>}
              </button>
            ))}
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
            {/* Show current language first, then others */}
            {[currentLanguage, ...(['ru', 'en', 'zh'] as Language[]).filter((lang) => lang !== currentLanguage)].map(
              (lang) => (
                <div key={`translation-section-${lang}`} className={styles.form__section}>
                  <h3 className={styles.section__title}>
                    Переводы ({getLanguageName(lang)})
                    {lang === currentLanguage && <span className={styles.required__indicator}> (Обязательно)</span>}
                    {lang !== currentLanguage && <span className={styles.optional__indicator}> (Необязательно)</span>}
                  </h3>

                  <div className={styles.input__group}>
                    <label className={styles.input__label}>
                      Заголовок на {getLanguageName(lang)}
                      {isFieldRequired(lang) && <span className={styles.required__asterisk}>*</span>}
                    </label>
                    <TextInputUI
                      currentValue={formData.titleTranslations[lang] || ''}
                      placeholder={`Введите заголовок на ${getLanguageName(lang)}${isFieldRequired(lang) ? ' (обязательно)' : ''}`}
                      onSetValue={(value) => updateTranslationField('titleTranslations', lang, value)}
                      theme='superWhite'
                    />
                    {lang === currentLanguage && errors.title && (
                      <span className={styles.error__text}>{errors.title}</span>
                    )}
                  </div>

                  <div className={styles.input__group}>
                    <label className={styles.input__label}>
                      Подзаголовок на {getLanguageName(lang)}
                      {isFieldRequired(lang) && <span className={styles.required__asterisk}>*</span>}
                    </label>
                    <TextInputUI
                      currentValue={formData.subtitleTranslations[lang] || ''}
                      placeholder={`Введите подзаголовок на ${getLanguageName(lang)}${isFieldRequired(lang) ? ' (обязательно)' : ''}`}
                      onSetValue={(value) => updateTranslationField('subtitleTranslations', lang, value)}
                      theme='superWhite'
                    />
                    {lang === currentLanguage && errors.subtitle && (
                      <span className={styles.error__text}>{errors.subtitle}</span>
                    )}
                  </div>

                  {/* New thirdText input for each language */}
                  <div className={styles.input__group}>
                    <label className={styles.input__label}>Дополнительный текст на {getLanguageName(lang)}</label>
                    <TextInputUI
                      currentValue={formData.thirdTextTranslations[lang] || ''}
                      placeholder={`Введите дополнительный текст на ${getLanguageName(lang)}`}
                      onSetValue={(value) => updateTranslationField('thirdTextTranslations', lang, value)}
                      theme='superWhite'
                    />
                  </div>
                </div>
              )
            )}

            {/* Other fields */}
            <div className={styles.form__section}>
              <h3 className={styles.section__title}>Дополнительная информация</h3>

              {/* isBig checkbox */}
              <div className={styles.input__group}>
                <label className={styles.checkbox__label}>
                  <input
                    type='checkbox'
                    checked={formData.isBig}
                    onChange={(e) => setFormData((prev) => ({...prev, isBig: e.target.checked}))}
                    className={styles.checkbox__input}
                  />
                  <span className={styles.checkbox__text}>Важное объявление</span>
                  <span className={styles.checkbox__description}>(будет выделено в списке)</span>
                </label>
              </div>

              {/* Date Input for "Time to Live" */}
              <div className={styles.input__group}>
                <label className={styles.input__label}>Дата истечения</label>
                <Calendar
                  selectedDate={formData.expiresAt}
                  onDateSelect={(date) => {
                    setFormData((prev) => ({...prev, expiresAt: date}))
                    // Clear error when date is selected
                    if (errors.expiresAt) {
                      setErrors((prev) => ({...prev, expiresAt: ''}))
                    }
                  }}
                  minDate={new Date().toISOString().split('T')[0]} // Не раньше сегодня
                  placeholder='Выберите дату истечения (необязательно)'
                />
                {errors.expiresAt && <span className={styles.error__text}>{errors.expiresAt}</span>}
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
                {errors.uploadedFiles && <span className={styles.error__text}>{errors.uploadedFiles}</span>}
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
            Просмотр на: <span className={styles.language__name}>{getLanguageName(activeLanguage)}</span>
          </div>
          <div className={styles.ads__count}>
            Найдено: {filteredAds.length} из {ads.length}
            {showOnlyImportant && <span className={styles.filter__status}> (только важные)</span>}
          </div>
        </div>

        <div className={styles.ads__grid}>
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className={`${styles.ad__card} ${ad.isBig ? styles.ad__card__big : ''} ${isAdExpired(ad.expiresAt) ? styles.ad__card__expired : ''}`}
            >
              <div className={styles.ad__image}>
                <img src={ad.imageUrl} alt={getTranslatedText(ad, 'title')} />
                {ad.isBig && <div className={styles.important__badge}>⭐ Важное</div>}
                {isAdExpired(ad.expiresAt) && <div className={styles.expired__badge}>⏰ Истекло</div>}
              </div>

              <div className={styles.ad__content}>
                <h3 className={styles.ad__title}>
                  {getTranslatedText(ad, 'title')}
                  {ad.isBig && <span className={styles.important__indicator}> ⭐</span>}
                </h3>
                <p className={styles.ad__subtitle}>{getTranslatedText(ad, 'subtitle')}</p>
                {ad.thirdText && <p className={styles.ad__thirdText}>{getTranslatedText(ad, 'thirdText')}</p>}{' '}
                {/* Render thirdText */}
                <div className={styles.ad__meta}>
                  <div className={styles.ad__dates}>
                    <span>Создано: {new Date(ad.creationDate).toLocaleDateString('ru-RU')}</span>
                    <span>Изменено: {new Date(ad.lastModificationDate).toLocaleDateString('ru-RU')}</span>
                    {ad.expiresAt && (
                      <span className={isAdExpired(ad.expiresAt) ? styles.expired__date : ''}>
                        Истекает: {new Date(ad.expiresAt).toLocaleDateString('ru-RU')}
                        {isAdExpired(ad.expiresAt) && ' (Истекло)'}
                      </span>
                    )}
                  </div>
                  {ad.isBig && <div className={styles.important__status}>Важное объявление</div>}
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
