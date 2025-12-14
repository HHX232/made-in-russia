'use client'
import {FC, useState, useRef, useEffect} from 'react'
import styles from './CreateDescriptionsElements.module.scss'
import Image from 'next/image'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import {HELP_IMAGES} from '../CreateCard'
import {useTranslations} from 'next-intl'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import MarkdownEditor from '@/components/UI-kit/MDEditor/MarkdownEditor'

const vopros = '/vopros.svg'

export interface ImageMapping {
  blobUrl: string
  file: File
  uploadedUrl?: string
}

interface CreateDescriptionsElementsProps {
  onImagesChange?: (images: ImageMapping[]) => void
  haveError?: boolean
  descriptionError?: string
  imagesError?: string
  currentDynamicLang: 'ru' | 'en' | 'zh'
  fullObjectForDescriptions?: {
    ru: {description: string; additionalDescription: string}
    en: {description: string; additionalDescription: string}
    zh: {description: string; additionalDescription: string}
  }
  setFullObjectForDescriptions?: (obj: {
    ru: {description: string; additionalDescription: string}
    en: {description: string; additionalDescription: string}
    zh: {description: string; additionalDescription: string}
  }) => void
}

const CreateDescriptionsElements: FC<CreateDescriptionsElementsProps> = ({
  descriptionError = '',
  haveError = false,
  currentDynamicLang
}) => {
  const {setDescriptionOne} = useActions()
  const {descriptions} = useTypedSelector((state) => state.multilingualDescriptions)

  // Локальное состояние для управления отображением ошибки
  const [showError, setShowError] = useState(false)
  const [hasUserInput, setHasUserInput] = useState(false)

  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const t = useTranslations('CreateDescription')

  const lastActiveLangRef = useRef<string[]>([])

  useEffect(() => {
    lastActiveLangRef.current.push(currentDynamicLang)
  }, [currentDynamicLang])

  // Проверка, является ли описание пустым (только заголовок или пустая строка)
  const isDescriptionEmpty = (value: string) => {
    const cleanValue = value.replace(/^#\s*[^\n]*\s*$/gm, '').trim()
    return cleanValue.length === 0
  }

  // Обновляем showError когда приходит внешняя ошибка
  useEffect(() => {
    if (haveError || descriptionError) {
      const currentDescription = descriptions[currentDynamicLang]?.description || ''
      // Показываем ошибку только если поле пустое и не было пользовательского ввода
      if (isDescriptionEmpty(currentDescription) && !hasUserInput) {
        setShowError(true)
      }
    }
  }, [haveError, descriptionError, currentDynamicLang, descriptions, hasUserInput])

  // Обработчик изменения значения
  const handleDescriptionChange = (val: string) => {
    console.log('value in mdEditor', val)

    // Если пользователь начал вводить - скрываем ошибку
    if (!hasUserInput) {
      setHasUserInput(true)
    }

    // Скрываем ошибку при любом вводе
    if (showError) {
      setShowError(false)
    }

    setDescriptionOne({language: currentDynamicLang, description: val})
    console.log('descriptions after set', descriptions)
  }

  // Сброс состояния при смене языка
  useEffect(() => {
    setHasUserInput(false)
    setShowError(false)
  }, [currentDynamicLang])

  return (
    <div className={styles.create__descriptions__box}>
      <ModalWindowDefault isOpen={isModalOpen} onClose={closeModal}>
        {modalImage && (
          <Image
            className={`${styles.drop__extra__image} ${styles.drop__extra__image__modal}`}
            src={modalImage}
            alt='Help image'
            width={1000}
            height={1000}
          />
        )}
      </ModalWindowDefault>
      <div className={`${styles.left}`}>
        <div className={`${styles.left__top__descr} ${showError ? styles.has__error : ''}`}>
          <div className={`${styles.descr__el__title}`}>
            <p className={`${styles.descr__title}`}>
              {t('descriptionPlaceholder')}{' '}
              <span className={`${styles.required} ${showError ? styles.required__error : ''}`}>*</span>
            </p>
            <Image
              onClick={() => openModal(HELP_IMAGES.description)}
              src={vopros}
              style={{cursor: 'pointer'}}
              alt='vopros'
              width={27}
              height={27}
            />
          </div>
          <div className={`${styles.editor__wrapper} ${showError ? styles.editor__error : ''}`}>
            <MarkdownEditor
              onValueChange={handleDescriptionChange}
              placeholder={t('writeDescription')}
              initialValue={descriptions[currentDynamicLang]?.description || ''}
            />
          </div>
          {showError && descriptionError && <p className={styles.error__message}>{descriptionError}</p>}
        </div>
      </div>
    </div>
  )
}

export default CreateDescriptionsElements
