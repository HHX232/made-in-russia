'use client'
import {FC, useEffect, useState} from 'react'
import styles from './AdminFAQPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import Accordion from '@/components/UI-kit/Texts/Accordions/Accordions'
import ServiceDefaultFAQ, {FAQ, CreateFAQRequest, UpdateFAQRequest} from '@/services/faq/ServiceDefaultFAQ.service'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'

interface AccordionItem {
  title: string
  value: string
  id: string
}

interface EditingFAQ {
  id?: string
  question: string
  answer: string
}

const AdminFAQPage: FC = () => {
  const [faqRu, setFaqRu] = useState<FAQ[]>([])
  const [faqEn, setFaqEn] = useState<FAQ[]>([])
  const [faqZh, setFaqZh] = useState<FAQ[]>([])
  const [activeLanguage, setActiveLanguage] = useState<'ru' | 'en' | 'zh'>('ru')
  const [loading, setLoading] = useState(true)
  const [editingFAQ, setEditingFAQ] = useState<EditingFAQ | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const faqRussian = await ServiceDefaultFAQ.getFAQ('ru')
        const faqEnglish = await ServiceDefaultFAQ.getFAQ('en')
        const faqChinese = await ServiceDefaultFAQ.getFAQ('zh')

        setFaqRu(faqRussian)
        setFaqEn(faqEnglish)
        setFaqZh(faqChinese)
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
      default:
        return faqRu
    }
  }

  const setCurrentFAQ = (faq: FAQ[]) => {
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

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer
    })
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleCreateFAQ = () => {
    setEditingFAQ({
      question: '',
      answer: ''
    })
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const handleSaveFAQ = async () => {
    if (!editingFAQ) return

    try {
      setLoading(true)

      if (isCreating) {
        const createData: CreateFAQRequest = {
          question: editingFAQ.question,
          answer: editingFAQ.answer
        }
        const newFAQ = await ServiceDefaultFAQ.createFAQ(createData, activeLanguage)
        setCurrentFAQ([...getCurrentFAQ(), newFAQ])
        alert('FAQ создан успешно!')
      } else if (editingFAQ.id) {
        const updateData: UpdateFAQRequest = {
          id: editingFAQ.id,
          question: editingFAQ.question,
          answer: editingFAQ.answer
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

  const renderModalContent = () => {
    if (!editingFAQ) return null

    return (
      <div className={styles.edit__form}>
        <h3 className={styles.form__title}>{isCreating ? 'Создание FAQ' : 'Редактирование FAQ'}</h3>

        <div className={styles.form__field}>
          <label className={styles.form__label}>Вопрос</label>
          <TextInputUI
            currentValue={editingFAQ.question}
            placeholder='Введите вопрос'
            onSetValue={(value) => setEditingFAQ({...editingFAQ, question: value})}
            theme='superWhite'
            extraClass={styles.form__input}
          />
        </div>

        <div className={styles.form__field}>
          <label className={styles.form__label}>Ответ</label>
          <TextAreaUI
            placeholder='Введите ответ'
            currentValue={editingFAQ.answer}
            onSetValue={(value) => setEditingFAQ({...editingFAQ, answer: value})}
            theme='superWhite'
            extraClass={styles.form__textarea}
          />
        </div>

        <div className={styles.form__actions}>
          <button
            className={styles.save__button}
            onClick={handleSaveFAQ}
            disabled={loading || !editingFAQ.question.trim() || !editingFAQ.answer.trim()}
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
        </div>

        <button className={styles.add__main__button} onClick={handleCreateFAQ}>
          Добавить FAQ
        </button>
      </div>

      <div className={styles.faq__content}>
        <div className={styles.current__language}>
          Редактирование FAQ:{' '}
          <span className={styles.language__name}>
            {activeLanguage === 'ru' ? 'Русский' : activeLanguage === 'en' ? 'English' : '中文'}
          </span>
        </div>

        <div className={styles.faq__list}>
          {faqItems.length > 0 ? (
            <>
              <Accordion
                needDeleteButton={true}
                onDelete={handleFaqDelete}
                onUpdate={(item) => handleEditFAQ({id: item.id, question: item.title, answer: item.value})}
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
