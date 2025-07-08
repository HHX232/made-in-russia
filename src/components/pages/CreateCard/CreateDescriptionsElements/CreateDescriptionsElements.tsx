'use client'
import {FC, useState, useCallback, useRef, useEffect} from 'react'
import styles from './CreateDescriptionsElements.module.scss'
import Image from 'next/image'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import {MdEditor, ToolbarNames} from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import {HELP_IMAGES} from '../CreateCard'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'

const vopros = '/vopros.svg'

// Тип для маппинга blob URL -> File
export interface ImageMapping {
  blobUrl: string
  file: File
  // Можно добавить дополнительные поля
  uploadedUrl?: string // URL после загрузки на сервер
}

interface CreateDescriptionsElementsProps {
  initialDescr?: string
  initialAdditionalDescr?: string
  onSetDescr?: (descr: string) => void
  onSetAdditionalDescr?: (descr: string) => void
  // Новый колбэк для обработки загруженных изображений
  onImagesChange?: (images: ImageMapping[]) => void
  descriptionError?: string // Ошибка для основного описания
  imagesError?: string // Ошибка для изображений (не используется, так как изображения необязательны)
}

const CreateDescriptionsElements: FC<CreateDescriptionsElementsProps> = ({
  initialDescr,
  initialAdditionalDescr,
  onSetDescr,
  onSetAdditionalDescr,
  onImagesChange,
  descriptionError = ''
}) => {
  const [description, setDescription] = useState(initialDescr || '# Основное описание')
  const [additionalDescription, setAdditionalDescription] = useState(
    initialAdditionalDescr || '# Дополнительное описание'
  )

  // Локальное состояние для отображения ошибки с учетом фокуса
  const [showDescriptionError, setShowDescriptionError] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)

  // Храним маппинг blob URL -> File
  const imageMappingsRef = useRef<ImageMapping[]>([])
  const createdUrlsRef = useRef<Set<string>>(new Set())

  // Проверка, является ли описание пустым (только заголовок)
  const isDescriptionEmpty = (value: string) => {
    const cleanValue = value.replace(/^#\s*Основное описание\s*$/gm, '').trim()
    return cleanValue.length === 0
  }

  // Обработчик изменения основного описания
  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    setDescriptionTouched(true)

    // Проверяем, не пустое ли описание
    if (!isDescriptionEmpty(value)) {
      setShowDescriptionError(false)
    }

    if (onSetDescr) {
      onSetDescr(value)
    }
  }

  // Обработчик изменения дополнительного описания
  const handleAdditionalDescriptionChange = (value: string) => {
    setAdditionalDescription(value)
    if (onSetAdditionalDescr) {
      onSetAdditionalDescr(value)
    }
  }

  // Обработчик фокуса на основном описании
  const handleDescriptionFocus = () => {
    setDescriptionTouched(true)
  }

  // Обработчик потери фокуса на основном описании
  const handleDescriptionBlur = () => {
    if (descriptionError && isDescriptionEmpty(description)) {
      setShowDescriptionError(true)
    }
  }

  // Показываем ошибку, если есть внешняя ошибка и поле было затронуто
  useEffect(() => {
    if (descriptionError && descriptionTouched && isDescriptionEmpty(description)) {
      setShowDescriptionError(true)
    } else {
      setShowDescriptionError(false)
    }
  }, [descriptionError, descriptionTouched, description])

  const onUploadImg = useCallback(
    async (files: File[], callback: (urls: string[]) => void) => {
      const newMappings: ImageMapping[] = []

      // Проверка размера файлов
      const maxSize = 10 * 1024 * 1024 // 10MB
      const oversizedFiles = files.filter((file) => file.size > maxSize)

      if (oversizedFiles.length > 0) {
        alert(`Следующие файлы превышают максимальный размер (10MB): ${oversizedFiles.map((f) => f.name).join(', ')}`)
        // Фильтруем только подходящие файлы
        files = files.filter((file) => file.size <= maxSize)
      }

      // Проверка типа файлов
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const invalidFiles = files.filter((file) => !validTypes.includes(file.type))
      if (invalidFiles.length > 0) {
        alert(`This files are have invalid type: ${invalidFiles.map((f) => f.name).join(', ')}`)
        // Фильтруем только подходящие файлы
        files = files.filter((file) => validTypes.includes(file.type))
      }

      if (files.length === 0) {
        callback([])
        return
      }

      const urls = files.map((file) => {
        const blobUrl = URL.createObjectURL(file)
        createdUrlsRef.current.add(blobUrl)

        // Создаем маппинг для каждого файла
        const mapping: ImageMapping = {
          blobUrl,
          file
        }

        newMappings.push(mapping)
        return blobUrl
      })

      // Добавляем новые маппинги к существующим
      imageMappingsRef.current = [...imageMappingsRef.current, ...newMappings]

      // Уведомляем родительский компонент
      if (onImagesChange) {
        onImagesChange(imageMappingsRef.current)
      }

      callback(urls)
    },
    [onImagesChange]
  )

  // Очистка созданных URL при размонтировании
  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  // Функция для очистки неиспользуемых изображений
  useEffect(() => {
    // Проверяем, какие blob URL все еще используются в markdown
    const checkUnusedImages = () => {
      const allMarkdown = description + '\n' + additionalDescription

      // Находим все blob URL в markdown
      const usedBlobUrls = new Set<string>()
      const blobUrlRegex = /!\[.*?\]\((blob:[^\)]+)\)/g
      let match

      while ((match = blobUrlRegex.exec(allMarkdown)) !== null) {
        usedBlobUrls.add(match[1])
      }

      // Фильтруем только используемые изображения
      const activeImages = imageMappingsRef.current.filter((mapping) => usedBlobUrls.has(mapping.blobUrl))

      // Если список изменился, уведомляем родительский компонент
      if (activeImages.length !== imageMappingsRef.current.length) {
        imageMappingsRef.current = activeImages
        if (onImagesChange) {
          onImagesChange(activeImages)
        }
      }
    }

    // Проверяем при каждом изменении описаний
    checkUnusedImages()
  }, [description, additionalDescription, onImagesChange])

  const toolbars: ToolbarNames[] = [
    'bold',
    'underline',
    'italic',
    '-',
    'title',
    'strikeThrough',
    'sub',
    'sup',
    'quote',
    'unorderedList',
    'orderedList',
    'task',
    '-',
    'codeRow',
    'code',
    'link',
    '-',
    // 'image',
    'table',
    'mermaid',
    'katex',
    '-',
    'revoke',
    'next',
    'save',
    '=',
    'pageFullscreen',
    'fullscreen',
    'preview',
    'htmlPreview',
    'catalog'
  ]

  const editorConfig = {
    language: 'en-US' as const,
    theme: 'light' as const,
    previewTheme: 'default' as const,
    codeTheme: 'atom' as const,
    toolbars,
    footers: [],
    tableShape: [10, 10] as [number, number],
    showCodeRowNumber: true,
    autoFocus: false,
    disabled: false,
    readOnly: false,
    autoDetectCode: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => console.error('Ошибка редактора:', err),
    formatCopiedText: (text: string) => `${text}\n\n— Скопировано из редактора`,
    style: {
      height: '400px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px'
    }
  }

  // Конфиг для редактора с ошибкой
  const errorEditorConfig = {
    ...editorConfig,
    style: {
      ...editorConfig.style,
      border: showDescriptionError ? '1px solid #ff4444' : '1px solid #e0e0e0'
    }
  }

  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const indowWidth = useWindowWidth()
  const t = useTranslations('CreateDescription')
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
        <div className={`${styles.left__top__descr} ${showDescriptionError ? styles.has__error : ''}`}>
          <div className={`${styles.descr__el__title}`}>
            <p className={`${styles.descr__title}`}>
              {t('descriptionPlaceholder')}{' '}
              <span className={`${styles.required} ${showDescriptionError ? styles.required__error : ''}`}>*</span>
            </p>
            <DropList
              direction={indowWidth && indowWidth < 768 ? 'bottom' : 'right'}
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
            <MdEditor
              {...errorEditorConfig}
              value={description}
              onChange={handleDescriptionChange}
              placeholder={t('writeDescription')}
              onUploadImg={onUploadImg}
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
              direction={indowWidth && indowWidth < 768 ? 'bottom' : 'right'}
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
          <MdEditor
            {...editorConfig}
            value={additionalDescription}
            onChange={handleAdditionalDescriptionChange}
            placeholder={t('writeSecondDescr')}
            onUploadImg={onUploadImg}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateDescriptionsElements
