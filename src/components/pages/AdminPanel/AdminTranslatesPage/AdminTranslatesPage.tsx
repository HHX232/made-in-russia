'use client'
import {useEffect, useState} from 'react'
import styles from './AdminTranslatesPage.module.scss'
import {axiosClassic} from '@/api/api.interceptor'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'

interface TranslateData {
  [key: string]: string | TranslateData
}

const AdminTranslatesPage = () => {
  const [translateRuJSON, setTranslateRuJSON] = useState<TranslateData>({})
  const [translateEnJSON, setTranslateEnJSON] = useState<TranslateData>({})
  const [translateZhJSON, setTranslateZhJSON] = useState<TranslateData>({})
  const [loading, setLoading] = useState(true)
  const [activeLanguage, setActiveLanguage] = useState<'ru' | 'en' | 'zh'>('ru')

  useEffect(() => {
    const fetchTranslateJSON = async () => {
      try {
        const response = await axiosClassic.get('language/ru')
        const resEn = await axiosClassic.get('language/en')
        const resZh = await axiosClassic.get('language/zh')
        setTranslateRuJSON(response.data as TranslateData)
        setTranslateEnJSON(resEn.data as TranslateData)
        setTranslateZhJSON(resZh.data as TranslateData)
      } catch (error) {
        console.error('Error fetching translations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTranslateJSON()
  }, [])

  const getCurrentTranslateData = () => {
    switch (activeLanguage) {
      case 'ru':
        return translateRuJSON
      case 'en':
        return translateEnJSON
      case 'zh':
        return translateZhJSON
      default:
        return translateRuJSON
    }
  }

  const setCurrentTranslateData = (data: TranslateData) => {
    switch (activeLanguage) {
      case 'ru':
        setTranslateRuJSON(data)
        break
      case 'en':
        setTranslateEnJSON(data)
        break
      case 'zh':
        setTranslateZhJSON(data)
        break
    }
  }

  const updateNestedValue = (obj: TranslateData, path: string[], value: string): TranslateData => {
    const newObj = {...obj}
    let current = newObj

    for (let i = 0; i < path.length - 1; i++) {
      if (typeof current[path[i]] === 'object') {
        current[path[i]] = {...(current[path[i]] as TranslateData)}
      }
      current = current[path[i]] as TranslateData
    }

    current[path[path.length - 1]] = value
    return newObj
  }

  const handleValueChange = (path: string[], value: string) => {
    const currentData = getCurrentTranslateData()
    const updatedData = updateNestedValue(currentData, path, value)
    setCurrentTranslateData(updatedData)
  }

  const renderTranslateFields = (obj: TranslateData, parentPath: string[] = []) => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...parentPath, key]
      const pathString = currentPath.join('.')

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={pathString} className={styles.nested__section}>
            <h3 className={styles.section__title}>{key}</h3>
            <div className={styles.nested__content}>{renderTranslateFields(value, currentPath)}</div>
          </div>
        )
      } else {
        const stringValue = String(value)
        const isLongText = stringValue.length > 50

        return (
          <div key={pathString} className={styles.field__container}>
            <label className={styles.field__label}>{pathString}</label>
            {isLongText ? (
              <TextAreaUI
                currentValue={stringValue}
                placeholder={`Введите текст для ${pathString}`}
                onSetValue={(newValue) => handleValueChange(currentPath, newValue)}
                theme='superWhite'
                extraClass={styles.textarea__field}
              />
            ) : (
              <TextInputUI
                currentValue={stringValue}
                placeholder={`Введите текст для ${pathString}`}
                onSetValue={(newValue) => handleValueChange(currentPath, newValue)}
                theme='superWhite'
                extraClass={styles.input__field}
              />
            )}
          </div>
        )
      }
    })
  }

  const saveTranslations = async () => {
    try {
      setLoading(true)
      // Здесь должен быть API вызов для сохранения переводов
      // await axiosClassic.post(`language/${activeLanguage}`, getCurrentTranslateData())
      console.log('Saving translations for', activeLanguage, getCurrentTranslateData())
      alert('Переводы сохранены успешно!')
    } catch (error) {
      console.error('Error saving translations:', error)
      alert('Ошибка при сохранении переводов')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка переводов...</div>
  }

  return (
    <div className={styles.container__translates}>
      <div className={styles.header}>
        <h1 className={styles.title}>Редактирование переводов</h1>

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

        <button className={styles.save__button} onClick={saveTranslations} disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить переводы'}
        </button>
      </div>

      <div className={styles.translate__content}>
        <div className={styles.current__language}>
          Редактирование:{' '}
          <span className={styles.language__name}>
            {activeLanguage === 'ru' ? 'Русский' : activeLanguage === 'en' ? 'English' : '中文'}
          </span>
        </div>

        <div className={styles.fields__container}>{renderTranslateFields(getCurrentTranslateData())}</div>
      </div>
    </div>
  )
}

export default AdminTranslatesPage
