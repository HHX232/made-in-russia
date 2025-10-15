/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Skeleton from 'react-loading-skeleton'
import styles from './CardBottomPage.module.scss'
import React, {useState, useRef, useEffect, useCallback} from 'react'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import Accordion from '@/components/UI-kit/Texts/Accordions/Accordions'
import ICardFull, {Review} from '@/services/card/card.types'
import StarRating from '@/components/UI-kit/inputs/StarRating/StarRating'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {getAccessToken} from '@/services/auth/auth.helper'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import CreateImagesInputMinimalistic from '@/components/UI-kit/inputs/CreateImagesInputMinimalistic/CreateImagesInputMinimalistic'

interface ICardBottomPageProps {
  isLoading: boolean
  comments: Review[]
  specialLastElement: React.ReactNode
  cardData: ICardFull | null
}

interface IUploadedFile {
  file: File
  id: string
  type: 'image' | 'video'
}

const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder = 'Напишите отзыв...',
  ...props
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoResize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }

  useEffect(() => {
    autoResize()
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e)
    autoResize()
  }

  return (
    <textarea
      ref={textareaRef}
      className={styles.create__comment__textarea}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={1}
      {...props}
    />
  )
}

// Мемоизированный компонент для превью файла
const FilePreview = React.memo(({fileObj, onRemove}: {fileObj: IUploadedFile; onRemove: (id: string) => void}) => {
  const [objectURL, setObjectURL] = useState<string>('')

  // Создаем URL при монтировании компонента
  useEffect(() => {
    const url = URL.createObjectURL(fileObj.file)
    setObjectURL(url)

    // Очищаем URL при размонтировании компонента
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [fileObj.file])

  const handleRemove = useCallback(() => {
    onRemove(fileObj.id)
  }, [fileObj.id, onRemove])

  // Не рендерим, пока URL не создан
  if (!objectURL) return null

  return (
    <li className={`${styles.file__preview}`}>
      {fileObj.type === 'image' ? (
        <img
          src={objectURL}
          alt={fileObj.file.name}
          width={60}
          height={60}
          className={styles.file__preview}
          style={{objectFit: 'cover'}}
        />
      ) : (
        <video className={styles.file__preview} width={60} height={60} style={{objectFit: 'cover'}}>
          <source src={objectURL} type={fileObj.file.type} />
        </video>
      )}
      <button type='button' onClick={handleRemove} className={`${styles.remove__button}`}>
        ×
      </button>
    </li>
  )
})

FilePreview.displayName = 'FilePreview'

// Мемоизированный компонент для списка превью
// const FilesPreviewList = React.memo(
//   ({uploadedFiles, onRemoveFile}: {uploadedFiles: IUploadedFile[]; onRemoveFile: (id: string) => void}) => {
//     const memoizedRemoveFile = useCallback(
//       (id: string) => {
//         onRemoveFile(id)
//       },
//       [onRemoveFile]
//     )

//     if (uploadedFiles.length === 0) return null

//     return (
//       <ul className={`${styles.files__preview__container}`}>
//         {uploadedFiles.map((fileObj) => (
//           <FilePreview key={fileObj.id} fileObj={fileObj} onRemove={memoizedRemoveFile} />
//         ))}
//       </ul>
//     )
//   }
// )

// FilesPreviewList.displayName = 'FilesPreviewList'

const CardBottomPage = ({isLoading, comments, specialLastElement, cardData}: ICardBottomPageProps) => {
  const [activeIndex, setActiveIndex] = useState(1)
  const [commentValue, setCommentValue] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<IUploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [starsCountSet, setStarsCountSet] = useState<number>(4)
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const MAX_VIDEO_SIZE = 200 * 1024 * 1024
  const MAX_FILES_COUNT = 20
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
  const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
  const t = useTranslations('CardPage.CardBottomPage')
  const currentLang = useCurrentLanguage()
  const [error, setError] = useState('')
  const convertFilesToUploadedFiles = (files: File[]): IUploadedFile[] => {
    return files.map((file) => {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
      return {
        file,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: isImage ? 'image' : 'video'
      }
    })
  }
  // Мемоизируем функцию удаления файла
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }, [])

  const validateFile = (file: File): boolean => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error(`Файл "${file.name}" имеет неподдерживаемый формат`)
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('defaultError')}</strong>
          <span>{t('fileUploadErrorType', {fileName: file.name})}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      return false
    }

    if (file.type === 'image/svg+xml') {
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('defaultError')}</strong>
          <span>{t('svgError')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      return false
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      console.error(`Изображение "${file.name}" превышает размер 5MB`)
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('defaultError')}</strong>
          <span>{t('bigImage')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      return false
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('defaultError')}</strong>
          <span>{t('bigVideo')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      return false
    }

    return true
  }

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (uploadedFiles.length + files.length > MAX_FILES_COUNT) {
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('defaultError')}</strong>
          <span>{t('bigFiles', {maxFilesCount: MAX_FILES_COUNT})}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      return
    }

    const validFiles: IUploadedFile[] = []

    for (const file of files) {
      if (!validateFile(file)) {
        continue
      }

      const fileType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video'

      validFiles.push({
        file,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: fileType
      })
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles])
    }

    // Очистка input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await publishComment()
  }

  const publishComment = async () => {
    const loadingToast = toast.loading(t('publishing'))
    try {
      // Get access token
      const token = getAccessToken()

      const formDataToSend = new FormData()

      // Prepare the data object
      const dataPayload = {
        text: commentValue.trim(),
        rating: starsCountSet
      }

      // Create Blob for JSON data with correct content type
      const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
      formDataToSend.append('data', jsonBlob)

      // Append media files
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((fileObj) => {
          formDataToSend.append('media', fileObj.file)
        })
      }

      // Send request using fetch with authorization token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/products/${cardData?.id}/reviews`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': currentLang
            // Don't set Content-Type, browser will set correct type for FormData
          },
          body: formDataToSend
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.log('Error data from server:', errorData) // для отладки
        throw new Error(JSON.stringify(errorData)) // передаем полные данные об ошибке
      }

      const result = await response.json()
      console.log(result)

      toast.dismiss(loadingToast)

      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('success')}</strong>
          <span>{t('successPublished')}</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )

      // Clear form after successful submission
      setCommentValue('')
      setUploadedFiles([])
      setStarsCountSet(4)
    } catch (e: any) {
      console.log('Error caught:', e)
      toast.dismiss(loadingToast)

      // Парсим ошибку из сервера
      let errorMessage = t('errorPublishedText') // дефолтное сообщение

      try {
        // Пытаемся распарсить JSON из сообщения об ошибке
        const parsedError = JSON.parse(e.message)
        if (parsedError && parsedError.message) {
          errorMessage = parsedError.message
          setError(parsedError) // сохраняем полную ошибку в state для других целей
        }
      } catch (parseError) {
        // Если не удалось распарсить, проверяем другие возможные форматы
        if (e.message && e.message !== 'Failed to fetch') {
          errorMessage = e.message
        }
      }

      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('errorPublished')}</strong>
          <span>{errorMessage}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
    }
  }

  return (
    <div id='cardCommentsSection' className={`${styles.card__bottom__box}`}>
      <div className={`${styles.tabs__box}`}>
        <div
          onClick={() => setActiveIndex(1)}
          className={`fontInstrument ${styles.tabs__box__item} ${
            activeIndex === 1 ? styles.tabs__box__item__active : ''
          }`}
        >
          {t('revues')}
          <span className={`${styles.tabs__box__item__count__comments}`}>
            {cardData?.reviewsCount ? cardData?.reviewsCount : '0'}
          </span>
        </div>
        <div
          onClick={() => setActiveIndex(2)}
          className={`fontInstrument ${styles.tabs__box__item} ${
            activeIndex === 2 ? styles.tabs__box__item__active : ''
          }`}
        >
          {t('questions')}
          <span className={`${styles.tabs__box__item__count__comments}`}>
            {' '}
            {cardData?.faq.length ? cardData?.faq.length : '0'}
          </span>
        </div>
      </div>

      <div className={`${styles.tabs__box__content}`}>
        {activeIndex === 1 && (
          <>
            {isLoading ? (
              <Skeleton height={100} count={3} style={{marginBottom: '16px', width: '90%', maxWidth: '400px'}} />
            ) : (
              <ul className={`${styles.comments__list}`}>
                {comments.length > 0 ? (
                  comments.map((el, i) => (
                    <li className={`${styles.comments__list__item}`} key={i}>
                      <Comment {...el} />
                    </li>
                  ))
                ) : (
                  <li className={`${styles.no__comments}`}>
                    <p id='cardCommentsSection' className={`${styles.create__first__comment}`}>
                      {t('noComments')}
                    </p>
                  </li>
                )}
                {specialLastElement}
              </ul>
            )}

            <div className={`${styles.create__comment__box}`}>
              <div className={`${styles.create__comment__box__rating}`}>
                <p>{t('pleaseCreateComment')}</p>
                <StarRating starsCountSet={starsCountSet} setStarsCountSet={setStarsCountSet} />
              </div>

              <form onSubmit={handleSubmit} className={`${styles.create__comment__form}`}>
                {/* Используем мемоизированный компонент для превью */}
                {/* <FilesPreviewList uploadedFiles={uploadedFiles} onRemoveFile={removeFile} /> */}

                {/* <label
                    className={`${styles.add__image__label} ${
                      uploadedFiles.length >= MAX_FILES_COUNT ? styles.disabled : ''
                    }`}
                    htmlFor='image__input'
                  >
                    <svg
                      className={`${styles.add__image__image}`}
                      width='25'
                      height='25'
                      viewBox='0 0 25 25'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M4.16671 5.20833H17.7084V12.5H19.7917V5.20833C19.7917 4.05937 18.8573 3.125 17.7084 3.125H4.16671C3.01775 3.125 2.08337 4.05937 2.08337 5.20833V17.7083C2.08337 18.8573 3.01775 19.7917 4.16671 19.7917H12.5V17.7083H4.16671V5.20833Z'
                        fill='#2A2E46'
                      />
                      <path
                        d='M8.33337 11.4583L5.20837 15.625H16.6667L12.5 9.375L9.37504 13.5417L8.33337 11.4583Z'
                        fill='#2A2E46'
                      />
                      <path
                        d='M19.7917 14.5833H17.7084V17.7083H14.5834V19.7917H17.7084V22.9167H19.7917V19.7917H22.9167V17.7083H19.7917V14.5833Z'
                        fill='#2A2E46'
                      />
                    </svg>

                    <input
                      ref={fileInputRef}
                      className={`${styles.add__image__input}`}
                      id='image__input'
                      type='file'
                      accept={`${ALLOWED_IMAGE_TYPES.join(',')},${ALLOWED_VIDEO_TYPES.join(',')}`}
                      onChange={handleFilesChange}
                      multiple
                      disabled={uploadedFiles.length >= MAX_FILES_COUNT}
                    />
                  </label> */}
                {/* <AutoResizeTextarea
                    onChange={(e) => setCommentValue(e.target.value)}
                    value={commentValue}
                    placeholder={t('writeCommentPlaceholder')}
                  /> */}
                <TextAreaUI
                  minRows={2}
                  maxRows={10}
                  theme='newWhite'
                  autoResize
                  placeholder={t('writeCommentPlaceholder')}
                  onSetValue={(e) => setCommentValue(e)}
                  extraClass={styles.extra__textarea__width}
                  currentValue={commentValue}
                />
                <CreateImagesInputMinimalistic
                  onFilesChange={(files) => {
                    const uploadedFilesArray = convertFilesToUploadedFiles(files)
                    setUploadedFiles(uploadedFilesArray)
                  }}
                />

                <button type='submit' className={`${styles.send__comment__button}`} disabled={!commentValue.trim()}>
                  Отправить
                </button>
              </form>
            </div>
          </>
        )}

        {activeIndex === 2 && (
          <div className={`${styles.questions__content}`}>
            {isLoading ? (
              <div className={`${styles.skeleton__container}`}>
                <Skeleton height={80} count={4} style={{marginBottom: '12px'}} />
              </div>
            ) : (
              <Accordion
                items={cardData?.faq.map((el) => ({title: el.question, value: el.answer, id: el.id.toString()})) || []}
                multiActive={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CardBottomPage
