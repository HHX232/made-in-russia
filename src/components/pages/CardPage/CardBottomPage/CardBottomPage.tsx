'use client'
import Skeleton from 'react-loading-skeleton'
import styles from './CardBottomPage.module.scss'
import {useEffect, useRef, useState} from 'react'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import Image from 'next/image'
import Accordion from '@/components/UI-kit/Texts/Accordions/Accordions'
import ICardFull, {Review} from '@/services/card/card.types'
import StarRating from '@/components/UI-kit/inputs/StarRating/StarRating'
import instance from '@/api/api.interceptor'
import {toast} from 'sonner'

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

  const validateFile = (file: File): boolean => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error(`Файл "${file.name}" имеет неподдерживаемый формат`)
      return false
    }

    if (file.type === 'image/svg+xml') {
      console.error(`SVG файлы не поддерживаются`)
      return false
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      console.error(`Изображение "${file.name}" превышает размер 5MB`)
      return false
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      console.error(`Видео "${file.name}" превышает размер 200MB`)
      return false
    }

    return true
  }

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (uploadedFiles.length + files.length > MAX_FILES_COUNT) {
      console.error(`Можно загрузить не более ${MAX_FILES_COUNT} файлов`)
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

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const uploadFilesToServer = async (files: IUploadedFile[]): Promise<string[]> => {
    const formData = new FormData()

    files.forEach((fileObj, index) => {
      formData.append(`files[${index}]`, fileObj.file)
    })

    try {
      const response = await fetch('/api/upload-files', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки файлов на сервер')
      }

      const result = await response.json()
      return result.fileUrls || []
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Не удалось загрузить файлы')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentValue.trim() && uploadedFiles.length === 0) {
      return
    }

    try {
      let fileUrls: string[] = []

      if (uploadedFiles.length > 0) {
        fileUrls = await uploadFilesToServer(uploadedFiles)
      }

      // Отправляем комментарий с URL загруженных файлов
      const commentData = {
        text: commentValue,
        fileUrls: fileUrls,
        timestamp: new Date().toISOString()
      }

      console.log('Comment data:', commentData)

      // Здесь будет логика отправки комментария на сервер
      // const response = await fetch('/api/comments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(commentData),
      // })

      // Очистка формы после успешной отправки
      setCommentValue('')
      setUploadedFiles([])
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const publishComment = async () => {
    try {
      const res = await instance.post(`products/${cardData?.id}/reviews`, {
        text: commentValue,
        // fileUrls: uploadedFiles.map((file) => file.fileUrl),
        rating: starsCountSet
      })
      console.log(res)
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>Успешно!</strong>
          <span>Отзыв опубликован</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
    } catch (e) {
      console.log(e)
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>Ошибка при публикации отзыва</strong>
          <span>
            Перед публикаией необходимо связаться с продавцом, и чтобы возраст аккаунта составлял не менее 7 дней
          </span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
    }
  }

  // if (comments.length === 0)
  //   return (
  //     <p id='cardCommentsSection' className={`${styles.create__first__comment}`}>
  //       Пока нет отзывов. Станьте первым!
  //     </p>
  // )

  return (
    <div id='cardCommentsSection' className={`${styles.card__bottom__box}`}>
      <div className={`${styles.tabs__box}`}>
        <div
          onClick={() => setActiveIndex(1)}
          className={`fontInstrument ${styles.tabs__box__item} ${activeIndex === 1 ? styles.tabs__box__item__active : ''}`}
        >
          Отзывы
          <span className={`${styles.tabs__box__item__count__comments}`}>
            {cardData?.reviewsCount ? cardData?.reviewsCount : '0'}
          </span>
        </div>
        <div
          onClick={() => setActiveIndex(2)}
          className={`fontInstrument ${styles.tabs__box__item} ${activeIndex === 2 ? styles.tabs__box__item__active : ''}`}
        >
          Вопросы
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
                      Пока нет отзывов. Станьте первым!
                    </p>
                  </li>
                )}
                {specialLastElement}
              </ul>
            )}

            <div className={`${styles.create__comment__box}`}>
              {/* <p className={`${styles.create__comment__box__text}`}>
                Здесь будет превью ранее сделанного заказа: товар, его кол-во, цена, адрес доставки и тп. (превью как в
                корзине)
              </p> */}
              <div className={`${styles.create__comment__box__rating}`}>
                <p>Пожалуйста,расскажите о вашем опыте с этим товаром</p>
                <StarRating starsCountSet={starsCountSet} setStarsCountSet={setStarsCountSet} />
              </div>

              <form onSubmit={handleSubmit} className={`${styles.create__comment__form}`}>
                {uploadedFiles.length > 0 && (
                  <ul className={`${styles.files__preview__container}`}>
                    {uploadedFiles.map((fileObj) => (
                      <li key={fileObj.id} className={`${styles.file__preview}`}>
                        {fileObj.type === 'image' ? (
                          <Image
                            src={URL.createObjectURL(fileObj.file)}
                            alt={fileObj.file.name}
                            width={60}
                            height={60}
                            className={styles.file__preview}
                          />
                        ) : (
                          <video className={styles.file__preview}>
                            <source src={URL.createObjectURL(fileObj.file)} type={fileObj.file.type} />
                          </video>
                        )}
                        <button
                          type='button'
                          onClick={() => removeFile(fileObj.id)}
                          className={`${styles.remove__button}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <span>
                  <label
                    className={`${styles.add__image__label} ${uploadedFiles.length >= MAX_FILES_COUNT ? styles.disabled : ''}`}
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
                      accept={`${ALLOWED_IMAGE_TYPES.join(',')}`}
                      onChange={handleFilesChange}
                      multiple
                      disabled={uploadedFiles.length >= MAX_FILES_COUNT}
                    />
                    {/* {uploadedFiles.length > 0 && <span className={`${styles.file__indicator}`}></span>} */}
                  </label>
                  <AutoResizeTextarea
                    onChange={(e) => setCommentValue(e.target.value)}
                    value={commentValue}
                    placeholder='Напишите отзыв...'
                  />
                  <button
                    type='submit'
                    onClick={publishComment}
                    className={`${styles.send__comment__button}`}
                    // && uploadedFiles.length === 0
                    disabled={!commentValue.trim()}
                  >
                    <svg
                      className={`${styles.send__comment__image}`}
                      width='20'
                      height='20'
                      viewBox='0 0 20 20'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M19.0781 2.76851C19.5282 1.52372 18.3219 0.317467 17.0771 0.768509L1.86357 6.27059C0.614607 6.72267 0.463565 8.42684 1.61252 9.09247L6.46877 11.9039L10.8052 7.56747C11.0017 7.37772 11.2648 7.27272 11.5379 7.2751C11.8111 7.27747 12.0723 7.38702 12.2655 7.58016C12.4586 7.77329 12.5681 8.03455 12.5705 8.30767C12.5729 8.5808 12.4679 8.84392 12.2781 9.04038L7.94169 13.3768L10.7542 18.2331C11.4188 19.382 13.1229 19.23 13.575 17.982L19.0781 2.76851Z'
                        fill='#2A2E46'
                      />
                    </svg>
                  </button>
                </span>
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
                items={cardData?.faq.map((el) => ({title: el.question, value: el.answer})) || []}
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
