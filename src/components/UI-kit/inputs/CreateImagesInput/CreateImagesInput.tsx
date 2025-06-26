import {FC, useState, ChangeEvent, useEffect} from 'react'
import styles from './CreateImagesInput.module.scss'
import Image from 'next/image'

const plusIcon = '/create-card/plus.svg'

interface CreateImagesInputProps {
  activeImages?: string[] // Массив ссылок на изображения для инициализации
  onFilesChange: (files: File[]) => void // Функция возврата массива файлов
  onActiveImagesChange?: (remainingUrls: string[]) => void // Колбэк для уведомления об удалении начальных изображений
  maxFiles?: number // Максимальное количество файлов
  extraClass?: string
  errorValue?: string // Текст ошибки
  setErrorValue?: (value: string) => void // Функция для сброса ошибки
  minFiles?: number // Минимальное количество файлов для валидации
  inputIdPrefix?: string // Префикс для уникальных id инпутов
}

const CreateImagesInput: FC<CreateImagesInputProps> = ({
  activeImages = [],
  onFilesChange,
  onActiveImagesChange,
  maxFiles = 11,
  extraClass,
  errorValue = '',
  setErrorValue,
  minFiles = 0,
  inputIdPrefix = 'images' // Значение по умолчанию
}) => {
  const [localFiles, setLocalFiles] = useState<(File | null)[]>(new Array(maxFiles).fill(null))
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(() => {
    // Инициализируем с activeImages
    const urls = new Array(maxFiles).fill(null)
    activeImages.forEach((url, index) => {
      if (index < maxFiles) {
        urls[index] = url
      }
    })
    return urls
  })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<{[key: number]: boolean}>({})
  // Отслеживаем, какие изображения были удалены из начальных
  const [removedInitialImages, setRemovedInitialImages] = useState<Set<number>>(new Set())

  // Эффект для обновления при изменении activeImages
  useEffect(() => {
    if (activeImages.length > 0) {
      setPreviewUrls((prev) => {
        const newUrls = [...prev]
        activeImages.forEach((url, index) => {
          // Проверяем, не было ли это изображение удалено пользователем
          if (index < maxFiles && !localFiles[index] && !removedInitialImages.has(index)) {
            newUrls[index] = url
          }
        })
        return newUrls
      })
    }
  }, [activeImages, maxFiles])

  // Функция для подсчета всех изображений (файлы + оставшиеся начальные)
  const getTotalImagesCount = () => {
    let count = 0
    for (let i = 0; i < maxFiles; i++) {
      if (localFiles[i] || (previewUrls[i] && !removedInitialImages.has(i))) {
        count++
      }
    }
    return count
  }

  // Функция для проверки и сброса ошибки
  const checkAndClearError = () => {
    const totalCount = getTotalImagesCount()
    if (errorValue && setErrorValue && totalCount >= minFiles) {
      setErrorValue('')
    }
  }

  const handleFileChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
    if (!isValidType) {
      alert('Пожалуйста, выберите изображение или видео')
      return
    }

    // Проверяем размер файла (например, максимум 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB в байтах
    if (file.size > maxSize) {
      alert('Размер файла не должен превышать 10MB')
      return
    }

    // Создаем preview URL
    const url = URL.createObjectURL(file)

    // Обновляем состояние
    const newFiles = [...localFiles]
    const newUrls = [...previewUrls]

    // Очищаем старый URL если был создан из файла (не из activeImages)
    if (previewUrls[index] && localFiles[index]) {
      URL.revokeObjectURL(previewUrls[index]!)
    }

    newFiles[index] = file
    newUrls[index] = url

    setLocalFiles(newFiles)
    setPreviewUrls(newUrls)

    // Если мы заменяем удаленное начальное изображение, убираем индекс из списка удаленных
    if (removedInitialImages.has(index)) {
      setRemovedInitialImages((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }

    // Сбрасываем ошибку загрузки для этого индекса
    setLoadError((prev) => ({...prev, [index]: false}))

    // Проверяем ошибку
    checkAndClearError()

    // Вызываем callback с обновленными файлами
    onFilesChange(newFiles.filter((f) => f !== null) as File[])
  }

  const handleRemove = (index: number) => {
    // Очищаем URL только если это был загруженный файл
    if (previewUrls[index] && localFiles[index]) {
      URL.revokeObjectURL(previewUrls[index]!)
    }

    // Обновляем состояние
    const newFiles = [...localFiles]
    const newUrls = [...previewUrls]

    newFiles[index] = null
    newUrls[index] = null

    setLocalFiles(newFiles)
    setPreviewUrls(newUrls)

    // Если это было начальное изображение, добавляем индекс в список удаленных
    if (activeImages[index] && !localFiles[index]) {
      setRemovedInitialImages((prev) => new Set(prev).add(index))

      // Уведомляем родителя об удалении начального изображения
      if (onActiveImagesChange) {
        const remainingUrls = activeImages.filter((_, i) => {
          return i !== index && !removedInitialImages.has(i)
        })
        onActiveImagesChange(remainingUrls)
      }
    }

    // Сбрасываем ошибку загрузки для этого индекса
    setLoadError((prev) => ({...prev, [index]: false}))

    // Вызываем callback с обновленными файлами
    onFilesChange(newFiles.filter((f) => f !== null) as File[])
  }

  const handleImageError = (index: number) => {
    setLoadError((prev) => ({...prev, [index]: true}))
  }

  const renderPreview = (url: string | null, file: File | null, index: number) => {
    if (!url) return null

    // Если это файл и он видео
    if (file && file.type.startsWith('video/')) {
      return <video src={url} className={styles.preview} muted loop autoPlay />
    }

    // Проверяем, является ли URL внешним (http/https)
    const isExternalUrl = url.startsWith('http://') || url.startsWith('https://')

    // Если произошла ошибка загрузки изображения
    if (loadError[index]) {
      return (
        <div className={styles.errorPreview}>
          <p>Ошибка загрузки</p>
          <small>{url}</small>
        </div>
      )
    }

    // Для внешних URL используем обычный img тег
    if (isExternalUrl) {
      return (
        <img src={url} alt={`Preview ${index}`} className={styles.preview} onError={() => handleImageError(index)} />
      )
    }

    // Для локальных изображений (blob URL) используем Next.js Image
    return (
      <Image
        width={200}
        height={200}
        src={url}
        alt={`Preview ${index}`}
        className={styles.preview}
        onError={() => handleImageError(index)}
      />
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.create__images__input} ${extraClass} ${errorValue ? styles.error : ''}`}>
        {Array.from({length: maxFiles}).map((_, index) => {
          const hasContent = previewUrls[index] !== null
          const isHovered = hoveredIndex === index
          const isBig = index === 0
          // Генерируем уникальный id для каждого input
          const inputId = `${inputIdPrefix}-${index}`

          return (
            <label
              key={index}
              className={`${styles.create__images__input__label} ${
                isBig ? styles.create__images__input__label__big : ''
              } ${hasContent ? styles.has__file : ''}`}
              htmlFor={inputId}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hasContent && previewUrls[index] && (
                <>
                  {renderPreview(previewUrls[index], localFiles[index], index)}
                  {isHovered && (
                    <div
                      className={styles.remove__overlay}
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemove(index)
                      }}
                    >
                      <svg width='26' height='2' viewBox='0 0 26 2' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M24.6668 1H1.3335' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' />
                      </svg>
                    </div>
                  )}
                </>
              )}

              {!hasContent && <Image src={plusIcon} alt='plus' width={24} height={24} />}

              <input
                type='file'
                id={inputId}
                accept='image/*,video/*'
                onChange={handleFileChange(index)}
                style={{display: 'none'}}
              />
            </label>
          )
        })}
      </div>

      {/* Блок с ошибкой и счетчиком */}
      <div className={styles.info__block}>{errorValue && <p className={styles.error__message}>{errorValue}</p>}</div>
    </div>
  )
}

export default CreateImagesInput
