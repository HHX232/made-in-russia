'use client'
import {useEffect, useState} from 'react'
import styles from './AdminTranslatesPage.module.scss'
import instance, {axiosClassic} from '@/api/api.interceptor'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'

interface TranslateData {
  [key: string]: string | TranslateData
}

const AdminTranslatesPage = () => {
  const [translateRuJSON, setTranslateRuJSON] = useState<TranslateData>({})
  const [translateEnJSON, setTranslateEnJSON] = useState<TranslateData>({})
  const [translateZhJSON, setTranslateZhJSON] = useState<TranslateData>({})
  const [loading, setLoading] = useState(true)
  const [activeLanguage, setActiveLanguage] = useState<'ru' | 'en' | 'zh'>('ru')
  const [searchTerm, setSearchTerm] = useState('')
  const [newKeyValue, setNewKeyValue] = useState('')
  const [newStringValue, setNewStringValue] = useState('')
  const [showAddForm, setShowAddForm] = useState<{path: string[]; type: 'string' | 'object'} | null>(null)

  const t = useTranslations('HomePage')

  useEffect(() => {
    const fetchTranslateJSON = async () => {
      try {
        const response = await axiosClassic.get('localization/ru')
        const resEn = await axiosClassic.get('localization/en')
        const resZh = await axiosClassic.get('localization/zh')
        setTranslateRuJSON(response.data as TranslateData)
        setTranslateEnJSON(resEn.data as TranslateData)
        setTranslateZhJSON(resZh.data as TranslateData)
        console.log(response.data)
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

  const deleteNestedValue = (obj: TranslateData, path: string[]): TranslateData => {
    const newObj = {...obj}
    let current = newObj

    for (let i = 0; i < path.length - 1; i++) {
      if (typeof current[path[i]] === 'object') {
        current[path[i]] = {...(current[path[i]] as TranslateData)}
      }
      current = current[path[i]] as TranslateData
    }

    delete current[path[path.length - 1]]
    return newObj
  }

  const addNestedValue = (
    obj: TranslateData,
    path: string[],
    key: string,
    value: string | TranslateData
  ): TranslateData => {
    const newObj = {...obj}
    let current = newObj

    for (let i = 0; i < path.length; i++) {
      if (typeof current[path[i]] === 'object') {
        current[path[i]] = {...(current[path[i]] as TranslateData)}
      } else if (i < path.length - 1) {
        current[path[i]] = {}
      }
      if (i < path.length - 1) {
        current = current[path[i]] as TranslateData
      }
    }

    if (path.length === 0) {
      current[key] = value
    } else {
      const target = current[path[path.length - 1]] as TranslateData
      target[key] = value
    }

    return newObj
  }

  const handleValueChange = (path: string[], value: string) => {
    const currentData = getCurrentTranslateData()
    const updatedData = updateNestedValue(currentData, path, value)
    setCurrentTranslateData(updatedData)
  }

  const handleDeleteValue = (path: string[]) => {
    const currentData = getCurrentTranslateData()
    const updatedData = deleteNestedValue(currentData, path)
    setCurrentTranslateData(updatedData)
    toast.success('Элемент удален')
  }

  const handleAddValue = (path: string[], type: 'string' | 'object') => {
    if (!newKeyValue.trim()) {
      toast.error('Введите название ключа')
      return
    }

    const currentData = getCurrentTranslateData()
    const value = type === 'string' ? newStringValue : {}
    const updatedData = addNestedValue(currentData, path, newKeyValue, value)
    setCurrentTranslateData(updatedData)

    setNewKeyValue('')
    setNewStringValue('')
    setShowAddForm(null)
    toast.success(`${type === 'string' ? 'Строка' : 'Объект'} добавлен`)
  }

  // Функция для поиска по переводам
  const searchInTranslations = (obj: TranslateData, searchTerm: string, parentPath: string[] = []): boolean => {
    if (!searchTerm.trim()) return true

    const lowerSearchTerm = searchTerm.toLowerCase()

    return Object.entries(obj).some(([key, value]) => {
      const currentPath = [...parentPath, key]
      const pathString = currentPath.join('.')

      if (typeof value === 'string') {
        return (
          key.toLowerCase().includes(lowerSearchTerm) ||
          value.toLowerCase().includes(lowerSearchTerm) ||
          pathString.toLowerCase().includes(lowerSearchTerm)
        )
      } else if (typeof value === 'object' && value !== null) {
        return (
          key.toLowerCase().includes(lowerSearchTerm) ||
          pathString.toLowerCase().includes(lowerSearchTerm) ||
          searchInTranslations(value, searchTerm, currentPath)
        )
      }

      return false
    })
  }

  const renderTranslateFields = (obj: TranslateData, parentPath: string[] = []) => {
    return Object.entries(obj)
      .filter(([key, value]) => {
        if (!searchTerm.trim()) return true

        const currentPath = [...parentPath, key]
        if (typeof value === 'object' && value !== null) {
          return searchInTranslations({[key]: value}, searchTerm, parentPath)
        } else {
          const pathString = currentPath.join('.')
          const lowerSearchTerm = searchTerm.toLowerCase()
          return (
            key.toLowerCase().includes(lowerSearchTerm) ||
            String(value).toLowerCase().includes(lowerSearchTerm) ||
            pathString.toLowerCase().includes(lowerSearchTerm)
          )
        }
      })
      .map(([key, value]) => {
        const currentPath = [...parentPath, key]
        const pathString = currentPath.join('.')

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={pathString} className={styles.nested__section}>
              <div className={styles.section__header}>
                <h3 className={styles.section__title}>{key}</h3>
                <div className={styles.section__actions}>
                  <button
                    className={styles.add__button}
                    onClick={() => setShowAddForm({path: currentPath, type: 'string'})}
                    title='Добавить строку'
                  >
                    + Строка
                  </button>
                  <button
                    className={styles.add__button}
                    onClick={() => setShowAddForm({path: currentPath, type: 'object'})}
                    title='Добавить объект'
                  >
                    + Объект
                  </button>
                  <button
                    className={styles.delete__button}
                    onClick={() => handleDeleteValue(currentPath)}
                    title='Удалить раздел'
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {showAddForm?.path.join('.') === currentPath.join('.') && (
                <div className={styles.add__form}>
                  <TextInputUI
                    currentValue={newKeyValue}
                    placeholder='Название ключа'
                    onSetValue={setNewKeyValue}
                    theme='superWhite'
                    extraClass={styles.add__input}
                  />
                  {showAddForm.type === 'string' && (
                    <TextInputUI
                      currentValue={newStringValue}
                      placeholder='Значение'
                      onSetValue={setNewStringValue}
                      theme='superWhite'
                      extraClass={styles.add__input}
                    />
                  )}
                  <div className={styles.add__buttons}>
                    <button
                      className={styles.confirm__button}
                      onClick={() => handleAddValue(currentPath, showAddForm.type)}
                    >
                      Добавить
                    </button>
                    <button className={styles.cancel__button} onClick={() => setShowAddForm(null)}>
                      Отмена
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.nested__content}>{renderTranslateFields(value, currentPath)}</div>
            </div>
          )
        } else {
          const stringValue = String(value)
          const isLongText = stringValue.length > 50

          return (
            <div key={pathString} className={styles.field__container}>
              <div className={styles.field__header}>
                <label className={styles.field__label}>{pathString}</label>
                <button
                  className={styles.delete__field__button}
                  onClick={() => handleDeleteValue(currentPath)}
                  title='Удалить поле'
                >
                  ✕
                </button>
              </div>
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
    const loadingToast = toast.loading('Сохранение переводов...')
    try {
      setLoading(true)

      const res = await instance.post(`/localization/${activeLanguage}`, getCurrentTranslateData())
      console.log('Saving translations for', activeLanguage, res)
      toast.dismiss(loadingToast)
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>Поздравляем!</strong>
          <span>Переводы успешно сохранены</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error saving translations:', error as Error)
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>Ошибка при сохранении переводов</strong>
          <span>Ошибка – {(error as Error).message}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
    } finally {
      toast.dismiss(loadingToast)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка переводов...</div>
  }

  return (
    <div className={styles.container__translates}>
      <div className={styles.header}>
        <div className={styles.title__section}>
          <h1 className={styles.title}>Редактирование переводов</h1>
          <p style={{marginTop: '15px'}}>HomePage.title – тестовое поле – {t('title')}</p>
        </div>

        <div className={styles.controls__section}>
          <div className={styles.search__container}>
            <TextInputUI
              currentValue={searchTerm}
              placeholder='Поиск по переводам...'
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

          <button className={styles.save__button} onClick={saveTranslations} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить переводы'}
          </button>
        </div>
      </div>

      <div className={styles.translate__content}>
        <div className={styles.content__header}>
          <div className={styles.current__language}>
            Редактирование:{' '}
            <span className={styles.language__name}>
              {activeLanguage === 'ru' ? 'Русский' : activeLanguage === 'en' ? 'English' : '中文'}
            </span>
          </div>

          <div className={styles.root__actions}>
            <button className={styles.add__button} onClick={() => setShowAddForm({path: [], type: 'string'})}>
              + Добавить строку
            </button>
            <button className={styles.add__button} onClick={() => setShowAddForm({path: [], type: 'object'})}>
              + Добавить раздел
            </button>
          </div>
        </div>

        {showAddForm?.path.length === 0 && (
          <div className={styles.add__form}>
            <TextInputUI
              currentValue={newKeyValue}
              placeholder='Название ключа'
              onSetValue={setNewKeyValue}
              theme='superWhite'
              extraClass={styles.add__input}
            />
            {showAddForm.type === 'string' && (
              <TextInputUI
                currentValue={newStringValue}
                placeholder='Значение'
                onSetValue={setNewStringValue}
                theme='superWhite'
                extraClass={styles.add__input}
              />
            )}
            <div className={styles.add__buttons}>
              <button className={styles.confirm__button} onClick={() => handleAddValue([], showAddForm.type)}>
                Добавить
              </button>
              <button className={styles.cancel__button} onClick={() => setShowAddForm(null)}>
                Отмена
              </button>
            </div>
          </div>
        )}

        <div className={styles.fields__container}>{renderTranslateFields(getCurrentTranslateData())}</div>
      </div>
    </div>
  )
}

export default AdminTranslatesPage
