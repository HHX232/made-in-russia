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
type Language = 'ru' | 'en' | 'zh' | 'hi'

interface AdTranslations {
  ru?: string
  en?: string
  zh?: string
  hi?: string
}
// Вынеси куда-нибудь в начало файла
const extractErrorMessage = (error: any): string => {
  if (!error) return ''

  if (typeof error === 'string') return error

  if (error instanceof Error) {
    try {
      // Если в message лежит JSON
      const parsed = JSON.parse(error.message)
      if (parsed?.errors?.message) return parsed.errors.message
      if (parsed?.message) return parsed.message
    } catch {
      return error.message
    }
  }

  if (error.response?.data?.errors?.message) {
    return error.response.data.errors.message
  }

  if (error.errors?.message) return error.errors.message
  if (error.message) return error.message

  return ''
}

interface AdData {
  id: number
  title: string
  subtitle: string
  imageUrl: string
  creationDate: string
  lastModificationDate: string
  thirdText?: string // New field
  link?: string // New field for link
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
  link: string // New field for link
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
    titleTranslations: {ru: '', en: '', zh: '', hi: ''}, // Initialize all translation fields
    subtitle: '', // This will be dynamically set by translations
    subtitleTranslations: {ru: '', en: '', zh: '', hi: ''}, // Initialize all translation fields
    thirdText: '', // This will be dynamically set by translations
    thirdTextTranslations: {ru: '', en: '', zh: '', hi: ''}, // New field for translations
    link: '', // New field for link
    expiresAt: '', // New field
    isBig: false, // New field for important ads
    uploadedFiles: [],
    activeImages: []
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  const formatYYYYMMDD = (date: Date) => date.toISOString().split('T')[0]

  // Extract language from pathname
  const getCurrentLanguage = (): Language => {
    const pathSegments = pathname.split('/')
    const langFromPath = pathSegments[1] as Language
    return ['ru', 'en', 'zh', 'hi'].includes(langFromPath) ? langFromPath : 'ru'
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
      //   {
      //     "status": 400,
      //     "error": "Bad Request",
      //     "errors": {
      //         "message": "Дата истечения рекламы не может быть пустой"
      //     },
      //     "message": "Validation failed"
      // }
      if (response.status === 400) {
        throw new Error((response?.data as any)?.errors?.message)
      }
      setAds(response.data)
    } catch (error) {
      console.error('Error fetching ads:', error)
      const msg = extractErrorMessage(error)

      toast.error('Ошибка при загрузке объявлений' + '\n ' + msg)
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
      link: '', // Reset link field
      expiresAt: '',
      isBig: false,
      uploadedFiles: [],
      activeImages: []
    })
    setErrors({})
    setEditingAd(null)
    setShowCreateForm(false)
  }

  useEffect(() => {
    console.log('ads', ads)
  }, [ads])

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    // Validation for required fields, using current language as the primary language for mandatory fields
    if (!formData.titleTranslations[currentLanguage]?.trim()) {
      newErrors.title = `Заголовок на ${getLanguageName(currentLanguage)} обязателен`
    }

    if (!formData.subtitleTranslations[currentLanguage]?.trim()) {
      newErrors.subtitle = `Подзаголовок на ${getLanguageName(currentLanguage)} обязателен`
    }

    // Link validation
    if (!formData.link?.trim()) {
      newErrors.link = 'Ссылка обязательна'
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
        thirdTextTranslations: formData.thirdTextTranslations,
        link: formData.link || 'linknew'
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/advertisements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // НЕ устанавливаем Content-Type, браузер сам установит правильный тип для FormData
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.errors?.message || 'Неизвестная ошибка')
      }

      const result = await response.json()
      console.log(result)
      toast.dismiss(loadingToast)
      toast.success('Объявление успешно создано')
      if (result.status === 400) {
        throw new Error((result?.data as any)?.errors?.message)
      }
      resetForm()
      fetchAds()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error creating ad:', error)
      const msg = extractErrorMessage(error)
      toast.error('Ошибка при создании объявления' + '\n ' + msg)
    }
  }

  const handleUpdateAd = async () => {
    if (!validateForm() || !editingAd) return

    const loadingToast = toast.loading('Обновление объявления...')
    try {
      // Get access token
      const token = await getAccessToken()

      const formDataToSend = new FormData()
      const today = new Date()
      const rawExpiresAt = formData.expiresAt || ads.find((value) => value.id === editingAd)?.expiresAt || ''

      let finalExpirationDate: string
      if (rawExpiresAt) {
        const expires = new Date(rawExpiresAt)
        const todayStart = new Date(formatYYYYMMDD(today)) // сегодня с 00:00

        if (expires.getTime() <= todayStart.getTime()) {
          // просрочена или сегодня
          const plus30 = addDays(today, 30)
          finalExpirationDate = formatDateForAPI(formatYYYYMMDD(plus30))
        } else {
          // ещё действительна
          finalExpirationDate = formatDateForAPI(formatYYYYMMDD(expires))
        }
      } else {
        // нет даты вообще → ставим сегодня +30
        const plus30 = addDays(today, 30)
        finalExpirationDate = formatDateForAPI(formatYYYYMMDD(plus30))
      }

      const dataPayload = {
        title: formData.titleTranslations[currentLanguage] || '', // Use current language as main
        titleTranslations: formData.titleTranslations,
        subtitle: formData.subtitleTranslations[currentLanguage] || '', // Use current language as main
        subtitleTranslations: formData.subtitleTranslations,
        thirdText: formData.thirdTextTranslations[currentLanguage] || '', // Use current language as main
        thirdTextTranslations: formData.thirdTextTranslations,
        expirationDate: finalExpirationDate,
        isBig: formData.isBig,
        link: formData.link || ''
      }
      console.log(
        'dataPayload',
        dataPayload,
        'finalExpirationDate',
        finalExpirationDate,
        'ads',
        ads?.[editingAd],
        'all ads',
        ads,
        'editingAd',
        editingAd
      )

      // ИСПРАВЛЕНИЕ: Создаем Blob для JSON данных с правильным типом содержимого
      const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
      formDataToSend.append('data', jsonBlob)

      // Append image file if new image is uploaded
      if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
        // Отправляем файл как бинарный тип
        formDataToSend.append('image', formData.uploadedFiles[0])
      }

      // Отправка через обычный fetch с токеном авторизации
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/advertisements/${editingAd}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
          // НЕ устанавливаем Content-Type, браузер сам установит правильный тип для FormData
        },
        body: formDataToSend
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.errors?.message || errorData?.message || 'Неизвестная ошибка')
      }

      const result = await response.json()
      if (result.status === 400) {
        throw new Error((result?.data as any)?.errors?.message)
      }
      console.log(result)
      toast.dismiss(loadingToast)
      toast.success('Объявление успешно обновлено')
      resetForm()
      fetchAds()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error updating ad:', error)
      const msg = extractErrorMessage(error)
      toast.error('Ошибка при обновлении объявления' + '\n ' + msg)
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
      const msg = extractErrorMessage(error)
      toast.error('Ошибка при удалении объявления' + '\n ' + msg)
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

    // Fill form with current ad data, including all translations
    setFormData({
      title: ad.title, // These are placeholder, actual values from translations
      titleTranslations: {
        ru: ad.titleTranslations?.ru || (currentLanguage === 'ru' ? ad.title : ''),
        en: ad.titleTranslations?.en || (currentLanguage === 'en' ? ad.title : ''),
        zh: ad.titleTranslations?.zh || (currentLanguage === 'zh' ? ad.title : ''),
        hi: ad.titleTranslations?.hi || (currentLanguage === 'hi' ? ad.title : '')
      },
      subtitle: ad.subtitle,
      subtitleTranslations: {
        ru: ad.subtitleTranslations?.ru || (currentLanguage === 'ru' ? ad.subtitle : ''),
        en: ad.subtitleTranslations?.en || (currentLanguage === 'en' ? ad.subtitle : ''),
        zh: ad.subtitleTranslations?.zh || (currentLanguage === 'zh' ? ad.subtitle : ''),
        hi: ad.subtitleTranslations?.hi || (currentLanguage === 'hi' ? ad.subtitle : '')
      },
      thirdText: ad.thirdText || '', // Populate new field
      thirdTextTranslations: {
        ru: ad.thirdTextTranslations?.ru || (currentLanguage === 'ru' ? ad.thirdText || '' : ''),
        en: ad.thirdTextTranslations?.en || (currentLanguage === 'en' ? ad.thirdText || '' : ''),
        zh: ad.thirdTextTranslations?.zh || (currentLanguage === 'zh' ? ad.thirdText || '' : ''),
        hi: ad.thirdTextTranslations?.hi || (currentLanguage === 'hi' ? ad.thirdText || '' : '')
      }, // Populate new translations
      link: ad.link || '', // Populate link field
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
    return (
      <div style={{width: '100%'}} className={styles.loading}>
        Загрузка объявлений...
      </div>
    )
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

            {/* Link field (single input for all languages) */}
            <div className={styles.form__section}>
              <h3 className={styles.section__title}>Ссылка</h3>
              <div className={styles.input__group}>
                <label className={styles.input__label}>
                  Ссылка на объявление
                  <span className={styles.required__asterisk}>*</span>
                </label>
                <TextInputUI
                  currentValue={formData.link}
                  placeholder='Введите ссылку (https://example.com)'
                  onSetValue={(value) => {
                    setFormData((prev) => ({...prev, link: value}))
                    // Clear error when link is entered
                    if (errors.link) {
                      setErrors((prev) => ({...prev, link: ''}))
                    }
                  }}
                  theme='superWhite'
                />
                {errors.link && <span className={styles.error__text}>{errors.link}</span>}
              </div>
            </div>

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
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  {' '}
                  <label className={styles.input__label}>Дата истечения</label>
                  <span className={styles.required__asterisk}>*</span>
                </div>
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
                  placeholder='Выберите дату истечения'
                />
                {errors.expiresAt && <span className={styles.error__text}>{errors.expiresAt}</span>}
              </div>
            </div>

            {/* Image section - показываем всегда, но с разными текстами */}
            <div className={styles.form__section}>
              <h3 className={styles.section__title}>
                {editingAd ? 'Изображение (добавьте изображение, если хотите заменить старое)' : 'Изображение'}
              </h3>

              {/* Показываем текущее изображение при редактировании */}
              {editingAd && formData.activeImages && formData.activeImages.length > 0 && (
                <div className={styles.current__image}>
                  <p className={styles.current__image__label}>Текущее изображение:</p>
                  <img
                    src={formData.activeImages[0]}
                    alt='Текущее изображение'
                    className={styles.current__image__preview}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  />
                </div>
              )}

              <CreateImagesInput
                onFilesChange={handleUploadedFilesChange}
                onActiveImagesChange={handleActiveImagesChange}
                activeImages={editingAd ? [] : formData.activeImages || []} // При редактировании не показываем активные изображения в компоненте
                maxFiles={1}
                minFiles={editingAd ? 0 : 1} // При редактировании изображение не обязательно
                allowMultipleFiles={false}
                errorValue={errors.uploadedFiles}
                setErrorValue={(value: string) => setErrors((prev) => ({...prev, uploadedFiles: value}))}
                inputIdPrefix='ad-image'
              />
              {errors.uploadedFiles && <span className={styles.error__text}>{errors.uploadedFiles}</span>}
            </div>

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
