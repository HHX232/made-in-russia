/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo} from 'react'
import {useKeenSlider} from 'keen-slider/react'
import styles from './CardSlider.module.scss'
import Skeleton from 'react-loading-skeleton'

// Типы
interface ZoomImageProps {
  src: string
  alt?: string
  className?: string
}

interface ArrowButtonProps {
  onClick: (e: React.MouseEvent) => void
  disabled: boolean
  extraClass?: string
  direction: 'left' | 'right'
}

interface SlickCardSliderProps {
  isLoading: boolean
  imagesCustom?: string[]
  extraClass?: string
  productName?: string
  productId?: string | number
}

// Константы
const DEFAULT_IMAGES = [
  '/new_login.jpg',
  '/login__image.jpg',
  '/new_login.jpg',
  '/new_login.jpg',
  '/login__image.jpg',
  '/new_login.jpg',
  '/login__image.jpg'
]

// Вспомогательные функции
const getMediaType = (src: string): 'image' | 'video' => (src.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image')

const getMediaUrl = (media: string): string => {
  if (media.startsWith('http')) return media

  const baseUrl =
    typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin : 'https://exporteru.com'

  return `${baseUrl}${media}`
}

const calculateSlidesToShow = (containerWidth: number, imagesLength: number): number => {
  const thumbnailWidth = 140
  const gap = 16
  const availableSlides = Math.floor((containerWidth + gap) / (thumbnailWidth + gap))
  return Math.min(Math.max(availableSlides, 1), imagesLength)
}

// Компоненты
export const ZoomImage: React.FC<ZoomImageProps> = React.memo(({src, alt = 'zoom', className = ''}) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [transform, setTransform] = useState({scale: 1, x: 0, y: 0})

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!imgRef.current || !containerRef.current) return

      if (!isZoomed) {
        const rect = imgRef.current.getBoundingClientRect()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const containerRect = containerRef.current.getBoundingClientRect()

        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        const percentX = clickX / rect.width
        const percentY = clickY / rect.height

        const scale = 2.5
        const maxTranslateX = (rect.width * (scale - 1)) / 2
        const maxTranslateY = (rect.height * (scale - 1)) / 2

        const translateX = -(percentX - 0.5) * rect.width * (scale - 1)
        const translateY = -(percentY - 0.5) * rect.height * (scale - 1)

        setTransform({
          scale,
          x: Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX)),
          y: Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY))
        })
        setIsZoomed(true)
      } else {
        setTransform({scale: 1, x: 0, y: 0})
        setIsZoomed(false)
      }
    },
    [isZoomed]
  )

  return (
    <div ref={containerRef} className={`${styles.zoomImageWrapper} ${className}`} onClick={handleClick}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={styles.zoomImage}
        style={{
          transform: `scale(${transform.scale}) translate(${transform.x / transform.scale}px, ${transform.y / transform.scale}px)`,
          transition: 'transform 0.3s ease',
          cursor: isZoomed ? 'zoom-out' : 'zoom-in'
        }}
      />
    </div>
  )
})

ZoomImage.displayName = 'ZoomImage'

const ArrowButton: React.FC<ArrowButtonProps> = React.memo(({onClick, disabled, extraClass = '', direction}) => {
  const arrowClass = useMemo(
    () => `${styles.customArrow} ${disabled ? styles.customArrowDisabled : ''} ${extraClass}`,
    [disabled, extraClass]
  )

  const svgStyle = direction === 'left' ? {transform: 'rotate(180deg)'} : {}

  return (
    <div className={arrowClass} onClick={onClick} role='button' tabIndex={0}>
      <svg style={svgStyle} width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M12.0254 4.94165L17.0837 9.99998L12.0254 15.0583'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeMiterlimit='10'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2.91699 10H16.942'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeMiterlimit='10'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  )
})

ArrowButton.displayName = 'ArrowButton'

const MediaRenderer: React.FC<{
  media: string
  alt: string
  type: 'image' | 'video'
  className?: string
  isThumbnail?: boolean
  onClick?: () => void
}> = React.memo(({media, alt, type, className = '', isThumbnail = false, onClick}) => {
  const videoProps = useMemo(
    () => ({
      autoPlay: true,
      muted: true,
      loop: true,
      playsInline: true,
      controls: false,
      disablePictureInPicture: true,
      controlsList: 'nodownload nofullscreen noremoteplaybook' as const
    }),
    []
  )

  const styleProps = useMemo(
    () => ({
      WebkitMediaControls: 'none',
      WebkitPlaybackTargetAvailability: 'none',
      cursor: 'pointer' as const
    }),
    []
  )

  if (type === 'video') {
    const videoClass = isThumbnail ? styles.imageSlider__thumbnailVideo : styles.imageSlider__mainVideo

    return (
      <video
        src={media}
        {...videoProps}
        className={`${videoClass} ${className}`}
        style={styleProps}
        onClick={onClick}
        aria-label={alt}
      />
    )
  }

  const imageClass = isThumbnail ? styles.imageSlider__thumbnailImage : styles.imageSlider__mainImage

  return (
    <div
      style={{backgroundImage: `url(${media})`, cursor: 'pointer', height: '100%'}}
      className={`${imageClass} ${className}`}
      role='img'
      aria-label={alt}
      onClick={onClick}
    />
  )
})

MediaRenderer.displayName = 'MediaRenderer'

// Кастомный хук для измерения контейнера
const useContainerWidth = (isClient: boolean) => {
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const measureContainer = useCallback(() => {
    if (typeof window === 'undefined') return

    const container = document.querySelector(`.${styles.imageSlider}`)
    if (container) {
      const rect = container.getBoundingClientRect()
      setContainerWidth(rect.width)
    } else {
      setContainerWidth(window.innerWidth)
    }
  }, [])

  useLayoutEffect(() => {
    if (!isClient) return

    const timer = setTimeout(() => {
      measureContainer()
    }, 10)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
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

  return containerWidth
}

// Основной компонент
const SlickCardSlider: React.FC<SlickCardSliderProps> = ({
  isLoading,
  imagesCustom,
  extraClass,
  productName = 'Товар',
  productId
}) => {
  const images = imagesCustom ?? DEFAULT_IMAGES
  const [isClient, setIsClient] = useState(false)
  const containerWidth = useContainerWidth(isClient)

  // Состояния слайдера
  const [activeIndex, setActiveIndex] = useState(0)
  const [mainLoaded, setMainLoaded] = useState(false)
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)

  // Состояния модального окна
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // Вычисляемые значения
  const isSingleImage = images.length === 1
  const slidesToShow = containerWidth
    ? calculateSlidesToShow(containerWidth, images.length)
    : Math.min(images.length, 4)

  // Инициализация клиентского рендера
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Конфигурации слайдеров
  const mainSliderOptions = useMemo(
    () => ({
      initial: 0,
      loop: !isSingleImage,
      slides: {
        perView: 1,
        spacing: 0
      },
      slideChanged: (slider: any) => {
        setActiveIndex(slider.track.details.rel)
      },
      created: () => {
        setMainLoaded(true)
      }
    }),
    [isSingleImage]
  )

  const thumbnailSliderOptions = useMemo(
    () => ({
      initial: 0,
      loop: false,
      mode: 'free-snap' as const,
      slides: {
        perView: slidesToShow,
        spacing: 16
      },
      created: () => {
        setThumbnailLoaded(true)
      }
    }),
    [slidesToShow]
  )

  const [mainSliderRef, mainInstanceRef] = useKeenSlider<HTMLDivElement>(mainSliderOptions)
  const [thumbnailSliderRef, thumbnailInstanceRef] = useKeenSlider<HTMLDivElement>(thumbnailSliderOptions)

  // Эффекты для обновления слайдеров
  useEffect(() => {
    if (!thumbnailInstanceRef.current || !mainInstanceRef.current || isSingleImage) return

    const timer = setTimeout(() => {
      try {
        thumbnailInstanceRef.current?.update({
          slides: {perView: slidesToShow, spacing: 16}
        })
        mainInstanceRef.current?.update()
      } catch (error) {
        console.warn('Slider update failed:', error)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [slidesToShow, containerWidth, thumbnailLoaded, mainLoaded, isSingleImage, thumbnailInstanceRef, mainInstanceRef])

  // Синхронизация миниатюр
  useEffect(() => {
    if (!thumbnailInstanceRef.current || activeIndex === undefined || !thumbnailLoaded || isSingleImage) return

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
  }, [activeIndex, slidesToShow, thumbnailLoaded, isSingleImage, thumbnailInstanceRef])

  // Обработчики
  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (isSingleImage) return

      setActiveIndex(index)
      mainInstanceRef.current?.moveToIdx(index)
    },
    [isSingleImage, mainInstanceRef]
  )

  const handleDoubleClick = useCallback((index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleModalNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      setModalImageIndex((prev) => {
        if (direction === 'prev') {
          return (prev - 1 + images.length) % images.length
        }
        return (prev + 1) % images.length
      })
    },
    [images.length]
  )

  const handleModalThumbnailClick = useCallback((index: number) => {
    setModalImageIndex(index)
  }, [])

  // Генерация структурированных данных
  const structuredData = useMemo(() => {
    const mediaObjects = images.map((media, index) => {
      const isVideo = getMediaType(media) === 'video'
      const fullUrl = getMediaUrl(media)

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
      }

      return {
        '@type': 'ImageObject',
        name: `Изображение товара ${productName} - ${index + 1}`,
        description: `Фотография товара ${productName}`,
        contentUrl: fullUrl,
        url: fullUrl,
        width: '500',
        height: '500'
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
  }, [images, productName, productId, activeIndex])

  // Рендер скелетона загрузки
  if (isLoading) {
    return <LoadingSkeleton extraClass={extraClass} isSingleImage={isSingleImage} />
  }

  // Рендер скелетона до получения размеров контейнера
  if (!isClient || (!isSingleImage && containerWidth === null)) {
    return <LoadingSkeleton extraClass={extraClass} isSingleImage={isSingleImage} />
  }

  return (
    <>
      <StructuredData data={structuredData} />

      <ModalGallery
        isOpen={isModalOpen}
        onClose={handleModalClose}
        images={images}
        currentIndex={modalImageIndex}
        productName={productName}
        onNavigate={handleModalNavigation}
        onThumbnailClick={handleModalThumbnailClick}
        isSingleImage={isSingleImage}
      />

      <ImageGallery
        images={images}
        activeIndex={activeIndex}
        productName={productName}
        productId={productId}
        extraClass={extraClass}
        isSingleImage={isSingleImage}
        mainSliderRef={mainSliderRef}
        thumbnailSliderRef={thumbnailSliderRef}
        mainLoaded={mainLoaded}
        thumbnailLoaded={thumbnailLoaded}
        mainInstanceRef={mainInstanceRef}
        onThumbnailClick={handleThumbnailClick}
        onDoubleClick={handleDoubleClick}
      />
    </>
  )
}

// Вспомогательные компоненты
const LoadingSkeleton: React.FC<{extraClass?: string; isSingleImage: boolean}> = ({extraClass, isSingleImage}) => (
  <div className={`spec__slider ${styles.imageSlider} ${extraClass}`}>
    <div className={styles.imageSlider__main}>
      <Skeleton width={500} height={500} />
    </div>
    {!isSingleImage && (
      <div className={`spec__slider spec__slider_2 ${styles.imageSlider__thumbnails}`}>
        {Array.from({length: 4}).map((_, index) => (
          <Skeleton key={index} width={100} height={100} style={{margin: '0 5px'}} />
        ))}
      </div>
    )}
  </div>
)

const StructuredData: React.FC<{data: any}> = ({data}) => (
  <script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />
)

const ModalGallery: React.FC<{
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  productName: string
  onNavigate: (direction: 'prev' | 'next') => void
  onThumbnailClick: (index: number) => void
  isSingleImage: boolean
}> = ({isOpen, onClose, images, currentIndex, productName, onNavigate, onThumbnailClick, isSingleImage}) => {
  const [modalThumbnailSliderRef, modalThumbnailInstanceRef] = useKeenSlider<HTMLDivElement>({
    initial: currentIndex,
    loop: false,
    mode: 'free-snap' as const,
    slides: {
      perView: 'auto',
      spacing: 12
    }
  })

  useEffect(() => {
    if (!modalThumbnailInstanceRef.current) return

    try {
      modalThumbnailInstanceRef.current.moveToIdx(currentIndex)
    } catch (error) {
      console.warn('Modal thumbnail sync failed:', error)
    }
  }, [currentIndex, modalThumbnailInstanceRef])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentMedia = images[currentIndex]
  const currentType = getMediaType(currentMedia)

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label='Закрыть'>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M18 6L6 18M6 6L18 18'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>

        <div className={styles.modalMain}>
          {!isSingleImage && (
            <ArrowButton
              direction='left'
              extraClass={styles.modalArrowLeft}
              disabled={false}
              onClick={() => onNavigate('prev')}
            />
          )}

          <div className={styles.modalImageContainer}>
            {currentType === 'video' ? (
              <video src={currentMedia} autoPlay muted loop playsInline controls className={styles.modalVideo} />
            ) : (
              <ZoomImage
                src={currentMedia}
                alt={`${productName} - изображение ${currentIndex + 1}`}
                className={styles.modalImageWrapper}
              />
            )}
          </div>

          {!isSingleImage && (
            <ArrowButton
              direction='right'
              extraClass={styles.modalArrowRight}
              disabled={false}
              onClick={() => onNavigate('next')}
            />
          )}
        </div>

        {!isSingleImage && (
          <div className={styles.modalThumbnails}>
            <div ref={modalThumbnailSliderRef} className='keen-slider'>
              {images.map((image, index) => {
                const type = getMediaType(image)
                return (
                  <div
                    key={index}
                    className={`keen-slider__slide ${styles.modalThumbnail} ${
                      index === currentIndex ? styles.modalThumbnailActive : ''
                    }`}
                    onClick={() => onThumbnailClick(index)}
                  >
                    <MediaRenderer
                      media={image}
                      alt={`${type === 'video' ? 'Видео' : 'Изображение'} ${index + 1}`}
                      type={type}
                      isThumbnail={true}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ImageGallery: React.FC<{
  images: string[]
  activeIndex: number
  productName: string
  productId?: string | number
  extraClass?: string
  isSingleImage: boolean
  mainSliderRef: (node: HTMLDivElement | null) => void
  thumbnailSliderRef: (node: HTMLDivElement | null) => void
  mainLoaded: boolean
  thumbnailLoaded: boolean
  mainInstanceRef: any
  onThumbnailClick: (index: number) => void
  onDoubleClick: (index: number) => void
}> = ({
  images,
  activeIndex,
  productName,
  productId,
  extraClass,
  isSingleImage,
  mainSliderRef,
  thumbnailSliderRef,
  mainLoaded,
  thumbnailLoaded,
  mainInstanceRef,
  onThumbnailClick,
  onDoubleClick
}) => (
  <div
    className={`spec__slider ${styles.imageSlider} ${extraClass}`}
    itemScope
    itemType='https://schema.org/ImageGallery'
  >
    <meta itemProp='name' content={`Галерея изображений ${productName}`} />
    <meta itemProp='description' content={`Фотографии и видео товара ${productName}`} />

    <MainSlider
      images={images}
      activeIndex={activeIndex}
      productName={productName}
      mainSliderRef={mainSliderRef}
      mainLoaded={mainLoaded}
      mainInstanceRef={mainInstanceRef}
      isSingleImage={isSingleImage}
      onDoubleClick={onDoubleClick}
    />

    {!isSingleImage && (
      <ThumbnailSlider
        images={images}
        activeIndex={activeIndex}
        productName={productName}
        thumbnailSliderRef={thumbnailSliderRef}
        thumbnailLoaded={thumbnailLoaded}
        onThumbnailClick={onThumbnailClick}
        onDoubleClick={onDoubleClick}
      />
    )}

    {!isSingleImage && mainLoaded && mainInstanceRef.current && (
      <div className={styles.imageSlider__navigation}>
        <ArrowButton
          direction='left'
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            mainInstanceRef.current?.prev()
          }}
          disabled={false}
        />
        <ArrowButton
          direction='right'
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            mainInstanceRef.current?.next()
          }}
          disabled={false}
        />
      </div>
    )}

    <ProductStructuredData productName={productName} productId={productId} />
  </div>
)

const MainSlider: React.FC<{
  images: string[]
  activeIndex: number
  productName: string
  mainSliderRef: (node: HTMLDivElement | null) => void
  mainLoaded: boolean
  mainInstanceRef: any
  isSingleImage: boolean
  onDoubleClick: (index: number) => void
}> = ({images, activeIndex, productName, mainSliderRef, onDoubleClick}) => (
  <div className={styles.imageSlider__main}>
    <div ref={mainSliderRef} className='keen-slider'>
      {images.map((image, index) => {
        const type = getMediaType(image)
        const isActive = index === activeIndex

        return (
          <div key={index} className={`keen-slider__slide ${styles.imageSlider__slide}`}>
            <MediaItem
              media={image}
              type={type}
              index={index}
              productName={productName}
              isActive={isActive}
              onDoubleClick={onDoubleClick}
            />
          </div>
        )
      })}
    </div>
  </div>
)

const MediaItem: React.FC<{
  media: string
  type: 'image' | 'video'
  index: number
  productName: string
  isActive: boolean
  onDoubleClick: (index: number) => void
}> = React.memo(({media, type, index, productName, isActive, onDoubleClick}) => {
  const mediaUrl = getMediaUrl(media)

  return (
    <div
      className={styles.imageSlider__imageWrapper}
      itemScope
      itemType={type === 'video' ? 'https://schema.org/VideoObject' : 'https://schema.org/ImageObject'}
      onDoubleClick={() => onDoubleClick(index)}
      style={{cursor: 'pointer'}}
    >
      <MediaRenderer
        media={media}
        alt={`${type === 'video' ? 'Видео' : 'Изображение'} товара ${productName} - ${index + 1}`}
        type={type}
      />

      {type === 'video' ? (
        <>
          <meta itemProp='name' content={`Видео товара ${productName} - ${index + 1}`} />
          <meta itemProp='description' content={`Демонстрация товара ${productName}`} />
          <meta itemProp='thumbnailUrl' content={mediaUrl} />
          <meta itemProp='uploadDate' content={new Date().toISOString()} />
          <meta itemProp='contentUrl' content={mediaUrl} />
        </>
      ) : (
        <>
          <meta itemProp='contentUrl' content={mediaUrl} />
          <meta itemProp='url' content={mediaUrl} />
          <meta itemProp='name' content={`Изображение товара ${productName} - ${index + 1}`} />
          <meta itemProp='description' content={`Фотография товара ${productName}`} />
          <meta itemProp='width' content='500' />
          <meta itemProp='height' content='500' />
          {isActive && <link itemProp='image' href={mediaUrl} />}
        </>
      )}
    </div>
  )
})

MediaItem.displayName = 'MediaItem'

const ThumbnailSlider: React.FC<{
  images: string[]
  activeIndex: number
  productName: string
  thumbnailSliderRef: (node: HTMLDivElement | null) => void
  thumbnailLoaded: boolean
  onThumbnailClick: (index: number) => void
  onDoubleClick: (index: number) => void
}> = ({images, activeIndex, productName, thumbnailSliderRef, onThumbnailClick, onDoubleClick}) => (
  <div className={`spec__slider spec__slider_2 ${styles.imageSlider__thumbnails}`}>
    <div ref={thumbnailSliderRef} className='keen-slider'>
      {images.map((image, index) => {
        const type = getMediaType(image)

        return (
          <div
            key={index}
            className={`keen-slider__slide ${styles.imageSlider__thumbnail} ${
              index === activeIndex ? styles.imageSlider__thumbnailActive : ''
            }`}
            onClick={() => onThumbnailClick(index)}
            onDoubleClick={() => onDoubleClick(index)}
            role='button'
            tabIndex={0}
            aria-label={`${type === 'video' ? 'Видео' : 'Изображение'} товара ${productName} - ${index + 1}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onThumbnailClick(index)
              }
            }}
            style={{cursor: 'pointer'}}
          >
            <MediaRenderer
              media={image}
              alt={`${type === 'video' ? 'Видео' : 'Изображение'} товара ${productName} - ${index + 1}`}
              type={type}
              isThumbnail={true}
            />
          </div>
        )
      })}
    </div>
  </div>
)

const ProductStructuredData: React.FC<{
  productName: string
  productId?: string | number
}> = ({productName, productId}) => (
  <div itemScope itemType='https://schema.org/Product' style={{display: 'none'}}>
    <meta itemProp='name' content={productName} />
    {productId && <meta itemProp='sku' content={`product-${productId}`} />}
  </div>
)

export default React.memo(SlickCardSlider)
