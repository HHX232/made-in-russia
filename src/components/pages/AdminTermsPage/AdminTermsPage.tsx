'use client'
import {useEffect, useState} from 'react'
import styles from './AdminTermsPage.module.scss'
import instance from '@/api/api.interceptor'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {toast} from 'sonner'

export interface DeliveryTerm {
  id: string
  code: string
  name: string
  description: string
}

type DeliveryTermInput = {
  id: string | null
  code: string
  name: string
  description: string
}

const AdminTermsPage = () => {
  const [terms, setTerms] = useState<DeliveryTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTerm, setEditingTerm] = useState<DeliveryTerm | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTerm, setNewTerm] = useState<DeliveryTermInput>({
    id: null,
    code: '',
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      setLoading(true)
      const response = await instance.get('/delivery-terms')
      setTerms(response.data as DeliveryTerm[])
      console.log('Delivery terms loaded:', response.data)
    } catch (error) {
      console.error('Error fetching delivery terms:', error)
      toast.error('Ошибка при загрузке условий доставки')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTerm = async () => {
    if (!newTerm.code.trim() || !newTerm.name.trim()) {
      toast.error('Заполните обязательные поля: код и название')
      return
    }

    const loadingToast = toast.loading('Создание условия доставки...')
    try {
      const response = await instance.put('/delivery-terms', {
        id: null,
        code: newTerm.code,
        name: newTerm.name,
        description: newTerm.description
      })
      setTerms([...terms, response.data])
      setNewTerm({id: null, code: '', name: '', description: ''})
      setShowAddForm(false)
      toast.dismiss(loadingToast)
      toast.success('Условие доставки успешно создано')
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error creating delivery term:', error)
      toast.error('Ошибка при создании условия доставки')
    }
  }

  const handleUpdateTerm = async (term: DeliveryTerm) => {
    if (!term.code.trim() || !term.name.trim()) {
      toast.error('Заполните обязательные поля: код и название')
      return
    }

    const loadingToast = toast.loading('Сохранение изменений...')
    try {
      const response = await instance.put('/delivery-terms', {
        id: term.id,
        code: term.code,
        name: term.name,
        description: term.description
      })
      setTerms(terms.map((t) => (t.id === term.id ? response.data : t)))
      setEditingTerm(null)
      toast.dismiss(loadingToast)
      toast.success('Условие доставки успешно обновлено')
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error updating delivery term:', error)
      toast.error('Ошибка при обновлении условия доставки')
    }
  }

  const handleDeleteTerm = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это условие доставки?')) {
      return
    }

    const loadingToast = toast.loading('Удаление...')
    try {
      await instance.delete(`/delivery-terms/${id}`)
      setTerms(terms.filter((t) => t.id !== id))
      toast.dismiss(loadingToast)
      toast.success('Условие доставки успешно удалено')
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error deleting delivery term:', error)
      toast.error('Ошибка при удалении условия доставки')
    }
  }

  const filteredTerms = terms.filter(
    (term) =>
      term.code?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      term.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (term.description && term.description?.toLowerCase().includes(searchTerm?.toLowerCase()))
  )

  const renderTermCard = (term: DeliveryTerm) => {
    const isEditing = editingTerm?.id === term.id

    if (isEditing) {
      return (
        <div key={term.id} className={styles.term__card}>
          <div className={styles.card__header}>
            <h3 className={styles.card__title}>Редактирование условия</h3>
            <div className={styles.card__actions}>
              <button
                className={styles.save__button}
                onClick={() => handleUpdateTerm(editingTerm)}
                title='Сохранить изменения'
              >
                💾 Сохранить
              </button>
              <button className={styles.cancel__button} onClick={() => setEditingTerm(null)} title='Отменить'>
                ✕ Отмена
              </button>
            </div>
          </div>

          <div className={styles.form__fields}>
            <div className={styles.field__group}>
              <label className={styles.field__label}>
                Код <span className={styles.required}>*</span>
              </label>
              <TextInputUI
                currentValue={editingTerm.code}
                placeholder='Введите код условия (например, EXW, FOB)'
                onSetValue={(value) => setEditingTerm({...editingTerm, code: value})}
                theme='superWhite'
                extraClass={styles.input__field}
              />
            </div>

            <div className={styles.field__group}>
              <label className={styles.field__label}>
                Название <span className={styles.required}>*</span>
              </label>
              <TextInputUI
                currentValue={editingTerm.name}
                placeholder='Введите название условия'
                onSetValue={(value) => setEditingTerm({...editingTerm, name: value})}
                theme='superWhite'
                extraClass={styles.input__field}
              />
            </div>

            <div className={styles.field__group}>
              <label className={styles.field__label}>Описание</label>
              <TextAreaUI
                currentValue={editingTerm.description}
                placeholder='Введите подробное описание условия доставки'
                onSetValue={(value) => setEditingTerm({...editingTerm, description: value})}
                theme='superWhite'
                extraClass={styles.textarea__field}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={term.id} className={styles.term__card}>
        <div className={styles.card__header}>
          <div className={styles.term__code}>{term.code}</div>
          <div className={styles.card__actions}>
            <button className={styles.edit__button} onClick={() => setEditingTerm(term)} title='Редактировать'>
              ✏️ Редактировать
            </button>
            <button className={styles.delete__button} onClick={() => handleDeleteTerm(term.id)} title='Удалить'>
              🗑️ Удалить
            </button>
          </div>
        </div>

        <div className={styles.card__content}>
          <h3 className={styles.term__name}>{term.name}</h3>
          {term.description && <p className={styles.term__description}>{term.description}</p>}
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка условий доставки...</div>
  }

  return (
    <div className={styles.container__terms}>
      <div className={styles.header}>
        <div className={styles.title__section}>
          <h1 className={styles.title}>Управление условиями доставки</h1>
          <p className={styles.subtitle}>Всего условий: {terms.length}</p>
        </div>

        <div className={styles.controls__section}>
          <div className={styles.search__container}>
            <TextInputUI
              currentValue={searchTerm}
              placeholder='Поиск по условиям доставки...'
              onSetValue={setSearchTerm}
              theme='superWhite'
              extraClass={styles.search__input}
            />
          </div>

          <button className={styles.add__new__button} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Закрыть форму' : '+ Добавить условие'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.add__form__container}>
          <div className={styles.form__header}>
            <h2 className={styles.form__title}>Создание нового условия доставки</h2>
          </div>

          <div className={styles.form__fields}>
            <div className={styles.field__group}>
              <label className={styles.field__label}>
                Код <span className={styles.required}>*</span>
              </label>
              <TextInputUI
                currentValue={newTerm.code}
                placeholder='Введите код условия (например, EXW, FOB, CIF)'
                onSetValue={(value) => setNewTerm({...newTerm, code: value})}
                theme='superWhite'
                extraClass={styles.input__field}
              />
            </div>

            <div className={styles.field__group}>
              <label className={styles.field__label}>
                Название <span className={styles.required}>*</span>
              </label>
              <TextInputUI
                currentValue={newTerm.name}
                placeholder='Введите название условия'
                onSetValue={(value) => setNewTerm({...newTerm, name: value})}
                theme='superWhite'
                extraClass={styles.input__field}
              />
            </div>

            <div className={styles.field__group}>
              <label className={styles.field__label}>Описание</label>
              <TextAreaUI
                currentValue={newTerm.description}
                placeholder='Введите подробное описание условия доставки'
                onSetValue={(value) => setNewTerm({...newTerm, description: value})}
                theme='superWhite'
                extraClass={styles.textarea__field}
              />
            </div>
          </div>

          <div className={styles.form__actions}>
            <button className={styles.create__button} onClick={handleCreateTerm}>
              Создать условие
            </button>
            <button
              className={styles.cancel__form__button}
              onClick={() => {
                setShowAddForm(false)
                setNewTerm({id: null, code: '', name: '', description: ''})
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className={styles.terms__content}>
        {filteredTerms.length === 0 ? (
          <div className={styles.empty__state}>
            <div className={styles.empty__icon}>📦</div>
            <div className={styles.empty__message}>
              {searchTerm ? 'Условия доставки не найдены' : 'Нет созданных условий доставки'}
            </div>
          </div>
        ) : (
          <div className={styles.terms__grid}>{filteredTerms.map((term) => renderTermCard(term))}</div>
        )}
      </div>
    </div>
  )
}

export default AdminTermsPage
