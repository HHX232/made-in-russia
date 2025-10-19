'use client'
import React from 'react'
import {useTranslations} from 'next-intl'
import styles from './Exports.module.scss'

export default function Exports() {
  const t = useTranslations('Exports')

  return (
    <section className={`section ${styles.exporteru}`}>
      <h2 className='visually-hidden'>{t('sectionTitle')}</h2>
      <div className='container'>
        <div className={styles.exporteru__block}>
          <div className={styles.exporteru__title}>{t('title')}</div>
          <p className={styles.exporteru__description}>{t('description')}</p>
        </div>
      </div>
    </section>
  )
}
