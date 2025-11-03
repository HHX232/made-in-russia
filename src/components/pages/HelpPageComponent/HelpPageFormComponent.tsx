import {FC, useState, useEffect} from 'react'
import styles from './HelpPageFormComponent.module.scss'
import {useTranslations} from 'next-intl'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {toast} from 'sonner'
import CreateImagesInputMinimalistic from '@/components/UI-kit/inputs/CreateImagesInputMinimalistic/CreateImagesInputMinimalistic'
import {useRouter} from 'next/navigation'

// Коды стран для валидации
const COUNTRY_CODES = {
  RU: '+7',
  BY: '+375',
  KZ: '+7',
  CN: '+86'
}

const HelpPageFormComponent: FC = () => {
  const t = useTranslations('HelpPage.Form')
  const user = useTypedSelector((state) => state.user.user)

  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    email: ''
  })

  // Функция для нормализации телефона (убирает дубли кода страны)
  const normalizePhone = (phone: string): string => {
    if (!phone) return ''

    // Убираем все пробелы и нецифровые символы кроме +
    let cleaned = phone.replace(/[^\d+]/g, '')

    // Проверяем на дублирование кодов стран
    const codes = Object.values(COUNTRY_CODES)

    for (const code of codes) {
      const codeDigits = code.replace('+', '')
      const regex = new RegExp(`^\\+?${codeDigits}${codeDigits}`, 'g')

      // Если код дублируется - убираем первое вхождение
      if (regex.test(cleaned)) {
        cleaned = cleaned.replace(regex, code)
        break
      }
    }

    return cleaned
  }

  const router = useRouter()
  // Инициализация данных из user
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.login || '',
        phone: normalizePhone(user.phoneNumber || ''),
        email: user.email || ''
      })
    }
  }, [user])

  const handleSuccess = () => {
    toast.success(
      <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
        <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('successMessage')}</strong>
      </div>,
      {
        style: {
          background: '#2E7D32'
        }
      }
    )
    router.push('/')
  }

  const handleError = () => {
    toast.error(
      <div style={{lineHeight: 1.5}}>
        <strong style={{display: 'block', marginBottom: 4}}>{t('errorMessage')}</strong>
      </div>,
      {
        style: {
          background: '#AC2525'
        }
      }
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target

    if (name === 'phone') {
      // При изменении телефона тоже нормализуем
      setFormData((prev) => ({
        ...prev,
        [name]: normalizePhone(value)
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formElement: HTMLFormElement = e.target as HTMLFormElement
      const fd = new FormData(formElement)

      // JSON-данные
      const data = {
        username: formData.firstName,
        email: formData.email,
        subject: t('subject', {defaultMessage: 'Сообщение в поддержку'}),
        body: fd.get('message')
      }

      const submitData = new FormData()
      submitData.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))

      // Картинки
      images.forEach((image) => {
        if (image instanceof File) {
          submitData.append('media', image, image.name)
        }
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/support`, {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        clearForm(formElement)
        handleSuccess()
      } else {
        handleError()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      handleError()
    }
  }

  const clearForm = (elem: HTMLFormElement) => {
    elem.reset()
    setImages([])
    // Возвращаем данные пользователя
    if (user) {
      setFormData({
        firstName: user.login || '',
        phone: normalizePhone(user.phoneNumber || ''),
        email: user.email || ''
      })
    }
  }

  return (
    <div className={styles.contacts_form}>
      <form onSubmit={handleSubmit}>
        <h2 className={styles.contacts_form__md_media}>{t('contacts')}</h2>
        <h3 className={styles.contacts_form__title}>{t('fillForm')}</h3>
        <div className={styles.contacts_form__description}>{t('description')}</div>
        <div className={styles.contacts_form__grid}>
          <div className={`${styles.contacts_form__col} ${styles.contacts_form__col_half}`}>
            <input
              type='text'
              name='firstName'
              className={styles.contacts_form__input}
              placeholder={t('namePlaceholder')}
              autoComplete='firstName'
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={`${styles.contacts_form__col} ${styles.contacts_form__col_half}`}>
            <input
              type='tel'
              name='phone'
              className={styles.contacts_form__input}
              placeholder={t('phonePlaceholder')}
              autoComplete='tel'
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.contacts_form__col}>
            <input
              type='email'
              name='email'
              className={styles.contacts_form__input}
              placeholder={t('emailPlaceholder')}
              autoComplete='email'
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.contacts_form__col}>
            <textarea
              name='message'
              className={styles.contacts_form__textarea}
              placeholder={t('messagePlaceholder')}
              rows={5}
              required
            ></textarea>
          </div>
          <div className={styles.contacts_form__col}>
            <div className={styles.contacts_form__file_wrapper}>
              <span>{t('addMedia')}</span>
            </div>
            <CreateImagesInputMinimalistic onFilesChange={setImages} />
          </div>
          <div className={styles.contacts_form__col}>
            <button type='submit' className={styles.btn_accent}>
              {t('submit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default HelpPageFormComponent
