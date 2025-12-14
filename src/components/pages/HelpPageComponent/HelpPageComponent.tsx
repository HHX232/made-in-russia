'use client'
import {FC} from 'react'
import styles from './HelpPageComponent.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import HelpPageSocialComponent from './HelpPageSocialComponent'
import HelpPageFormComponent from './HelpPageFormComponent'

const HelpPageComponent: FC = () => {
  return (
    <div className={styles.helpPageComponent}>
      <Header />
      <main className='main'>
        <div className={`${styles.contacts_container} container`}>
          <div className={styles.contacts_layout}>
            <div className={styles.layout_grid}>
              <div className={`${styles.layout_col} ${styles.layout_col_order_1}`}>
                <HelpPageSocialComponent />
              </div>
              <div className={`${styles.layout_col} ${styles.layout_col_order_2}`}>
                <HelpPageFormComponent />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default HelpPageComponent

{
  /* <div className={styles.content}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>{t('title')}</h1>

          <div className={styles.formWrapper}>
            <div className={styles.formSection}>
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <TextInputUI
                  theme='superWhite'
                  placeholder={t('namePlaceholder')}
                  errorValue={errors.name}
                  currentValue={formData.name}
                  onSetValue={(value) => handleInputChange('name', value)}
                />

                <TextInputUI
                  theme='superWhite'
                  placeholder={t('emailPlaceholder')}
                  errorValue={errors.email}
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
                  errorValue=''
                  currentValue={formData.subject}
                  onSetValue={(value) => handleInputChange('subject', value)}
                />

                <TextAreaUI
                  theme='superWhite'
                  placeholder={t('messagePlaceholder')}
                  errorValue={errors.message}
                  currentValue={formData.message}
                  onSetValue={(value) => handleInputChange('message', value)}
                />

                <button type='submit' className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? t('sending') : t('send')}
                </button>
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
      </div> */
}
