'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import CreateImagesInputMinimalistic from '@/components/UI-kit/inputs/CreateImagesInputMinimalistic/CreateImagesInputMinimalistic'
import {Product} from '@/services/products/product.types'
import instance from '@/api/api.interceptor'
import Card from '@/components/UI-kit/elements/card/card'

interface ICardBottomPageProps {
  isLoading: boolean
  comments: Review[]
  cardData: ICardFull | null
  hasMore: boolean
  onLoadMore?: () => void
  productId?: string | number
}

interface IUploadedFile {
  file: File
  id: string
  type: 'image' | 'video'
}

const FilePreview = React.memo(({fileObj, onRemove}: {fileObj: IUploadedFile; onRemove: (id: string) => void}) => {
  const [objectURL, setObjectURL] = useState<string>('')

  useEffect(() => {
    const url = URL.createObjectURL(fileObj.file)
    setObjectURL(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [fileObj.file])

  const handleRemove = useCallback(() => {
    onRemove(fileObj.id)
  }, [fileObj.id, onRemove])

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

const CardBottomPage = ({isLoading, comments, cardData, hasMore, onLoadMore, productId}: ICardBottomPageProps) => {
  const [commentValue, setCommentValue] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<IUploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [starsCountSet, setStarsCountSet] = useState<number>(5)
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const MAX_VIDEO_SIZE = 200 * 1024 * 1024
  const MAX_FILES_COUNT = 20
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
  const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
  const t = useTranslations('CardBottomPage')
  const currentLang = useCurrentLanguage()
  const [error, setError] = useState('')
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const {data} = await instance.get(`/products/${productId || cardData?.id}/similar`, {
          headers: {
            'Accept-language': currentLang
          }
        })
        setSimilarProducts(data)
      } catch {
        console.log('message')
      }
    }
    fetchProducts()
  }, [currentLang])

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
      const token = getAccessToken()

      const formDataToSend = new FormData()

      const dataPayload = {
        text: commentValue.trim(),
        rating: starsCountSet
      }

      const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
      formDataToSend.append('data', jsonBlob)

      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((fileObj) => {
          formDataToSend.append('media', fileObj.file)
        })
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/products/${cardData?.id}/reviews`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': currentLang
          },
          body: formDataToSend
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.log('Error data from server:', errorData)
        throw new Error(JSON.stringify(errorData))
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

      setCommentValue('')
      setUploadedFiles([])
      setStarsCountSet(4)
    } catch (e: any) {
      console.log('Error caught:', e)
      toast.dismiss(loadingToast)

      let errorMessage = t('errorPublishedText')

      try {
        const parsedError = JSON.parse(e.message)
        if (parsedError && parsedError.message) {
          errorMessage = parsedError.message
          setError(parsedError)
        }
      } catch (parseError) {
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
    <div id='cardCommentsSection' className={styles.card__bottom__box}>
      <div className={styles.content__wrapper}>
        <div className={styles.questions__wrapper}>
          <div className={`${styles.section__title} ${styles.desctop__show}`}>
            <h2 className={`fontInstrument ${styles.font_title}`}>{t('questions')}</h2>
          </div>
          {cardData?.faq && cardData.faq.length > 0 ? (
            <div className={`${styles.questions__content} ${styles.desctop__show}`}>
              <Accordion
                extraClass={styles.extra__accordion}
                items={
                  cardData.faq.map((el) => ({
                    title: el.question,
                    value: el.answer,
                    id: el.id.toString()
                  })) || []
                }
                multiActive={false}
              />
            </div>
          ) : (
            <p style={{color: '#a2a2a2'}} className={`${styles.desctop__show}`}>
              {t('noQuestions')}
            </p>
          )}
          <div className={`${styles.section__title} `}>
            <h2 className={`fontInstrument ${styles.font_title}`}>{t('similar')}</h2>
          </div>
          <div className={styles.sim_box}>
            {similarProducts.length === 0 && <p className={styles.create__first__comment}>{t('similarNotFound')}</p>}
            {similarProducts.length !== 0 &&
              similarProducts.map((el) => (
                <Card
                  id={el.id}
                  deliveryMethod={el.deliveryMethod}
                  title={el.title}
                  price={el.originalPrice}
                  discount={el.discount}
                  previewImageUrl={el.previewImageUrl}
                  discountedPrice={el.discountedPrice}
                  fullProduct={el}
                  key={el.id}
                />
              ))}
          </div>
        </div>

        <div className={styles.comments__column}>
          <div className={`${styles.section__title} ${styles.desctop__hide}`}>
            <h2 className={`fontInstrument ${styles.font_title}`}>{t('questions')}</h2>
          </div>
          {cardData?.faq && cardData.faq.length > 0 ? (
            <div className={`${styles.questions__content} ${styles.desctop__hide}`}>
              <Accordion
                extraClass={styles.extra__accordion}
                items={
                  cardData.faq.map((el) => ({
                    title: el.question,
                    value: el.answer,
                    id: el.id.toString()
                  })) || []
                }
                multiActive={false}
              />
            </div>
          ) : (
            <p style={{color: '#a2a2a2'}} className={` ${styles.desctop__hide}`}>
              {t('noQuestions')}
            </p>
          )}

          <div className={`${styles.section__title} ${styles.relative_title}`}>
            <div id='reviews-title' className={styles.absolute_title_link}></div>
            <h2 className={`fontInstrument ${styles.font_title}`}>{t('revues')}</h2>
          </div>

          <div className={styles.comments__section}>
            {isLoading && comments.length === 0 ? (
              <Skeleton height={100} count={3} style={{marginBottom: '16px', width: '90%', maxWidth: '400px'}} />
            ) : (
              <>
                <ul className={styles.comments__list}>
                  {comments.length > 0 ? (
                    comments.map((el, i) => (
                      <li className={styles.comments__list__item} key={i}>
                        <Comment {...el} />
                      </li>
                    ))
                  ) : (
                    <li className={styles.no__comments}>
                      <p className={styles.create__first__comment}>{t('noComments')}</p>
                    </li>
                  )}
                </ul>

                {hasMore && (
                  <div className={styles.load__more__container}>
                    <button
                      onClick={onLoadMore || function () {}}
                      className={styles.load__more__button}
                      disabled={isLoading}
                    >
                      {isLoading ? t('loading') || 'Загрузка...' : t('loadMore') || 'Просмотреть еще'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className={styles.create__comment__box}>
            <div className={styles.create__comment__box__rating}>
              <p>{t('pleaseCreateComment')}</p>
              <StarRating starsCountSet={starsCountSet} setStarsCountSet={setStarsCountSet} />
            </div>

            <form onSubmit={handleSubmit} className={styles.create__comment__form}>
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

              <button type='submit' className={styles.send__comment__button} disabled={!commentValue.trim()}>
                {t('send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardBottomPage
