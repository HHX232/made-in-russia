'use client'
import {FC, useState, useRef, useEffect} from 'react'
import styles from './CreateDescriptionsElements.module.scss'
import Image from 'next/image'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import {HELP_IMAGES} from '../CreateCard'
import {useTranslations} from 'next-intl'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'

const vopros = '/vopros.svg'

// Тип для маппинга blob URL -> File
export interface ImageMapping {
  blobUrl: string
  file: File
  // Можно добавить дополнительные поля
  uploadedUrl?: string // URL после загрузки на сервер
}

interface CreateDescriptionsElementsProps {
  onImagesChange?: (images: ImageMapping[]) => void
  descriptionError?: string // Ошибка для основного описания
  imagesError?: string // Ошибка для изображений (не используется, так как изображения необязательны)
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
  currentDynamicLang
  // fullObjectForDescriptions,
  // setFullObjectForDescriptions
}) => {
  const {setDescriptionOne, setAdditionalDescription} = useActions()
  const {descriptions} = useTypedSelector((state) => state.multilingualDescriptions)

  // Локальное состояние для отображения ошибки с учетом фокуса
  const [showDescriptionError, setShowDescriptionError] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)

  // Проверка, является ли описание пустым (только заголовок)
  const isDescriptionEmpty = (value: string) => {
    const cleanValue = value.replace(/^#\s*[^\n]*\s*$/gm, '').trim()
    return cleanValue.length === 0
  }

  // Обработчик фокуса на основном описании
  const handleDescriptionFocus = () => {
    setDescriptionTouched(true)
  }

  // Обработчик потери фокуса на основном описании
  const handleDescriptionBlur = () => {
    const currentDescription = descriptions[currentDynamicLang].description
    if (descriptionError && isDescriptionEmpty(currentDescription)) {
      setShowDescriptionError(true)
    }
  }

  // Показываем ошибку, если есть внешняя ошибка и поле было затронуто
  useEffect(() => {
    const currentDescription = descriptions[currentDynamicLang].description
    if (descriptionError && descriptionTouched && isDescriptionEmpty(currentDescription)) {
      setShowDescriptionError(true)
    } else {
      setShowDescriptionError(false)
    }
  }, [descriptionError, descriptionTouched, currentDynamicLang, descriptions])

  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const t = useTranslations('CreateDescription')

  const lastActiveLangRef = useRef<string[]>([])

  useEffect(() => {
    lastActiveLangRef.current.push(currentDynamicLang)
  }, [currentDynamicLang])

  return (
    <div className={styles.create__descriptions__box}>
      {/* <div style={{display: 'flex', flexDirection: 'column'}} className=''>
        <p>{'RU DeSCR' + descriptions['ru'].description}</p>
        <p>{'EN DeSCR' + descriptions['en'].description}</p>
        <p>{'ZH DeSCR' + descriptions['zh'].description}</p>
      </div> */}
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
        <div className={`${styles.left__top__descr} ${showDescriptionError ? styles.has__error : ''}`}>
          <div className={`${styles.descr__el__title}`}>
            <p className={`${styles.descr__title}`}>
              {t('descriptionPlaceholder')}{' '}
              <span className={`${styles.required} ${showDescriptionError ? styles.required__error : ''}`}>*</span>
            </p>
            <DropList
              direction={'bottom'}
              safeAreaEnabled
              extraClass={`${styles.drop__extra}`}
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='vopros' width={27} height={27} />}
              items={[
                <Image
                  onClick={() => openModal(HELP_IMAGES.description)}
                  src={HELP_IMAGES.description}
                  alt='vopros'
                  width={300}
                  height={300}
                  key={1}
                />
              ]}
            />
          </div>
          <div className={styles.editor__wrapper} onFocus={handleDescriptionFocus} onBlur={handleDescriptionBlur}>
            <TextAreaUI
              extraClass={`${styles.editor__extra__text}`}
              rows={18}
              onSetValue={(val) => setDescriptionOne({language: currentDynamicLang, description: val})}
              currentValue={descriptions[currentDynamicLang].description}
              placeholder={t('writeDescription')}
              theme='superWhite'
            />
          </div>
          {showDescriptionError && <p className={styles.error__message}>{descriptionError}</p>}
        </div>
        <div className={`${styles.left__bottom__descr}`}>
          <div className={`${styles.descr__el__title}`}>
            <p className={`${styles.descr__title}`}>
              {t('secondDescr')}
              <span className={styles.optional}>({t('secondDescrSpan')})</span>
            </p>
            <DropList
              direction={'left'}
              safeAreaEnabled
              extraClass={`${styles.drop__extra} ${styles.second__drop__extra}`}
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='vopros' width={27} height={27} />}
              items={[
                <Image
                  onClick={() => openModal(HELP_IMAGES.description)}
                  src={HELP_IMAGES.description}
                  alt='vopros'
                  width={300}
                  height={300}
                  key={1}
                />
              ]}
            />
          </div>

          <TextAreaUI
            theme='superWhite'
            rows={15}
            extraClass={`${styles.editor__extra__text}`}
            onSetValue={(val) => setAdditionalDescription({language: currentDynamicLang, additionalDescription: val})}
            currentValue={descriptions[currentDynamicLang].additionalDescription}
            placeholder={t('writeSecondDescr')}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateDescriptionsElements
