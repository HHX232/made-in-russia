'use client'
import {FC, useEffect, useState} from 'react'
import styles from './AdminFAQPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import Accordion from '@/components/UI-kit/Texts/Accordions/Accordions'
import ServiceDefaultFAQ, {FAQ} from '@/services/faq/ServiceDefaultFAQ.service'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'

interface AccordionItem {
  title: string
  value: string
  id: string
}

interface FAQTranslations {
  ru: string
  en: string
  zh: string
  hi: string
}

interface EditingFAQ {
  id?: string
  question: string
  answer: string
  questionTranslations?: FAQTranslations
  answerTranslations?: FAQTranslations
}

interface ExtendedFAQ extends FAQ {
  questionTranslations?: FAQTranslations
  answerTranslations?: FAQTranslations
}

interface ExtendedCreateFAQRequest {
  question: string
  questionTranslations: FAQTranslations
  answer: string
  answerTranslations: FAQTranslations
}

interface ExtendedUpdateFAQRequest {
  id: string
  question: string
  questionTranslations: FAQTranslations
  answer: string
  answerTranslations: FAQTranslations
}

const AdminFAQPage: FC = () => {
  const [faqRu, setFaqRu] = useState<ExtendedFAQ[]>([])
  const [faqEn, setFaqEn] = useState<ExtendedFAQ[]>([])
  const [faqZh, setFaqZh] = useState<ExtendedFAQ[]>([])
  const [faqHi, setFaqHi] = useState<ExtendedFAQ[]>([])
  const [activeLanguage, setActiveLanguage] = useState<'ru' | 'en' | 'zh' | 'hi'>('ru')
  const [loading, setLoading] = useState(true)
  const [editingFAQ, setEditingFAQ] = useState<EditingFAQ | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const faqRussian = await ServiceDefaultFAQ.getFAQ('ru', {hasTranslations: true})
        const faqEnglish = await ServiceDefaultFAQ.getFAQ('en', {hasTranslations: true})
        const faqChinese = await ServiceDefaultFAQ.getFAQ('zh', {hasTranslations: true})
        const faqHindi = await ServiceDefaultFAQ.getFAQ('hi', {hasTranslations: true})

        setFaqRu(faqRussian)
        setFaqEn(faqEnglish)
        setFaqZh(faqChinese)
        setFaqHi(faqHindi)
      } catch (error) {
        console.error('Error fetching FAQ:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFAQ()
  }, [])

  const getCurrentFAQ = () => {
    switch (activeLanguage) {
      case 'ru':
        return faqRu
      case 'en':
        return faqEn
      case 'zh':
        return faqZh
      case 'hi':
        return faqHi
      default:
        return faqRu
    }
  }

  const setCurrentFAQ = (faq: ExtendedFAQ[]) => {
    switch (activeLanguage) {
      case 'ru':
        setFaqRu(faq)
        break
      case 'en':
        setFaqEn(faq)
        break
      case 'zh':
        setFaqZh(faq)
        break
      case 'hi':
        setFaqHi(faq)
        break
    }
  }

  const getFAQItems = (): AccordionItem[] => {
    return getCurrentFAQ().map((faq) => ({
      title: faq.question,
      value: faq.answer,
      id: faq.id
    }))
  }

  const handleFaqDelete = async (item: AccordionItem) => {
    if (!confirm('Вы уверены, что хотите удалить этот FAQ?')) return

    try {
      setLoading(true)
      await ServiceDefaultFAQ.deleteFAQ(item.id, activeLanguage)

      const updatedFAQ = getCurrentFAQ().filter((faq) => faq.id !== item.id)
      setCurrentFAQ(updatedFAQ)

      alert('FAQ удален успешно!')
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Ошибка при удалении FAQ')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFAQ = () => {
    setEditingFAQ({
      question: '',
      answer: '',
      questionTranslations: {
        ru: '',
        en: '',
        zh: '',
        hi: ''
      },
      answerTranslations: {
        ru: '',
        en: '',
        zh: '',
        hi: ''
      }
    })
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const handleEditFAQ = (faq: ExtendedFAQ) => {
    const questionTranslations = faq.questionTranslations || {
      ru: activeLanguage === 'ru' ? faq.question : '',
      en: activeLanguage === 'en' ? faq.question : '',
      zh: activeLanguage === 'zh' ? faq.question : '',
      hi: activeLanguage === 'hi' ? faq.question : ''
    }

    const answerTranslations = faq.answerTranslations || {
      ru: activeLanguage === 'ru' ? faq.answer : '',
      en: activeLanguage === 'en' ? faq.answer : '',
      zh: activeLanguage === 'zh' ? faq.answer : '',
      hi: activeLanguage === 'hi' ? faq.answer : ''
    }

    const completeQuestionTranslations: FAQTranslations = {
      ru: questionTranslations.ru || '',
      en: questionTranslations.en || '',
      zh: questionTranslations.zh || '',
      hi: questionTranslations.hi || ''
    }

    const completeAnswerTranslations: FAQTranslations = {
      ru: answerTranslations.ru || '',
      en: answerTranslations.en || '',
      zh: answerTranslations.zh || '',
      hi: answerTranslations.hi || ''
    }

    setEditingFAQ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      questionTranslations: completeQuestionTranslations,
      answerTranslations: completeAnswerTranslations
    })
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleSaveFAQ = async () => {
    if (!editingFAQ) return

    const currentQuestionTranslation = editingFAQ.questionTranslations?.[activeLanguage] || ''
    const currentAnswerTranslation = editingFAQ.answerTranslations?.[activeLanguage] || ''

    if (!currentQuestionTranslation.trim() || !currentAnswerTranslation.trim()) {
      alert(`Поля для текущего языка (${activeLanguage}) обязательны для заполнения`)
      return
    }

    const completeQuestionTranslations: FAQTranslations = {
      ru: editingFAQ.questionTranslations?.ru || '',
      en: editingFAQ.questionTranslations?.en || '',
      zh: editingFAQ.questionTranslations?.zh || '',
      hi: editingFAQ.questionTranslations?.hi || ''
    }

    const completeAnswerTranslations: FAQTranslations = {
      ru: editingFAQ.answerTranslations?.ru || '',
      en: editingFAQ.answerTranslations?.en || '',
      zh: editingFAQ.answerTranslations?.zh || '',
      hi: editingFAQ.answerTranslations?.hi || ''
    }

    try {
      setLoading(true)

      if (isCreating) {
        const createData: ExtendedCreateFAQRequest = {
          question: currentQuestionTranslation,
          questionTranslations: completeQuestionTranslations,
          answer: currentAnswerTranslation,
          answerTranslations: completeAnswerTranslations
        }
        const newFAQ = await ServiceDefaultFAQ.createFAQ(createData, activeLanguage)
        setCurrentFAQ([...getCurrentFAQ(), newFAQ])
        alert('FAQ создан успешно!')
      } else if (editingFAQ.id) {
        const updateData: ExtendedUpdateFAQRequest = {
          id: editingFAQ.id,
          question: currentQuestionTranslation,
          questionTranslations: completeQuestionTranslations,
          answer: currentAnswerTranslation,
          answerTranslations: completeAnswerTranslations
        }
        const updatedFAQ = await ServiceDefaultFAQ.updateFAQ(updateData, activeLanguage)
        const updatedList = getCurrentFAQ().map((faq) => (faq.id === editingFAQ.id ? updatedFAQ : faq))
        setCurrentFAQ(updatedList)
        alert('FAQ обновлен успешно!')
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Ошибка при сохранении FAQ')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setEditingFAQ(null)
    setIsCreating(false)
    setIsModalOpen(false)
  }

  const updateQuestionTranslation = (lang: 'ru' | 'en' | 'zh' | 'hi', value: string) => {
    if (!editingFAQ) return
    setEditingFAQ({
      ...editingFAQ,
      questionTranslations: {
        ...editingFAQ.questionTranslations!,
        [lang]: value
      }
    })
  }

  const updateAnswerTranslation = (lang: 'ru' | 'en' | 'zh' | 'hi', value: string) => {
    if (!editingFAQ) return
    setEditingFAQ({
      ...editingFAQ,
      answerTranslations: {
        ...editingFAQ.answerTranslations!,
        [lang]: value
      }
    })
  }

  const getLanguageName = (lang: 'ru' | 'en' | 'zh' | 'hi') => {
    switch (lang) {
      case 'ru':
        return 'Русский'
      case 'en':
        return 'English'
      case 'zh':
        return '中文'
      case 'hi':
        return 'हिन्दी'
      default:
        return lang
    }
  }

  const renderModalContent = () => {
    if (!editingFAQ) return null

    const languages: ('ru' | 'en' | 'zh' | 'hi')[] = ['ru', 'en', 'zh', 'hi']

    return (
      <div className={styles.edit__form}>
        <h3 className={styles.form__title}>{isCreating ? 'Создание FAQ' : 'Редактирование FAQ'}</h3>

        <div className={styles.form__section}>
          <h4 className={styles.section__title}>Вопросы</h4>
          {languages.map((lang) => (
            <div key={`question-${lang}`} className={styles.form__field}>
              <label className={styles.form__label}>
                Вопрос ({getLanguageName(lang)}){lang === activeLanguage && <span className={styles.required}>*</span>}
              </label>
              <TextInputUI
                currentValue={editingFAQ.questionTranslations?.[lang] || ''}
                placeholder={`Введите вопрос на ${getLanguageName(lang).toLowerCase()}`}
                onSetValue={(value) => updateQuestionTranslation(lang, value)}
                theme='superWhite'
                extraClass={`${styles.form__input} ${lang === activeLanguage ? styles.required__field : ''}`}
              />
            </div>
          ))}
        </div>

        <div className={styles.form__section}>
          <h4 className={styles.section__title}>Ответы</h4>
          {languages.map((lang) => (
            <div key={`answer-${lang}`} className={styles.form__field}>
              <label className={styles.form__label}>
                Ответ ({getLanguageName(lang)}){lang === activeLanguage && <span className={styles.required}>*</span>}
              </label>
              <TextAreaUI
                placeholder={`Введите ответ на ${getLanguageName(lang).toLowerCase()}`}
                currentValue={editingFAQ.answerTranslations?.[lang] || ''}
                onSetValue={(value) => updateAnswerTranslation(lang, value)}
                theme='superWhite'
                extraClass={`${styles.form__textarea} ${lang === activeLanguage ? styles.required__field : ''}`}
              />
            </div>
          ))}
        </div>

        <div className={styles.form__actions}>
          <button
            className={styles.save__button}
            onClick={handleSaveFAQ}
            disabled={
              loading ||
              !editingFAQ.questionTranslations?.[activeLanguage]?.trim() ||
              !editingFAQ.answerTranslations?.[activeLanguage]?.trim()
            }
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className={styles.cancel__button} onClick={handleCloseModal}>
            Отмена
          </button>
        </div>
      </div>
    )
  }

  if (loading && !editingFAQ) {
    return <div className={styles.loading}>Загрузка FAQ...</div>
  }

  const faqItems = getFAQItems()

  return (
    <div className={styles.admin__faq__page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление FAQ</h1>

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
          <button
            className={`${styles.language__button} ${activeLanguage === 'hi' ? styles.active : ''}`}
            onClick={() => setActiveLanguage('hi')}
          >
            हिन्दी
          </button>
        </div>

        <button className={styles.add__main__button} onClick={handleCreateFAQ}>
          Добавить FAQ
        </button>
      </div>

      <div className={styles.faq__content}>
        <div className={styles.current__language}>
          Редактирование FAQ:{' '}
          <span className={styles.language__name}>
            {activeLanguage === 'ru'
              ? 'Русский'
              : activeLanguage === 'en'
                ? 'English'
                : activeLanguage === 'zh'
                  ? '中文'
                  : 'हिन्दी'}
          </span>
        </div>

        <div className={styles.faq__list}>
          {faqItems.length > 0 ? (
            <>
              <Accordion
                needDeleteButton={true}
                onDelete={handleFaqDelete}
                onUpdate={(item) => {
                  const faq = getCurrentFAQ().find((f) => f.id === item.id)
                  if (faq) handleEditFAQ(faq)
                }}
                items={faqItems}
              />
            </>
          ) : (
            <div className={styles.empty__state}>
              <p>FAQ не найдены</p>
              <button className={styles.add__first__button} onClick={handleCreateFAQ}>
                Создать первый FAQ
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalWindowDefault isOpen={isModalOpen} onClose={handleCloseModal} extraClass={styles.modal__window}>
        {renderModalContent()}
      </ModalWindowDefault>
    </div>
  )
}

export default AdminFAQPage
