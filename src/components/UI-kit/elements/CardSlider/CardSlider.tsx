/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useEffect, useLayoutEffect, useCallback} from 'react'
import {useKeenSlider} from 'keen-slider/react'
// import 'keen-slider/keen-slider.min.css'
import styles from './CardSlider.module.scss'
import Skeleton from 'react-loading-skeleton'

const CustomArrowLeft = ({onClick, disabled}: {onClick: (e: any) => void; disabled: boolean}) => (
  <div
    className={`${styles.customArrow} ${styles.customArrowLeft} ${disabled ? styles.customArrowDisabled : ''}`}
    onClick={onClick}
  >
    <svg
      style={{transform: 'rotate(180deg)'}}
      width='15'
      height='11'
      viewBox='0 0 15 11'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M8.293 0.293031C8.48053 0.105559 8.73484 0.000244141 9 0.000244141C9.26516 0.000244141 9.51947 0.105559 9.707 0.293031L14.207 4.79303C14.3945 4.98056 14.4998 5.23487 14.4998 5.50003C14.4998 5.76519 14.3945 6.0195 14.207 6.20703L9.707 10.707C9.5184 10.8892 9.2658 10.99 9.0036 10.9877C8.7414 10.9854 8.49059 10.8803 8.30518 10.6948C8.11977 10.5094 8.0146 10.2586 8.01233 9.99643C8.01005 9.73423 8.11084 9.48163 8.293 9.29303L11 6.50003H1.5C1.23478 6.50003 0.98043 6.39467 0.792893 6.20714C0.605357 6.0196 0.5 5.76525 0.5 5.50003C0.5 5.23481 0.605357 4.98046 0.792893 4.79292C0.98043 4.60539 1.23478 4.50003 1.5 4.50003H11L8.293 1.70703C8.10553 1.5195 8.00021 1.26519 8.00021 1.00003C8.00021 0.734866 8.10553 0.480558 8.293 0.293031Z'
        fill='#2A2E46'
      />
    </svg>
  </div>
)

const CustomArrowRight = ({onClick, disabled}: {onClick: (e: any) => void; disabled: boolean}) => (
  <div
    className={`${styles.customArrow} ${styles.customArrowRight} ${disabled ? styles.customArrowDisabled : ''}`}
    onClick={onClick}
  >
    <svg width='15' height='11' viewBox='0 0 15 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M8.293 0.293031C8.48053 0.105559 8.73484 0.000244141 9 0.000244141C9.26516 0.000244141 9.51947 0.105559 9.707 0.293031L14.207 4.79303C14.3945 4.98056 14.4998 5.23487 14.4998 5.50003C14.4998 5.76519 14.3945 6.0195 14.207 6.20703L9.707 10.707C9.5184 10.8892 9.2658 10.99 9.0036 10.9877C8.7414 10.9854 8.49059 10.8803 8.30518 10.6948C8.11977 10.5094 8.0146 10.2586 8.01233 9.99643C8.01005 9.73423 8.11084 9.48163 8.293 9.29303L11 6.50003H1.5C1.23478 6.50003 0.98043 6.39467 0.792893 6.20714C0.605357 6.0196 0.5 5.76525 0.5 5.50003C0.5 5.23481 0.605357 4.98046 0.792893 4.79292C0.98043 4.60539 1.23478 4.50003 1.5 4.50003H11L8.293 1.70703C8.10553 1.5195 8.00021 1.26519 8.00021 1.00003C8.00021 0.734866 8.10553 0.480558 8.293 0.293031Z'
        fill='#2A2E46'
      />
    </svg>
  </div>
)

interface SlickCardSliderProps {
  isLoading: boolean
  imagesCustom?: string[]
  extraClass?: string
  productName?: string
  productId?: string | number
}

const calculateSlidesToShow = (containerWidth: number, imagesLength: number) => {
  console.log('Calculating slides for container width:', containerWidth) // Для отладки

  // Логика основана на реальной ширине контейнера, а не экрана
  if (containerWidth < 350) return Math.min(imagesLength, 2) // Очень узкий контейнер
  if (containerWidth < 400) return Math.min(imagesLength, 2) // Узкий контейнер
  if (containerWidth < 500) return Math.min(imagesLength, 3) // Средний контейнер
  return Math.min(imagesLength, 4) // Широкий контейнер
}

const SlickCardSlider = ({
  isLoading,
  imagesCustom,
  extraClass,
  productName = 'Товар',
  productId
}: SlickCardSliderProps) => {
  const imagesDefault = [
    '/new_login.jpg',
    '/login__image.jpg',
    '/new_login.jpg',
    '/new_login.jpg',
    '/login__image.jpg',
    '/new_login.jpg',
    '/login__image.jpg'
  ]
  const images = imagesCustom ?? imagesDefault

  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mainLoaded, setMainLoaded] = useState(false)
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Вычисляем количество слайдов на основе ширины контейнера
  const slidesToShow = containerWidth
    ? calculateSlidesToShow(containerWidth, images.length)
    : Math.min(images.length, 4)

  // Добавляем отладочную информацию
  console.log('Current state:', {containerWidth, slidesToShow, imagesLength: images.length})

  // Устанавливаем флаг клиентского рендера
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Функция для измерения ширины контейнера
  const measureContainer = useCallback(() => {
    if (typeof window === 'undefined') return

    // Ищем именно контейнер нашего слайдера
    const container = document.querySelector(`.${styles.imageSlider}`)
    if (container) {
      const rect = container.getBoundingClientRect()
      const containerWidth = rect.width
      console.log('Container width:', containerWidth) // Для отладки
      setContainerWidth(containerWidth)
    } else {
      // Фоллбек на ширину окна, если контейнер не найден
      setContainerWidth(window.innerWidth)
    }
  }, [])

  // Измеряем контейнер при монтировании и изменении размера окна
  useLayoutEffect(() => {
    if (!isClient) return

    // Небольшая задержка для рендера DOM
    const timer = setTimeout(() => {
      measureContainer()
    }, 10)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        console.log('ResizeObserver width:', containerWidth) // Для отладки
        setContainerWidth(containerWidth)
      }
    })

    const handleResize = () => {
      measureContainer()
    }

    const container = document.querySelector(`.${styles.imageSlider}`)
    if (container) {
      resizeObserver.observe(container)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [isClient, measureContainer])

  const [mainSliderRef, mainInstanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: true,
    slides: {
      perView: 1,
      spacing: 0
    },
    slideChanged(slider) {
      setActiveIndex(slider.track.details.rel)
    },
    created() {
      setMainLoaded(true)
    }
  })

  const [thumbnailSliderRef, thumbnailInstanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: false,
    mode: 'free-snap',
    slides: {
      perView: slidesToShow,
      spacing: 16
    },
    created() {
      setThumbnailLoaded(true)
    }
  })

  // Принудительное обновление слайдеров при изменении slidesToShow
  useEffect(() => {
    if (!thumbnailInstanceRef.current || !mainInstanceRef.current) return

    const timer = setTimeout(() => {
      try {
        if (thumbnailInstanceRef.current) {
          thumbnailInstanceRef.current.update({
            slides: {
              perView: slidesToShow,
              spacing: 16
            }
          })
        }
        if (mainInstanceRef.current) {
          mainInstanceRef.current.update()
        }
      } catch (error) {
        console.warn('Slider update failed:', error)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [slidesToShow, containerWidth, thumbnailLoaded, mainLoaded])

  // Синхронизация миниатюр с активным слайдом
  useEffect(() => {
    if (!thumbnailInstanceRef.current || activeIndex === undefined || !thumbnailLoaded) return

    try {
      const thumbnailSlider = thumbnailInstanceRef.current
      if (activeIndex >= slidesToShow) {
        const targetSlide = Math.max(0, activeIndex - Math.floor(slidesToShow / 2))
        thumbnailSlider.moveToIdx(targetSlide)
      } else {
        thumbnailSlider.moveToIdx(0)
      }
    } catch (error) {
      console.warn('Thumbnail sync failed:', error)
    }
  }, [activeIndex, slidesToShow, thumbnailLoaded])

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
    if (mainInstanceRef.current) {
      try {
        mainInstanceRef.current.moveToIdx(index)
      } catch (error) {
        console.warn('Failed to move to slide:', error)
      }
    }
  }

  const generateImageGalleryStructuredData = () => {
    const baseUrl =
      typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        : 'https://yourdomain.com'

    const mediaObjects = images.map((media, index) => {
      const isVideo = media.match(/\.(mp4|webm|mov)$/i)
      const fullUrl = media.startsWith('http') ? media : `${baseUrl}${media}`

      if (isVideo) {
        return {
          '@type': 'VideoObject',
          name: `Видео товара ${productName} - ${index + 1}`,
          description: `Демонстрация товара ${productName}`,
          contentUrl: fullUrl,
          thumbnailUrl: fullUrl,
          uploadDate: new Date().toISOString(),
          duration: 'PT30S'
        }
      } else {
        return {
          '@type': 'ImageObject',
          name: `Изображение товара ${productName} - ${index + 1}`,
          description: `Фотография товара ${productName}`,
          contentUrl: fullUrl,
          url: fullUrl,
          width: '500',
          height: '500'
        }
      }
    })

    return {
      '@context': 'https://schema.org/',
      '@type': 'ImageGallery',
      name: `Галерея изображений ${productName}`,
      description: `Фотографии и видео товара ${productName}`,
      about: {
        '@type': 'Product',
        name: productName,
        ...(productId && {sku: `product-${productId}`})
      },
      associatedMedia: mediaObjects,
      mainEntity: mediaObjects[activeIndex]
    }
  }

  const getMediaUrl = (media: string) => {
    if (media.startsWith('http')) return media
    const baseUrl =
      typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        : 'https://yourdomain.com'
    return `${baseUrl}${media}`
  }

  if (isLoading) {
    return (
      <div className={`spec__slider ${styles.imageSlider} ${extraClass}`}>
        <div className={styles.imageSlider__main}>
          <Skeleton width={500} height={500} />
        </div>
        <div className={`spec__slider spec__slider_2 ${styles.imageSlider__thumbnails}`}>
          {Array.from({length: 4}).map((_, index) => (
            <Skeleton key={index} width={100} height={100} style={{margin: '0 5px'}} />
          ))}
        </div>
      </div>
    )
  }

  // Показываем скелетон пока не получили размеры контейнера
  if (!isClient || containerWidth === null) {
    return (
      <div className={`spec__slider ${styles.imageSlider} ${extraClass}`}>
        <div className={styles.imageSlider__main}>
          <Skeleton width={500} height={500} />
        </div>
        <div className={`spec__slider spec__slider_2 ${styles.imageSlider__thumbnails}`}>
          {Array.from({length: 4}).map((_, index) => (
            <Skeleton key={index} width={100} height={100} style={{margin: '0 5px'}} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateImageGalleryStructuredData())
        }}
      />

      <div
        className={`spec__slider ${styles.imageSlider} ${extraClass}`}
        itemScope
        itemType='https://schema.org/ImageGallery'
      >
        <meta itemProp='name' content={`Галерея изображений ${productName}`} />
        <meta itemProp='description' content={`Фотографии и видео товара ${productName}`} />

        {/* Главный слайдер */}
        <div className={styles.imageSlider__main}>
          <div ref={mainSliderRef} className='keen-slider'>
            {images.map((image, index) => {
              const isVideo = image.match(/\.(mp4|webm|mov)$/i)
              const isActive = index === activeIndex

              return (
                <div key={index} className={`keen-slider__slide ${styles.imageSlider__slide}`}>
                  <div
                    className={styles.imageSlider__imageWrapper}
                    itemScope
                    itemType={isVideo ? 'https://schema.org/VideoObject' : 'https://schema.org/ImageObject'}
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={image}
                          autoPlay
                          muted
                          loop
                          playsInline
                          webkit-playsinline='true'
                          controls={false}
                          disablePictureInPicture
                          controlsList='nodownload nofullscreen noremoteplaybook'
                          className={styles.imageSlider__mainVideo}
                          itemProp='contentUrl'
                          aria-label={`Видео товара ${productName} - ${index + 1}`}
                          style={
                            {
                              WebkitMediaControls: 'none',
                              WebkitPlaybackTargetAvailability: 'none'
                            } as React.CSSProperties
                          }
                        />
                        <meta itemProp='name' content={`Видео товара ${productName} - ${index + 1}`} />
                        <meta itemProp='description' content={`Демонстрация товара ${productName}`} />
                        <meta itemProp='thumbnailUrl' content={getMediaUrl(image)} />
                        <meta itemProp='uploadDate' content={new Date().toISOString()} />
                      </>
                    ) : (
                      <>
                        <div
                          style={{backgroundImage: `url(${image})`}}
                          className={styles.imageSlider__mainImage}
                          role='img'
                          aria-label={`Изображение товара ${productName} - ${index + 1}`}
                        />
                        <meta itemProp='contentUrl' content={getMediaUrl(image)} />
                        <meta itemProp='url' content={getMediaUrl(image)} />
                        <meta itemProp='name' content={`Изображение товара ${productName} - ${index + 1}`} />
                        <meta itemProp='description' content={`Фотография товара ${productName}`} />
                        <meta itemProp='width' content='500' />
                        <meta itemProp='height' content='500' />

                        {isActive && <link itemProp='image' href={getMediaUrl(image)} />}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Стрелки для главного слайдера */}
          {mainLoaded && mainInstanceRef.current && (
            <>
              <CustomArrowLeft
                onClick={(e: any) => {
                  e.stopPropagation()
                  mainInstanceRef.current?.prev()
                }}
                disabled={false}
              />
              <CustomArrowRight
                onClick={(e: any) => {
                  e.stopPropagation()
                  mainInstanceRef.current?.next()
                }}
                disabled={false}
              />
            </>
          )}
        </div>

        {/* Слайдер с миниатюрами */}
        <div className={`spec__slider spec__slider_2 ${styles.imageSlider__thumbnails}`}>
          <div ref={thumbnailSliderRef} className='keen-slider'>
            {images.map((image, index) => {
              const isVideo = image.match(/\.(mp4|webm|mov)$/i)

              return (
                <div
                  key={index}
                  className={`keen-slider__slide ${styles.imageSlider__thumbnail} ${
                    index === activeIndex ? styles.imageSlider__thumbnailActive : ''
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                  role='button'
                  tabIndex={0}
                  aria-label={`${isVideo ? 'Видео' : 'Изображение'} товара ${productName} - ${index + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleThumbnailClick(index)
                    }
                  }}
                >
                  {isVideo ? (
                    <video
                      src={image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      webkit-playsinline='true'
                      controls={false}
                      disablePictureInPicture
                      controlsList='nodownload nofullscreen noremoteplaybook'
                      className={styles.imageSlider__thumbnailVideo}
                      aria-hidden='true'
                      style={
                        {
                          WebkitMediaControls: 'none',
                          WebkitPlaybackTargetAvailability: 'none'
                        } as React.CSSProperties
                      }
                    />
                  ) : (
                    <div
                      style={{backgroundImage: `url(${image})`}}
                      className={styles.imageSlider__thumbnailImage}
                      aria-hidden='true'
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div itemScope itemType='https://schema.org/Product' style={{display: 'none'}}>
          <meta itemProp='name' content={productName} />
          {productId && <meta itemProp='sku' content={`product-${productId}`} />}
        </div>
      </div>
    </>
  )
}

export default SlickCardSlider
