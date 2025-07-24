// import {FC, useState, ChangeEvent, useEffect, useCallback, useMemo, memo} from 'react'
// import styles from './CreateImagesInput.module.scss'
// import Image from 'next/image'
// import {toast} from 'sonner'

// const plusIcon = '/create-card/plus.svg'

// interface CreateImagesInputProps {
//   activeImages?: string[]
//   onFilesChange: (files: File[]) => void
//   onActiveImagesChange?: (remainingUrls: string[]) => void
//   maxFiles?: number
//   extraClass?: string
//   errorValue?: string
//   setErrorValue?: (value: string) => void
//   minFiles?: number
//   inputIdPrefix?: string
// }

// const ImagePreview = memo<{
//   url: string | null
//   file: File | null
//   index: number
//   onError: (index: number) => void
//   loadError: boolean
// }>(({url, file, index, onError, loadError}) => {
//   const handleError = useCallback(() => {
//     onError(index)
//   }, [index, onError])

//   if (!url) return null

//   if (file && file.type.startsWith('video/')) {
//     return <video src={url} className={styles.preview} muted loop autoPlay />
//   }

//   if (loadError) {
//     return (
//       <div className={styles.errorPreview}>
//         <p>Ошибка загрузки</p>
//         <small>{url}</small>
//       </div>
//     )
//   }

//   const isExternalUrl = url.startsWith('http://') || url.startsWith('https://')

//   if (isExternalUrl) {
//     return <img src={url} alt={`Preview ${index}`} className={styles.preview} onError={handleError} />
//   }

//   return (
//     <Image
//       width={200}
//       height={200}
//       src={url}
//       alt={`Preview ${index}`}
//       className={styles.preview}
//       onError={handleError}
//     />
//   )
// })

// ImagePreview.displayName = 'ImagePreview'

// // Мемоизированный компонент для отдельного элемента загрузки
// const ImageUploadItem = memo<{
//   index: number
//   maxFiles: number
//   inputIdPrefix: string
//   previewUrl: string | null
//   localFile: File | null
//   loadError: boolean
//   onFileChange: (index: number, file: File) => void
//   onRemove: (index: number) => void
//   onImageError: (index: number) => void
// }>(({index, inputIdPrefix, previewUrl, localFile, loadError, onFileChange, onRemove, onImageError}) => {
//   const [isHovered, setIsHovered] = useState(false)

//   const handleFileChange = useCallback(
//     (e: ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0]
//       if (!file) return

//       const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
//       if (!isValidType) {
//         toast.error(
//           <div style={{lineHeight: 1.5}}>
//             <strong style={{display: 'block', marginBottom: 4}}>Ошибка загрузки данных</strong>
//             <span>Пожалуйста, выберите изображение или видео</span>
//           </div>,
//           {
//             style: {
//               background: '#AC2525'
//             }
//           }
//         )
//         return
//       }

//       const maxSize = 10 * 1024 * 1024
//       if (file.size > maxSize) {
//         toast.error(
//           <div style={{lineHeight: 1.5}}>
//             <strong style={{display: 'block', marginBottom: 4}}>Ошибка загрузки данных</strong>
//             <span>Размер файла не должен привышать 10 МБ</span>
//           </div>,
//           {
//             style: {
//               background: '#AC2525'
//             }
//           }
//         )
//         return
//       }

//       onFileChange(index, file)
//     },
//     [index, onFileChange]
//   )

//   const handleRemove = useCallback(
//     (e: React.MouseEvent) => {
//       e.preventDefault()
//       onRemove(index)
//     },
//     [index, onRemove]
//   )

//   const handleMouseEnter = useCallback(() => setIsHovered(true), [])
//   const handleMouseLeave = useCallback(() => setIsHovered(false), [])

//   const hasContent = previewUrl !== null
//   const isBig = index === 0
//   const inputId = `${inputIdPrefix}-${index}`

//   return (
//     <label
//       className={`${styles.create__images__input__label} ${
//         isBig ? styles.create__images__input__label__big : ''
//       } ${hasContent ? styles.has__file : ''}`}
//       htmlFor={inputId}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//     >
//       {hasContent && (
//         <>
//           <ImagePreview url={previewUrl} file={localFile} index={index} onError={onImageError} loadError={loadError} />
//           {isHovered && (
//             <div className={styles.remove__overlay} onClick={handleRemove}>
//               <svg width='26' height='2' viewBox='0 0 26 2' fill='none' xmlns='http://www.w3.org/2000/svg'>
//                 <path d='M24.6668 1H1.3335' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' />
//               </svg>
//             </div>
//           )}
//         </>
//       )}

//       {!hasContent && <Image src={plusIcon} alt='plus' width={24} height={24} />}

//       <input type='file' id={inputId} accept='image/*,video/*' onChange={handleFileChange} style={{display: 'none'}} />
//     </label>
//   )
// })

// ImageUploadItem.displayName = 'ImageUploadItem'

// const CreateImagesInput: FC<CreateImagesInputProps> = ({
//   activeImages = [],
//   onFilesChange,
//   onActiveImagesChange,
//   maxFiles = 11,
//   extraClass = '',
//   errorValue = '',
//   setErrorValue,
//   minFiles = 0,
//   inputIdPrefix = 'images'
// }) => {
//   const [localFiles, setLocalFiles] = useState<(File | null)[]>(() => new Array(maxFiles).fill(null))

//   const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(() => {
//     const urls = new Array(maxFiles).fill(null)
//     activeImages.forEach((url, index) => {
//       if (index < maxFiles) {
//         urls[index] = url
//       }
//     })
//     return urls
//   })

//   const [loadError, setLoadError] = useState<{[key: number]: boolean}>({})
//   const [removedInitialImages, setRemovedInitialImages] = useState<Set<number>>(new Set())

//   // Мемоизируем функцию подсчета изображений
//   const totalImagesCount = useMemo(() => {
//     let count = 0
//     for (let i = 0; i < maxFiles; i++) {
//       if (localFiles[i] || (previewUrls[i] && !removedInitialImages.has(i))) {
//         count++
//       }
//     }
//     return count
//   }, [localFiles, previewUrls, removedInitialImages, maxFiles])

//   // Мемоизируем функцию проверки и сброса ошибки
//   const checkAndClearError = useCallback(() => {
//     if (errorValue && setErrorValue && totalImagesCount >= minFiles) {
//       setErrorValue('')
//     }
//   }, [errorValue, setErrorValue, totalImagesCount, minFiles])

//   // Мемоизируем callback для изменения файлов
//   const handleFileChange = useCallback(
//     (index: number, file: File) => {
//       const url = URL.createObjectURL(file)

//       setLocalFiles((prev) => {
//         const newFiles = [...prev]
//         newFiles[index] = file
//         return newFiles
//       })

//       setPreviewUrls((prev) => {
//         const newUrls = [...prev]
//         // Очищаем старый URL если был создан из файла
//         if (prev[index] && localFiles[index]) {
//           URL.revokeObjectURL(prev[index]!)
//         }
//         newUrls[index] = url
//         return newUrls
//       })

//       // Убираем из списка удаленных, если заменяем удаленное изображение
//       setRemovedInitialImages((prev) => {
//         if (prev.has(index)) {
//           const newSet = new Set(prev)
//           newSet.delete(index)
//           return newSet
//         }
//         return prev
//       })

//       // Сбрасываем ошибку загрузки
//       setLoadError((prev) => ({...prev, [index]: false}))

//       // Обновляем файлы в родителе
//       setLocalFiles((currentFiles) => {
//         const updatedFiles = [...currentFiles]
//         updatedFiles[index] = file
//         onFilesChange(updatedFiles.filter((f) => f !== null) as File[])
//         return updatedFiles
//       })
//     },
//     [localFiles, onFilesChange]
//   )

//   // Мемоизируем callback для удаления
//   const handleRemove = useCallback(
//     (index: number) => {
//       // Очищаем URL только если это был загруженный файл
//       if (previewUrls[index] && localFiles[index]) {
//         URL.revokeObjectURL(previewUrls[index]!)
//       }

//       setLocalFiles((prev) => {
//         const newFiles = [...prev]
//         newFiles[index] = null
//         return newFiles
//       })

//       setPreviewUrls((prev) => {
//         const newUrls = [...prev]
//         newUrls[index] = null
//         return newUrls
//       })

//       // Если это было начальное изображение, добавляем в список удаленных
//       if (activeImages[index] && !localFiles[index]) {
//         setRemovedInitialImages((prev) => {
//           const newSet = new Set(prev).add(index)

//           // Уведомляем родителя об удалении
//           if (onActiveImagesChange) {
//             const remainingUrls = activeImages.filter((_, i) => {
//               return i !== index && !newSet.has(i)
//             })
//             onActiveImagesChange(remainingUrls)
//           }

//           return newSet
//         })
//       }

//       setLoadError((prev) => ({...prev, [index]: false}))

//       // Обновляем файлы в родителе
//       setLocalFiles((currentFiles) => {
//         const updatedFiles = [...currentFiles]
//         updatedFiles[index] = null
//         onFilesChange(updatedFiles.filter((f) => f !== null) as File[])
//         return updatedFiles
//       })
//     },
//     [previewUrls, localFiles, activeImages, onActiveImagesChange, onFilesChange]
//   )

//   // Мемоизируем callback для ошибок изображений
//   const handleImageError = useCallback((index: number) => {
//     setLoadError((prev) => ({...prev, [index]: true}))
//   }, [])

//   // Эффект для обновления при изменении activeImages
//   useEffect(() => {
//     if (activeImages.length > 0) {
//       setPreviewUrls((prev) => {
//         const newUrls = [...prev]
//         let hasChanges = false

//         activeImages.forEach((url, index) => {
//           if (index < maxFiles && !localFiles[index] && !removedInitialImages.has(index)) {
//             if (newUrls[index] !== url) {
//               newUrls[index] = url
//               hasChanges = true
//             }
//           }
//         })

//         return hasChanges ? newUrls : prev
//       })
//     }
//   }, [activeImages, maxFiles, localFiles, removedInitialImages])

//   // Эффект для проверки ошибок
//   useEffect(() => {
//     checkAndClearError()
//   }, [checkAndClearError])

//   // Мемоизируем массив элементов
//   const uploadItems = useMemo(() => {
//     return Array.from({length: maxFiles}).map((_, index) => (
//       <ImageUploadItem
//         key={index}
//         index={index}
//         maxFiles={maxFiles}
//         inputIdPrefix={inputIdPrefix}
//         previewUrl={previewUrls[index]}
//         localFile={localFiles[index]}
//         loadError={loadError[index] || false}
//         onFileChange={handleFileChange}
//         onRemove={handleRemove}
//         onImageError={handleImageError}
//       />
//     ))
//   }, [maxFiles, inputIdPrefix, previewUrls, localFiles, loadError, handleFileChange, handleRemove, handleImageError])

//   return (
//     <div className={styles.wrapper}>
//       <div className={`${styles.create__images__input} ${extraClass} ${errorValue ? styles.error : ''}`}>
//         {uploadItems}
//       </div>
//       <div className={styles.info__block}>{errorValue && <p className={styles.error__message}>{errorValue}</p>}</div>
//     </div>
//   )
// }

// export default CreateImagesInput

import {FC, useState, ChangeEvent, useEffect, useCallback, useMemo, memo} from 'react'
import styles from './CreateImagesInput.module.scss'
import Image from 'next/image'
import {toast} from 'sonner'

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
  // Новые пропсы
  maxFileSize?: number // размер в байтах, по умолчанию 20 МБ
  allowMultipleFiles?: boolean // разрешена ли мульти загрузка, по умолчанию false
  allowedTypes?: string[] // массив разрешенных MIME типов, по умолчанию ['image/*', 'video/*'] без SVG
}

const ImagePreview = memo<{
  url: string | null
  file: File | null
  index: number
  onError: (index: number) => void
  loadError: boolean
}>(({url, file, index, onError, loadError}) => {
  const handleError = useCallback(() => {
    onError(index)
  }, [index, onError])

  if (!url) return null

  if (file && file.type.startsWith('video/')) {
    return <video src={url} className={styles.preview} muted loop autoPlay />
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
    return <img src={url} alt={`Preview ${index}`} className={styles.preview} onError={handleError} />
  }

  return (
    <Image
      width={200}
      height={200}
      src={url}
      alt={`Preview ${index}`}
      className={styles.preview}
      onError={handleError}
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
  onFileChange: (index: number, file: File) => void
  onMultipleFilesChange: (index: number, files: FileList) => void
  onRemove: (index: number) => void
  onImageError: (index: number) => void
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
    onFileChange,
    onMultipleFilesChange,
    onRemove,
    onImageError
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
              <div style={{lineHeight: 1.5}}>
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
              <div style={{lineHeight: 1.5}}>
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
            <div style={{lineHeight: 1.5}}>
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
            <div style={{lineHeight: 1.5}}>
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
      [index, maxFileSize, allowMultipleFiles, allowedTypes, isValidFileType, onFileChange, onMultipleFilesChange]
    )

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        onRemove(index)
      },
      [index, onRemove]
    )

    const handleMouseEnter = useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = useCallback(() => setIsHovered(false), [])

    const hasContent = previewUrl !== null
    const isBig = index === 0
    const inputId = `${inputIdPrefix}-${index}`

    return (
      <label
        className={`${styles.create__images__input__label} ${
          isBig ? styles.create__images__input__label__big : ''
        } ${hasContent ? styles.has__file : ''}`}
        htmlFor={inputId}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasContent && (
          <>
            <ImagePreview
              url={previewUrl}
              file={localFile}
              index={index}
              onError={onImageError}
              loadError={loadError}
            />
            {isHovered && (
              <div className={styles.remove__overlay} onClick={handleRemove}>
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
          accept={acceptString}
          multiple={allowMultipleFiles}
          onChange={handleFileChange}
          style={{display: 'none'}}
        />
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
  // Новые пропсы с значениями по умолчанию
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
  ]
}) => {
  const [localFiles, setLocalFiles] = useState<(File | null)[]>(() => new Array(maxFiles).fill(null))

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

  // Мемоизируем функцию подсчета изображений
  const totalImagesCount = useMemo(() => {
    let count = 0
    for (let i = 0; i < maxFiles; i++) {
      if (localFiles[i] || (previewUrls[i] && !removedInitialImages.has(i))) {
        count++
      }
    }
    return count
  }, [localFiles, previewUrls, removedInitialImages, maxFiles])

  // Мемоизируем функцию проверки и сброса ошибки
  const checkAndClearError = useCallback(() => {
    if (errorValue && setErrorValue && totalImagesCount >= minFiles) {
      setErrorValue('')
    }
  }, [errorValue, setErrorValue, totalImagesCount, minFiles])

  // Мемоизируем callback для изменения файлов
  const handleFileChange = useCallback(
    (index: number, file: File) => {
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
    [localFiles, onFilesChange]
  )

  // Новый callback для мульти загрузки
  const handleMultipleFilesChange = useCallback(
    (startIndex: number, files: FileList) => {
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
          <div style={{lineHeight: 1.5}}>
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
    [localFiles, previewUrls, loadError, maxFiles, onFilesChange]
  )

  // Мемоизируем callback для удаления
  const handleRemove = useCallback(
    (index: number) => {
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

          // Уведомляем родителя об удалении
          if (onActiveImagesChange) {
            const remainingUrls = activeImages.filter((_, i) => {
              return i !== index && !newSet.has(i)
            })
            onActiveImagesChange(remainingUrls)
          }

          return newSet
        })
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
    [previewUrls, localFiles, activeImages, onActiveImagesChange, onFilesChange]
  )

  // Мемоизируем callback для ошибок изображений
  const handleImageError = useCallback((index: number) => {
    setLoadError((prev) => ({...prev, [index]: true}))
  }, [])

  // Эффект для обновления при изменении activeImages
  useEffect(() => {
    if (activeImages.length > 0) {
      setPreviewUrls((prev) => {
        const newUrls = [...prev]
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
      })
    }
  }, [activeImages, maxFiles, localFiles, removedInitialImages])

  // Эффект для проверки ошибок
  useEffect(() => {
    checkAndClearError()
  }, [checkAndClearError])

  // Мемоизируем массив элементов
  const uploadItems = useMemo(() => {
    return Array.from({length: maxFiles}).map((_, index) => (
      <ImageUploadItem
        key={index}
        index={index}
        maxFiles={maxFiles}
        inputIdPrefix={inputIdPrefix}
        previewUrl={previewUrls[index]}
        localFile={localFiles[index]}
        loadError={loadError[index] || false}
        maxFileSize={maxFileSize}
        allowMultipleFiles={allowMultipleFiles}
        allowedTypes={allowedTypes}
        acceptString={acceptString}
        onFileChange={handleFileChange}
        onMultipleFilesChange={handleMultipleFilesChange}
        onRemove={handleRemove}
        onImageError={handleImageError}
      />
    ))
  }, [
    maxFiles,
    inputIdPrefix,
    previewUrls,
    localFiles,
    loadError,
    maxFileSize,
    allowMultipleFiles,
    allowedTypes,
    acceptString,
    handleFileChange,
    handleMultipleFilesChange,
    handleRemove,
    handleImageError
  ])

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.create__images__input} ${extraClass} ${errorValue ? styles.error : ''}`}>
        {uploadItems}
      </div>
      <div className={styles.info__block}>{errorValue && <p className={styles.error__message}>{errorValue}</p>}</div>
    </div>
  )
}

export default CreateImagesInput
