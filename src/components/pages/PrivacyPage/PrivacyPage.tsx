/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import {useTranslations} from 'next-intl'
import {useRouter} from 'next/navigation'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import styles from './PrivacyPage.module.scss'
import Link from 'next/link'

//  /Users/nikitatisevic/Desktop/made-in-russia/public/privacy/privacy-pdf.pdf

const Privacy = () => {
  const t = useTranslations('Privacy')
  const router = useRouter()

  // Константы для количества подпунктов в каждом разделе
  const sectionSubPoints = {
    '1': 2,
    '2': 14,
    '3': 2,
    '4': 3,
    '5': 7,
    '6': 0, // Секция 6 имеет специальную структуру с таблицей
    '7': 2,
    '8': 8,
    '9': 2,
    '10': 2,
    '11': 0, // В секции 11 только text, без подпунктов
    '12': 3
  }

  const renderText = (text: any) => {
    if (!text) return ''
    return text.split('<br/>').map((part: any, index: any) => (
      <React.Fragment key={index}>
        {part}
        {index < text.split('<br/>').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  const renderSubPoints = (sectionKey: any) => {
    const subPointsCount = (sectionSubPoints as any)[sectionKey] || 0
    const subPoints = []

    for (let i = 1; i <= subPointsCount; i++) {
      const subPointKey = `${sectionKey}-${i}`
      try {
        const subPointText = t(`policyLists.${sectionKey}.${subPointKey}`)
        // Проверяем, что текст существует и не является ключом перевода
        if (subPointText && !subPointText.includes('policyLists')) {
          subPoints.push(
            <div key={subPointKey} className={styles.subPoint}>
              <span className={styles.subPointNumber}>
                {sectionKey}.{i}
              </span>
              {renderText(subPointText)}
            </div>
          )
        }
      } catch (error) {
        // Игнорируем ошибки для несуществующих ключей
        continue
      }
    }

    return subPoints
  }

  const renderSection = (sectionKey: any) => {
    try {
      const title = t(`policyLists.${sectionKey}.title`)
      let text = null

      // Проверяем наличие текста
      try {
        const textValue = t(`policyLists.${sectionKey}.text`)
        // Если текст не пустая строка и не совпадает с ключом, используем его
        if (textValue && textValue.trim() !== '' && !textValue.includes('policyLists')) {
          text = textValue
        }
      } catch (error) {
        // Если текста нет, оставляем null
      }

      // Специальная обработка для секции 6 с таблицей
      if (sectionKey === '6') {
        return renderTableSection(sectionKey, title)
      }

      return (
        <div key={sectionKey} className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {sectionKey}. {title}
          </h3>
          {text && <p className={styles.sectionText}>{renderText(text)}</p>}
          <div className={styles.subPoints}>{renderSubPoints(sectionKey)}</div>
        </div>
      )
    } catch (error) {
      return null
    }
  }

  const renderTableSection = (sectionKey: any, title: any) => {
    try {
      // Пытаемся получить массив rows из JSON структуры
      let rows: any[] = []

      try {
        // Пытаемся получить весь объект секции
        const sectionData = t.raw(`policyLists.${sectionKey}`)
        console.log('Section data:', sectionData)

        if (sectionData && sectionData.rows) {
          rows = sectionData.rows
        }
      } catch (error) {
        console.log('Raw data error:', error)

        // Альтернативный способ - пытаемся получить как строку и распарсить
        try {
          const rowsString = t(`policyLists.${sectionKey}.rows`)
          console.log('Rows string:', rowsString)

          if (typeof rowsString === 'string' && rowsString !== `policyLists.${sectionKey}.rows`) {
            rows = JSON.parse(rowsString)
          } else if (Array.isArray(rowsString)) {
            rows = rowsString
          }
        } catch (parseError) {
          console.log('Parse error:', parseError)

          // Последняя попытка - получить каждый элемент отдельно
          let counter = 0
          while (counter < 10) {
            // максимум 10 строк
            try {
              const rowData = t(`policyLists.${sectionKey}.rows.${counter}`)
              if (rowData && typeof rowData === 'object') {
                rows.push(rowData)
                counter++
              } else {
                break
              }
            } catch (e) {
              break
            }
          }
        }
      }

      console.log('Final rows:', rows)

      return (
        <div key={sectionKey} className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {sectionKey}. {title}
          </h3>
          {rows.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <tbody>
                  {rows.map((row: any, index: any) => (
                    <tr key={index}>
                      <td className={styles.tableLabel}>{row.label}</td>
                      <td className={styles.tableValue}>{renderText(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Данные таблицы не найдены</p>
          )}
        </div>
      )
    } catch (error) {
      console.log('Table section error:', error)
      return (
        <div key={sectionKey} className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {sectionKey}. {title}
          </h3>
          <p>Ошибка загрузки данных таблицы: {String(error)}</p>
        </div>
      )
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
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
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
            <a download='privacy.pdf' href={'/privacy.pdf'} className={styles.downloadButton}>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
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

          <h1>{t('policyTitle')}</h1>

          <div className={styles.privacy__box__inner}>
            {Object.keys(sectionSubPoints).map((sectionKey) => renderSection(sectionKey))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Privacy
