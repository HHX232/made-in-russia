'use client'
import {FC, useState} from 'react'
import styles from './HelpPageComponent.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import {useTranslations} from 'next-intl'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {toast} from 'sonner'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  images: File[]
}

const HelpPageComponent: FC = () => {
  const t = useTranslations('HelpPage')
  const user = useTypedSelector((state) => state.user.user)
  const [formData, setFormData] = useState<FormData>({
    name: user?.login || '',
    email: user?.email || '',
    subject: '',
    message: '',
    images: []
  })
  const [activeImages, setActiveImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('subject', formData.subject)
      submitData.append('message', formData.message)

      // Добавляем изображения
      formData.images.forEach((image, index) => {
        submitData.append(`image_${index}`, image)
      })

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: user?.login || '',
          email: user?.email || '',
          subject: '',
          message: '',
          images: []
        })
        setActiveImages([])
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.helpPageComponent}>
      <Header />
      <div className={styles.content}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>{t('title')}</h1>

          <div className={styles.formWrapper}>
            <div className={styles.formSection}>
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <TextInputUI
                  theme='superWhite'
                  placeholder={t('namePlaceholder')}
                  currentValue={formData.name}
                  onSetValue={(value) => handleInputChange('name', value)}
                />

                <TextInputUI
                  theme='superWhite'
                  placeholder={t('emailPlaceholder')}
                  currentValue={formData.email}
                  onSetValue={(value) => handleInputChange('email', value)}
                />

                <CreateImagesInput
                  extraClass={styles.imagesInput}
                  maxFiles={8}
                  allowMultipleFiles
                  showBigFirstItem={false}
                  inputIdPrefix='contact'
                  onActiveImagesChange={(images) => {
                    setActiveImages(images)
                  }}
                  activeImages={activeImages}
                  onFilesChange={(files) => {
                    setFormData((prev) => ({...prev, images: files}))
                  }}
                />

                <TextInputUI
                  theme='superWhite'
                  placeholder={t('subjectPlaceholder')}
                  currentValue={formData.subject}
                  onSetValue={(value) => handleInputChange('subject', value)}
                />

                <TextAreaUI
                  theme='superWhite'
                  placeholder={t('messagePlaceholder')}
                  currentValue={formData.message}
                  onSetValue={(value) => handleInputChange('message', value)}
                />

                <button type='submit' className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? t('sending') : t('send')}
                </button>

                {submitStatus === 'success' &&
                  toast.success(
                    <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
                      <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>
                        {t('successMessage')}
                      </strong>
                    </div>,
                    {
                      style: {
                        background: '#2E7D32'
                      }
                    }
                  )}

                {submitStatus === 'error' &&
                  toast.error(
                    <div style={{lineHeight: 1.5}}>
                      <strong style={{display: 'block', marginBottom: 4}}>{t('errorMessage')}</strong>
                    </div>,
                    {
                      style: {
                        background: '#AC2525'
                      }
                    }
                  )}
              </form>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.infoSection}>
              <div className={styles.qrCode}>
                <svg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <rect width='120' height='120' fill='white' />
                  <rect x='10' y='10' width='30' height='30' fill='#2a2e46' />
                  <rect x='80' y='10' width='30' height='30' fill='#2a2e46' />
                  <rect x='10' y='80' width='30' height='30' fill='#2a2e46' />
                  <rect x='15' y='15' width='20' height='20' fill='white' />
                  <rect x='85' y='15' width='20' height='20' fill='white' />
                  <rect x='15' y='85' width='20' height='20' fill='white' />
                  <rect x='20' y='20' width='10' height='10' fill='#2a2e46' />
                  <rect x='90' y='20' width='10' height='10' fill='#2a2e46' />
                  <rect x='20' y='90' width='10' height='10' fill='#2a2e46' />
                  <rect x='50' y='50' width='20' height='20' fill='#2a2e46' />
                  <rect x='10' y='50' width='5' height='5' fill='#2a2e46' />
                  <rect x='20' y='50' width='5' height='5' fill='#2a2e46' />
                  <rect x='30' y='50' width='5' height='5' fill='#2a2e46' />
                  <rect x='50' y='10' width='5' height='5' fill='#2a2e46' />
                  <rect x='60' y='10' width='5' height='5' fill='#2a2e46' />
                  <rect x='70' y='10' width='5' height='5' fill='#2a2e46' />
                  <rect x='50' y='80' width='5' height='5' fill='#2a2e46' />
                  <rect x='60' y='80' width='5' height='5' fill='#2a2e46' />
                  <rect x='70' y='80' width='5' height='5' fill='#2a2e46' />
                  <rect x='80' y='50' width='5' height='5' fill='#2a2e46' />
                  <rect x='90' y='50' width='5' height='5' fill='#2a2e46' />
                  <rect x='100' y='50' width='5' height='5' fill='#2a2e46' />
                </svg>
              </div>
              <div className={styles.infoText}>{t('contactInfo')}</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default HelpPageComponent
