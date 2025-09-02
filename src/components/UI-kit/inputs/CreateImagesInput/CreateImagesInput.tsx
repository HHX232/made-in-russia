import {FC, useState, ChangeEvent, useEffect, useCallback, useMemo, memo} from 'react'
import styles from './CreateImagesInput.module.scss'
import Image from 'next/image'
import {toast} from 'sonner'
import SliderForCreateImages from './SliderForCreateImages/SliderForCreateImages'

const plusIcon = '/create-card/plus.svg'

interface CreateImagesInputProps {
  activeImages?: string[]
  onFilesChange: (files: File[]) => void
  onActiveImagesChange?: (remainingUrls: string[]) => void
  maxFiles?: number
  extraClass?: string
  errorValue?: string
  setErrorValue?: (value: string) => void
  minFiles?: number
  inputIdPrefix?: string
  // Существующие пропсы
  maxFileSize?: number // размер в байтах, по умолчанию 20 МБ
  allowMultipleFiles?: boolean // разрешена ли мульти загрузка, по умолчанию false
  allowedTypes?: string[] // массив разрешенных MIME типов, по умолчанию ['image/*', 'video/*'] без SVG
  // Новые пропсы
  isOnlyShow?: boolean // режим только просмотра, по умолчанию false
  showBigFirstItem?: boolean // показывать ли первый элемент большим, по умолчанию true
}

const ImagePreview = memo<{
  url: string | null
  file: File | null
  index: number
  onError: (index: number) => void
  loadError: boolean
  isOnlyShow?: boolean
  onImageClick?: (index: number) => void
}>(({url, file, index, onError, loadError, isOnlyShow, onImageClick}) => {
  const handleError = useCallback(() => {
    onError(index)
  }, [index, onError])
  const handleClick = useCallback(() => {
    if (isOnlyShow && onImageClick) {
      onImageClick(index)
    }
  }, [isOnlyShow, onImageClick, index])

  if (!url) return null

  if (file && file.type.startsWith('video/')) {
    return (
      <video
        src={url}
        className={`${styles.preview} ${isOnlyShow ? styles.clickable : ''}`}
        muted
        loop
        autoPlay
        onClick={handleClick}
        style={{cursor: isOnlyShow ? 'pointer' : 'default'}}
      />
    )
  }

  if (loadError) {
    return (
      <div className={styles.errorPreview}>
        <p>Ошибка загрузки</p>
        <small>{url}</small>
      </div>
    )
  }

  const isExternalUrl = url.startsWith('http://') || url.startsWith('https://')

  if (isExternalUrl) {
    return (
      <img
        src={url}
        alt={`Preview ${index}`}
        className={`${styles.preview} ${isOnlyShow ? styles.clickable : ''}`}
        onError={handleError}
        onClick={handleClick}
        style={{cursor: isOnlyShow ? 'pointer' : 'default'}}
      />
    )
  }

  return (
    <Image
      width={200}
      height={200}
      src={url}
      alt={`Preview ${index}`}
      className={`${styles.preview} ${isOnlyShow ? styles.clickable : ''}`}
      onError={handleError}
      onClick={handleClick}
      style={{cursor: isOnlyShow ? 'pointer' : 'default'}}
    />
  )
})

ImagePreview.displayName = 'ImagePreview'

// Мемоизированный компонент для отдельного элемента загрузки
const ImageUploadItem = memo<{
  index: number
  maxFiles: number
  inputIdPrefix: string
  previewUrl: string | null
  localFile: File | null
  loadError: boolean
  maxFileSize: number
  allowMultipleFiles: boolean
  allowedTypes: string[]
  acceptString: string
  showBigFirstItem: boolean
  isOnlyShow: boolean
  onFileChange: (index: number, file: File) => void
  onMultipleFilesChange: (index: number, files: FileList) => void
  onRemove: (index: number) => void
  onImageError: (index: number) => void
  onImageClick?: (index: number) => void
}>(
  ({
    index,
    inputIdPrefix,
    previewUrl,
    localFile,
    loadError,
    maxFileSize,
    allowMultipleFiles,
    allowedTypes,
    acceptString,
    showBigFirstItem,
    isOnlyShow,
    onFileChange,
    onMultipleFilesChange,
    onRemove,
    onImageError,
    onImageClick
  }) => {
    const [isHovered, setIsHovered] = useState(false)

    // Функция для проверки типа файла
    const isValidFileType = useCallback(
      (file: File) => {
        // Проверяем на SVG отдельно, чтобы исключить его
        if (file.type === 'image/svg+xml') {
          return false
        }

        return allowedTypes.some((type) => {
          if (type.endsWith('/*')) {
            const baseType = type.replace('/*', '/')
            return file.type.startsWith(baseType)
          }
          return file.type === type
        })
      },
      [allowedTypes]
    )

    const handleFileChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        if (isOnlyShow) return // Блокируем изменения в режиме только просмотра

        const files = e.target.files
        if (!files || files.length === 0) return

        if (allowMultipleFiles && files.length > 1) {
          // Валидация всех файлов при мульти загрузке
          const invalidFiles: string[] = []
          const oversizedFiles: string[] = []

          Array.from(files).forEach((file) => {
            if (!isValidFileType(file)) {
              invalidFiles.push(file.name)
            }
            if (file.size > maxFileSize) {
              oversizedFiles.push(file.name)
            }
          })

          if (invalidFiles.length > 0) {
            toast.error(
              <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
                <strong style={{display: 'block', marginBottom: 4}}>Ошибка загрузки данных</strong>
                <span>Недопустимые типы файлов: {invalidFiles.join(', ')}</span>
              </div>,
              {
                style: {
                  background: '#AC2525'
                }
              }
            )
            return
          }

          if (oversizedFiles.length > 0) {
            const maxSizeMB = Math.round(maxFileSize / (1024 * 1024))
            toast.error(
              <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
                <strong style={{display: 'block', marginBottom: 4}}>Ошибка загрузки данных</strong>
                <span>
                  Превышен размер файлов (макс. {maxSizeMB} МБ): {oversizedFiles.join(', ')}
                </span>
              </div>,
              {
                style: {
                  background: '#AC2525'
                }
              }
            )
            return
          }

          onMultipleFilesChange(index, files)
          return
        }

        // Обработка одного файла
        const file = files[0]

        if (!isValidFileType(file)) {
          toast.error(
            <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
              <strong style={{display: 'block', marginBottom: 4}}>Ошибка загрузки данных</strong>
              <span>Пожалуйста, выберите изображение или видео (SVG не поддерживается)</span>
            </div>,
            {
              style: {
                background: '#AC2525'
              }
            }
          )
          return
        }

        if (file.size > maxFileSize) {
          const maxSizeMB = Math.round(maxFileSize / (1024 * 1024))
          toast.error(
            <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
              <strong style={{display: 'block', marginBottom: 4}}>Ошибка загрузки данных</strong>
              <span>Размер файла не должен превышать {maxSizeMB} МБ</span>
            </div>,
            {
              style: {
                background: '#AC2525'
              }
            }
          )
          return
        }

        onFileChange(index, file)
      },
      [
        index,
        maxFileSize,
        allowMultipleFiles,
        allowedTypes,
        isValidFileType,
        onFileChange,
        onMultipleFilesChange,
        isOnlyShow
      ]
    )

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        if (isOnlyShow) return // Блокируем удаление в режиме только просмотра

        e.preventDefault()
        e.stopPropagation() // Предотвращаем всплытие события
        onRemove(index)
      },
      [index, onRemove, isOnlyShow]
    )

    const handleMouseEnter = useCallback(() => {
      if (!isOnlyShow) setIsHovered(true)
    }, [isOnlyShow])

    const handleMouseLeave = useCallback(() => setIsHovered(false), [])

    const handleLabelClick = useCallback(
      (e: React.MouseEvent) => {
        if (isOnlyShow && previewUrl && onImageClick) {
          e.preventDefault()
          onImageClick(index)
        }
      },
      [isOnlyShow, previewUrl, onImageClick, index]
    )

    const hasContent = previewUrl !== null
    const isBig = index === 0 && showBigFirstItem
    const inputId = `${inputIdPrefix}-${index}`

    return (
      <label
        className={`${styles.create__images__input__label} ${
          isBig ? styles.create__images__input__label__big : ''
        } ${hasContent ? styles.has__file : ''} ${isOnlyShow ? styles.readonly : ''}`}
        htmlFor={isOnlyShow ? undefined : inputId}
        id={`label-${inputId}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleLabelClick}
        style={{cursor: isOnlyShow && hasContent ? 'pointer' : isOnlyShow ? 'default' : 'pointer'}}
      >
        {hasContent && (
          <>
            <ImagePreview
              url={previewUrl}
              file={localFile}
              index={index}
              onError={onImageError}
              loadError={loadError}
              isOnlyShow={isOnlyShow}
              onImageClick={onImageClick}
            />
            {isHovered && !isOnlyShow && (
              <div className={styles.remove__overlay} onClick={handleRemove}>
                <svg width='26' height='2' viewBox='0 0 26 2' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M24.6668 1H1.3335' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' />
                </svg>
              </div>
            )}
          </>
        )}

        {!hasContent && !isOnlyShow && <Image src={plusIcon} alt='plus' width={24} height={24} />}

        {!isOnlyShow && (
          <input
            type='file'
            id={inputId}
            accept={acceptString}
            multiple={allowMultipleFiles}
            onChange={handleFileChange}
            style={{display: 'none'}}
          />
        )}
      </label>
    )
  }
)

ImageUploadItem.displayName = 'ImageUploadItem'

const CreateImagesInput: FC<CreateImagesInputProps> = ({
  activeImages = [],
  onFilesChange,
  onActiveImagesChange,
  maxFiles = 11,
  extraClass = '',
  errorValue = '',
  setErrorValue,
  minFiles = 0,
  inputIdPrefix = 'images',
  maxFileSize = 20 * 1024 * 1024, // 20 МБ
  allowMultipleFiles = false,
  allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/mov',
    'video/avi'
  ],
  // Новые пропсы с значениями по умолчанию
  isOnlyShow = false,
  showBigFirstItem = true
}) => {
  const [localFiles, setLocalFiles] = useState<(File | null)[]>(() => new Array(maxFiles).fill(null))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImages, setModalImages] = useState<string[]>([])

  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(() => {
    const urls = new Array(maxFiles).fill(null)
    activeImages.forEach((url, index) => {
      if (index < maxFiles) {
        urls[index] = url
      }
    })
    return urls
  })

  const [loadError, setLoadError] = useState<{[key: number]: boolean}>({})
  const [removedInitialImages, setRemovedInitialImages] = useState<Set<number>>(new Set())

  // Создаем строку для атрибута accept
  const acceptString = useMemo(() => {
    // Исключаем SVG из image/*
    const filteredTypes = allowedTypes.map((type) => {
      if (type === 'image/*') {
        return 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
      }
      return type
    })
    return filteredTypes.join(',')
  }, [allowedTypes])

  // Определяем количество элементов для отображения
  const itemsToShow = useMemo(() => {
    if (isOnlyShow) {
      return activeImages.length
    }
    return maxFiles
  }, [isOnlyShow, activeImages.length, maxFiles])

  // Функция для переупорядочивания массива изображений
  const reorderImages = useCallback((clickedIndex: number, images: string[]) => {
    if (clickedIndex === 0) return images // Если нажали на первое, порядок не меняется

    const reordered = [...images]
    const clickedItem = reordered[clickedIndex]

    // Перемещаем выбранный элемент в начало
    reordered.splice(clickedIndex, 1)
    reordered.unshift(clickedItem)

    return reordered
  }, [])

  // Обработчик клика по изображению в режиме просмотра
  const handleImageClick = useCallback(
    (clickedIndex: number) => {
      if (!isOnlyShow) return

      // Фильтруем только существующие изображения
      const validImages = activeImages.filter((img) => img && img.trim() !== '')

      if (validImages.length === 0) return

      // Переупорядочиваем массив так, чтобы выбранное изображение было первым
      const reorderedImages = reorderImages(clickedIndex, validImages)

      setModalImages(reorderedImages)
      setIsModalOpen(true)
    },
    [isOnlyShow, activeImages, reorderImages]
  )

  // Закрытие модального окна
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setModalImages([])
  }, [])

  // Мемоизируем функцию подсчета изображений
  const totalImagesCount = useMemo(() => {
    if (isOnlyShow) {
      return activeImages.length
    }

    let count = 0
    for (let i = 0; i < maxFiles; i++) {
      if (localFiles[i] || (previewUrls[i] && !removedInitialImages.has(i))) {
        count++
      }
    }
    return count
  }, [localFiles, previewUrls, removedInitialImages, maxFiles, isOnlyShow, activeImages.length])

  // Мемоизируем функцию проверки и сброса ошибки
  const checkAndClearError = useCallback(() => {
    if (errorValue && setErrorValue && totalImagesCount >= minFiles) {
      setErrorValue('')
    }
  }, [errorValue, setErrorValue, totalImagesCount, minFiles])

  // Мемоизируем callback для изменения файлов
  const handleFileChange = useCallback(
    (index: number, file: File) => {
      if (isOnlyShow) return

      const url = URL.createObjectURL(file)

      setLocalFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = file
        return newFiles
      })

      setPreviewUrls((prev) => {
        const newUrls = [...prev]
        // Очищаем старый URL если был создан из файла
        if (prev[index] && localFiles[index]) {
          URL.revokeObjectURL(prev[index]!)
        }
        newUrls[index] = url
        return newUrls
      })

      // Убираем из списка удаленных, если заменяем удаленное изображение
      setRemovedInitialImages((prev) => {
        if (prev.has(index)) {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        }
        return prev
      })

      // Сбрасываем ошибку загрузки
      setLoadError((prev) => ({...prev, [index]: false}))

      // Обновляем файлы в родителе
      setLocalFiles((currentFiles) => {
        const updatedFiles = [...currentFiles]
        updatedFiles[index] = file
        onFilesChange(updatedFiles.filter((f) => f !== null) as File[])
        return updatedFiles
      })
    },
    [localFiles, onFilesChange, isOnlyShow]
  )

  // Новый callback для мульти загрузки
  const handleMultipleFilesChange = useCallback(
    (startIndex: number, files: FileList) => {
      if (isOnlyShow) return

      const fileArray = Array.from(files)

      // Находим все свободные слоты
      const freeSlots: number[] = []
      for (let i = 0; i < maxFiles; i++) {
        if (!localFiles[i] && !previewUrls[i]) {
          freeSlots.push(i)
        }
      }

      // Если свободных слотов меньше чем файлов, предупреждаем пользователя
      if (freeSlots.length < fileArray.length) {
        toast.error(
          <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>Недостаточно свободных слотов</strong>
            <span>
              Доступно: {freeSlots.length}, выбрано файлов: {fileArray.length}
            </span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
      }

      // Обрабатываем столько файлов, сколько есть свободных слотов
      const filesToProcess = fileArray.slice(0, freeSlots.length)

      const newFiles = [...localFiles]
      const newUrls = [...previewUrls]
      const newLoadError = {...loadError}

      filesToProcess.forEach((file, index) => {
        const slotIndex = freeSlots[index]
        const url = URL.createObjectURL(file)

        newFiles[slotIndex] = file
        newUrls[slotIndex] = url
        newLoadError[slotIndex] = false
      })

      setLocalFiles(newFiles)
      setPreviewUrls(newUrls)
      setLoadError(newLoadError)

      // Обновляем файлы в родителе
      onFilesChange(newFiles.filter((f) => f !== null) as File[])
    },
    [localFiles, previewUrls, loadError, maxFiles, onFilesChange, isOnlyShow]
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (isOnlyShow) return

      // Очищаем URL только если это был загруженный файл
      if (previewUrls[index] && localFiles[index]) {
        URL.revokeObjectURL(previewUrls[index]!)
      }

      setLocalFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = null
        return newFiles
      })

      setPreviewUrls((prev) => {
        const newUrls = [...prev]
        newUrls[index] = null
        return newUrls
      })

      // Если это было начальное изображение, добавляем в список удаленных
      if (activeImages[index] && !localFiles[index]) {
        setRemovedInitialImages((prev) => {
          const newSet = new Set(prev).add(index)

          // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: НЕ делаем фильтрацию с изменением позиций
          if (onActiveImagesChange) {
            // Создаем новый массив с сохранением позиций
            const updatedImages = [...activeImages]
            updatedImages[index] = '' // Заменяем на пустую строку вместо удаления

            // Убираем все пустые строки только в конце массива для экономии места
            while (updatedImages.length > 0 && updatedImages[updatedImages.length - 1] === '') {
              updatedImages.pop()
            }

            onActiveImagesChange(updatedImages)
          }

          return newSet
        })
      } else {
        // Если удаляем локально загруженный файл
        if (onActiveImagesChange) {
          // Просто передаем текущие activeImages без изменений
          onActiveImagesChange([...activeImages])
        }
      }

      setLoadError((prev) => ({...prev, [index]: false}))

      // Обновляем файлы в родителе
      setLocalFiles((currentFiles) => {
        const updatedFiles = [...currentFiles]
        updatedFiles[index] = null
        onFilesChange(updatedFiles.filter((f) => f !== null) as File[])
        return updatedFiles
      })
    },
    [previewUrls, localFiles, activeImages, onActiveImagesChange, onFilesChange, isOnlyShow]
  )

  useEffect(() => {
    if (activeImages.length > 0) {
      setPreviewUrls((prev) => {
        const newUrls = isOnlyShow
          ? activeImages.map((url) => url || null) // Сохраняем позиции
          : [...prev]

        if (!isOnlyShow) {
          let hasChanges = false
          activeImages.forEach((url, index) => {
            if (index < maxFiles && !localFiles[index] && !removedInitialImages.has(index)) {
              if (newUrls[index] !== url && url !== '') {
                // Игнорируем пустые строки
                newUrls[index] = url
                hasChanges = true
              }
            }
          })
          return hasChanges ? newUrls : prev
        }

        return newUrls
      })
    }
  }, [activeImages, maxFiles, localFiles, removedInitialImages, isOnlyShow])

  // В CreateImagesInput добавить:
  useEffect(() => {
    if (activeImages.length > 0) {
      setPreviewUrls(() => {
        const newUrls = new Array(maxFiles).fill(null)

        activeImages.forEach((url, index) => {
          if (index < maxFiles && !removedInitialImages.has(index)) {
            newUrls[index] = url
          }
        })

        // Сохраняем локально загруженные файлы
        localFiles.forEach((file, index) => {
          if (file && newUrls[index] === null) {
            newUrls[index] = URL.createObjectURL(file)
          }
        })

        return newUrls
      })
    }
  }, [activeImages, removedInitialImages, localFiles, maxFiles])

  // Мемоизируем callback для ошибок изображений
  const handleImageError = useCallback((index: number) => {
    setLoadError((prev) => ({...prev, [index]: true}))
  }, [])

  // Эффект для обновления при изменении activeImages
  useEffect(() => {
    if (activeImages.length > 0) {
      setPreviewUrls((prev) => {
        const newUrls = isOnlyShow
          ? activeImages.map((url) => url) // В режиме только просмотра берем только activeImages
          : [...prev]

        if (!isOnlyShow) {
          let hasChanges = false
          activeImages.forEach((url, index) => {
            if (index < maxFiles && !localFiles[index] && !removedInitialImages.has(index)) {
              if (newUrls[index] !== url) {
                newUrls[index] = url
                hasChanges = true
              }
            }
          })
          return hasChanges ? newUrls : prev
        }

        return newUrls
      })
    }
  }, [activeImages, maxFiles, localFiles, removedInitialImages, isOnlyShow])

  // Эффект для проверки ошибок
  useEffect(() => {
    if (!isOnlyShow) {
      checkAndClearError()
    }
  }, [checkAndClearError, isOnlyShow])

  // Мемоизируем массив элементов
  const uploadItems = useMemo(() => {
    return Array.from({length: itemsToShow}).map((_, index) => (
      <ImageUploadItem
        key={index}
        index={index}
        maxFiles={maxFiles}
        inputIdPrefix={inputIdPrefix}
        previewUrl={previewUrls[index] || null}
        localFile={localFiles[index]}
        loadError={loadError[index] || false}
        maxFileSize={maxFileSize}
        allowMultipleFiles={allowMultipleFiles}
        allowedTypes={allowedTypes}
        acceptString={acceptString}
        showBigFirstItem={showBigFirstItem}
        isOnlyShow={isOnlyShow}
        onFileChange={handleFileChange}
        onMultipleFilesChange={handleMultipleFilesChange}
        onRemove={handleRemove}
        onImageError={handleImageError}
        onImageClick={isOnlyShow ? handleImageClick : undefined}
      />
    ))
  }, [
    itemsToShow,
    maxFiles,
    inputIdPrefix,
    previewUrls,
    localFiles,
    loadError,
    maxFileSize,
    allowMultipleFiles,
    allowedTypes,
    acceptString,
    showBigFirstItem,
    isOnlyShow,
    handleFileChange,
    handleMultipleFilesChange,
    handleRemove,
    handleImageError,
    handleImageClick
  ])

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.create__images__input} ${extraClass} ${errorValue ? styles.error : ''} ${isOnlyShow ? styles.readonly : ''}`}
      >
        {uploadItems}
      </div>
      {!isOnlyShow && (
        <div className={styles.info__block}>{errorValue && <p className={styles.error__message}>{errorValue}</p>}</div>
      )}

      {/* Модальное окно для просмотра изображений */}
      {isOnlyShow && isModalOpen && (
        <SliderForCreateImages
          isModalOpen={isModalOpen}
          images={modalImages}
          initialIndex={0}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default CreateImagesInput
