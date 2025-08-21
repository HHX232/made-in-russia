/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React from 'react'
import {useTranslations} from 'next-intl'
import {useRouter} from 'next/navigation'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import styles from './AgreementPage.module.scss'

const Agreement = () => {
  const t = useTranslations('Agreement')
  const router = useRouter()

  const renderText = (text: string) => {
    if (!text) return ''
    return text.split('<br/>').map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < text.split('<br/>').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  const renderSection = (sectionKey: string) => {
    try {
      const title = t(`titles.${sectionKey}`)
      const sectionData = t.raw(`agreementList.${sectionKey}`)

      if (!sectionData) return null

      return (
        <div key={sectionKey} className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {Number(sectionKey) - 1}. {title}
          </h2>

          {Object.keys(sectionData).map((key) => {
            if (key.endsWith('-title')) {
              const idx = key.split('-')[0] // номер подпункта
              const itemTitle = sectionData[`${idx}-title`]
              const itemText = sectionData[`${idx}-text`] || ''

              return (
                <div key={key} className={styles.subPoint}>
                  {itemTitle && <h3 className={styles.subPointTitle}>{itemTitle}</h3>}
                  {itemText && <p className={styles.subPointText}>{renderText(itemText)}</p>}
                </div>
              )
            }
            return null
          })}
        </div>
      )
    } catch (error) {
      return null
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div>
      <Header />
      <div className={styles.privacy__box}>
        <div className='container'>
          <div className={styles.privacy__controls}>
            <button onClick={handleGoBack} className={styles.backButton}>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M19 12H5M12 19L5 12L12 5'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              {t('back')}
            </button>
            <a download='agreement.pdf' href={'/agreement.pdf'} className={styles.downloadButton}>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15M7 10L12 15L17 10M12 15V3'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              {t('download')}
            </a>
          </div>

          {/* Заголовок */}
          <h1>{t('titles.1')}</h1>

          {/* Вступительные тексты */}
          <p className={styles.mainText}>{renderText(t('text'))}</p>
          <p style={{marginBottom: '10px', marginTop: '10px'}} className={styles.mainText}>
            {renderText(t('secondText'))}
          </p>

          {/* Секции 2-4 */}
          <div className={styles.privacy__box__inner}>
            {['2', '3', '4'].map((sectionKey) => renderSection(sectionKey))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Agreement
