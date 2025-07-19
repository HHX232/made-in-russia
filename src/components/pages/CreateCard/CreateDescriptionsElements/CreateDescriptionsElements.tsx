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
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
// import {useTypedSelector} from '@/hooks/useTypedSelector'

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
  setFullObjectForDescriptions: (obj: {
    ru: {description: string; additionalDescription: string}
    en: {description: string; additionalDescription: string}
    zh: {description: string; additionalDescription: string}
  }) => void
}

const CreateDescriptionsElements: FC<CreateDescriptionsElementsProps> = ({
  onImagesChange,
  descriptionError = '',
  currentDynamicLang,
  fullObjectForDescriptions,
  setFullObjectForDescriptions
}) => {
  const [copyFullObject, setCopyFullObject] = useState(
    fullObjectForDescriptions || {
      ru: {description: '## Основное описание', additionalDescription: '# Дополнительное описание'},
      en: {description: '## Main description', additionalDescription: '# Additional description'},
      zh: {description: '## 主要描述', additionalDescription: '# 附加描述'}
    }
  )

  const {setDescriptionOne} = useActions()
  const {descriptions} = useTypedSelector((state) => state.multilingualDescriptions)

  const currentDescriptionForRu = useRef(fullObjectForDescriptions?.ru.description || '# Основное описание')
  const currentDescriptionForEn = useRef(fullObjectForDescriptions?.en.description || '# Main description')
  const currentDescriptionForZh = useRef(fullObjectForDescriptions?.zh.description || '# 主要描述')

  const currentAdditionalDescriptionForRu = useRef(
    fullObjectForDescriptions?.ru.additionalDescription || '# Дополнительное описание'
  )
  const currentAdditionalDescriptionForEn = useRef(
    fullObjectForDescriptions?.en.additionalDescription || '# Additional description'
  )
  const currentAdditionalDescriptionForZh = useRef(fullObjectForDescriptions?.zh.additionalDescription || '# 附加描述')

  // Синхронизируем рефы с состоянием при смене языка или обновлении объекта
  useEffect(() => {
    currentDescriptionForRu.current = copyFullObject.ru.description
    currentDescriptionForEn.current = copyFullObject.en.description
    currentDescriptionForZh.current = copyFullObject.zh.description

    currentAdditionalDescriptionForRu.current = copyFullObject.ru.additionalDescription
    currentAdditionalDescriptionForEn.current = copyFullObject.en.additionalDescription
    currentAdditionalDescriptionForZh.current = copyFullObject.zh.additionalDescription
  }, [currentDynamicLang, copyFullObject])

  // Синхронизируем локальную копию с пропсом при изменении извне
  useEffect(() => {
    if (fullObjectForDescriptions) {
      setCopyFullObject(fullObjectForDescriptions)
    }
  }, [fullObjectForDescriptions])

  const handlerFullObjectAdditionalDescr = (val: string) => {
    if (currentDynamicLang === 'ru') {
      currentAdditionalDescriptionForRu.current = val
      // setDescription({language: 'ru', description: val})
    } else if (currentDynamicLang === 'en') {
      currentAdditionalDescriptionForEn.current = val
      // setDescription({language: 'en', description: val})
    } else if (currentDynamicLang === 'zh') {
      currentAdditionalDescriptionForZh.current = val
    }

    // Создаем новый объект с актуальными значениями из рефов
    const updatedObject = {
      ru: {
        description: copyFullObject.ru.description,
        additionalDescription: currentAdditionalDescriptionForRu.current || ''
      },
      en: {
        description: copyFullObject.en.description,
        additionalDescription: currentAdditionalDescriptionForEn.current || ''
      },
      zh: {
        description: copyFullObject.zh.description,
        additionalDescription: currentAdditionalDescriptionForZh.current || ''
      }
    }

    setCopyFullObject(updatedObject)
    // setFullObjectForDescriptions(updatedObject)
  }

  // Локальное состояние для отображения ошибки с учетом фокуса
  const [showDescriptionError, setShowDescriptionError] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)

  // Храним маппинг blob URL -> File
  const imageMappingsRef = useRef<ImageMapping[]>([])
  const createdUrlsRef = useRef<Set<string>>(new Set())

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
    const currentDescription = copyFullObject[currentDynamicLang].description
    if (descriptionError && isDescriptionEmpty(currentDescription)) {
      setShowDescriptionError(true)
    }
  }

  // Показываем ошибку, если есть внешняя ошибка и поле было затронуто
  useEffect(() => {
    const currentDescription = copyFullObject[currentDynamicLang].description
    if (descriptionError && descriptionTouched && isDescriptionEmpty(currentDescription)) {
      setShowDescriptionError(true)
    } else {
      setShowDescriptionError(false)
    }
  }, [descriptionError, descriptionTouched, currentDynamicLang, copyFullObject])

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
      const currentDescription = copyFullObject[currentDynamicLang].description
      const currentAdditionalDescription = copyFullObject[currentDynamicLang].additionalDescription
      const allMarkdown = currentDescription + '\n' + currentAdditionalDescription

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
  }, [copyFullObject, currentDynamicLang, onImagesChange])

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

  // ! –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  // ! –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  // ! –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const windowWidth = useWindowWidth()
  const t = useTranslations('CreateDescription')

  const onlyLocalRuRef = useRef<string>('')
  const onlyLocalEnRef = useRef<string>('')
  const onlyLocalZhRef = useRef<string>('')
  const lastActiveLangRef = useRef<string[]>([])

  useEffect(() => {
    lastActiveLangRef.current.push(currentDynamicLang)
  }, [currentDynamicLang])

  const handleLocalObjectChange = (value: string) => {
    console.log('lastActiveLangRef', lastActiveLangRef.current)
    const valueFromRef =
      lastActiveLangRef.current[lastActiveLangRef.current.length - 2] === 'ru'
        ? onlyLocalRuRef.current
        : lastActiveLangRef.current[lastActiveLangRef.current.length - 2] === 'en'
          ? onlyLocalEnRef.current
          : onlyLocalZhRef.current

    // Новая проверка с учетом сравнения без последнего символа
    if (
      value === valueFromRef ||
      (value.slice(0, 3) === valueFromRef.slice(0, 3) &&
        value.slice(0, -1) === valueFromRef &&
        value.length === valueFromRef.length) ||
      (value.slice(0, 3) === valueFromRef.slice(0, 3) &&
        value === valueFromRef.slice(0, -1) &&
        value.length === valueFromRef.length)
    ) {
      console.log('Значения совпадают (с учетом последнего символа)')
      return
    }
    const valueThreeBack =
      lastActiveLangRef.current[lastActiveLangRef.current.length - 3] === 'ru'
        ? onlyLocalRuRef.current
        : lastActiveLangRef.current[lastActiveLangRef.current.length - 3] === 'en'
          ? onlyLocalEnRef.current
          : onlyLocalZhRef.current
    if (valueThreeBack.length > 0 && value.length > 0 && valueThreeBack === value) {
      console.log('Значения совпадают (с учетом третьего последнего символа)')
      return
    }

    if (currentDynamicLang === 'ru') {
      onlyLocalRuRef.current = value
      // updateDescriptionForLanguage({language: 'ru', description: {description: value}})
    } else if (currentDynamicLang === 'en') {
      onlyLocalEnRef.current = value
      // updateDescriptionForLanguage({language: 'en', description: {description: value}})
    } else if (currentDynamicLang === 'zh') {
      onlyLocalZhRef.current = value
      // updateDescriptionForLanguage({language: 'zh', description: {description: value}})
    }
  }

  useEffect(() => {
    const newObject = {
      ru: {
        description: onlyLocalRuRef.current,
        additionalDescription: ''
      },
      en: {
        description: onlyLocalEnRef.current,
        additionalDescription: ''
      },
      zh: {
        description: onlyLocalZhRef.current,
        additionalDescription: ''
      }
    }
    setFullObjectForDescriptions(newObject)
    console.log('newObject', newObject, 'fullObjectForDescriptions', fullObjectForDescriptions)
  }, [JSON.stringify(onlyLocalRuRef), JSON.stringify(onlyLocalEnRef), JSON.stringify(onlyLocalZhRef)])

  // useEffect(() => {
  //   const newObject = {
  //     ru: {
  //       description: onlyLocalRuRef.current,
  //       additionalDescription: ''
  //     },
  //     en: {
  //       description: onlyLocalEnRef.current,
  //       additionalDescription: ''
  //     },
  //     zh: {
  //       description: onlyLocalZhRef.current,
  //       additionalDescription: ''
  //     }
  //   }
  //   setFullObjectForDescriptions(newObject)
  // }, [incrementForMainDescrRef])
  // let localValueForDescr =
  //   currentDynamicLang === 'ru'
  //     ? onlyLocalRuRef.current
  //     : currentDynamicLang === 'en'
  //       ? onlyLocalEnRef.current
  //       : onlyLocalZhRef.current

  // useEffect(() => {
  //   if (currentDynamicLang === 'ru') {
  //     localValueForDescr = onlyLocalRuRef.current
  //   } else if (currentDynamicLang === 'en') {
  //     localValueForDescr = onlyLocalEnRef.current
  //   } else if (currentDynamicLang === 'zh') {
  //     localValueForDescr = onlyLocalZhRef.current
  //   }
  // }, [currentDynamicLang])

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
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
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
              value={descriptions[currentDynamicLang].description}
              onChange={(val) => {
                handleLocalObjectChange(val)
                // console.log('ru ref', onlyLocalRuRef.current)
                // console.log('en ref', onlyLocalEnRef.current)
                // console.log('zh ref', onlyLocalZhRef.current)
                // console.log('val', val)
                setDescriptionOne({language: currentDynamicLang, description: val})
              }}
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
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
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
            value={copyFullObject[currentDynamicLang].additionalDescription}
            onChange={handlerFullObjectAdditionalDescr}
            placeholder={t('writeSecondDescr')}
            onUploadImg={onUploadImg}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateDescriptionsElements
