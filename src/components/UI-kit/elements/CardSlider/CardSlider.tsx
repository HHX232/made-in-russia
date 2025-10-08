/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo} from 'react'
import {useKeenSlider} from 'keen-slider/react'
import styles from './CardSlider.module.scss'
import Skeleton from 'react-loading-skeleton'
import ModalWindowDefault from '../../modals/ModalWindowDefault/ModalWindowDefault'

// Типы
interface ZoomImageProps {
  src: string
  alt?: string
  zoom?: number
  lensSize?: number
  className?: string
}

interface ArrowButtonProps {
  onClick: (e: React.MouseEvent) => void
  disabled: boolean
  extraClass?: string
  direction: 'left' | 'right'
}

// interface SliderImage {
//   src: string
//   alt?: string
//   type: 'image' | 'video'
// }

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

const ARROW_SVG_PATH =
  'M8.293 0.293031C8.48053 0.105559 8.73484 0.000244141 9 0.000244141C9.26516 0.000244141 9.51947 0.105559 9.707 0.293031L14.207 4.79303C14.3945 4.98056 14.4998 5.23487 14.4998 5.50003C14.4998 5.76519 14.3945 6.0195 14.207 6.20703L9.707 10.707C9.5184 10.8892 9.2658 10.99 9.0036 10.9877C8.7414 10.9854 8.49059 10.8803 8.30518 10.6948C8.11977 10.5094 8.0146 10.2586 8.01233 9.99643C8.01005 9.73423 8.11084 9.48163 8.293 9.29303L11 6.50003H1.5C1.23478 6.50003 0.98043 6.39467 0.792893 6.20714C0.605357 6.0196 0.5 5.76525 0.5 5.50003C0.5 5.23481 0.605357 4.98046 0.792893 4.79292C0.98043 4.60539 1.23478 4.50003 1.5 4.50003H11L8.293 1.70703C8.10553 1.5195 8.00021 1.26519 8.00021 1.00003C8.00021 0.734866 8.10553 0.480558 8.293 0.293031Z'

// Вспомогательные функции
const getMediaType = (src: string): 'image' | 'video' => (src.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image')

const getMediaUrl = (media: string): string => {
  if (media.startsWith('http')) return media

  const baseUrl =
    typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin : 'https://exporteru.com'

  return `${baseUrl}${media}`
}

const calculateSlidesToShow = (containerWidth: number, imagesLength: number): number => {
  if (containerWidth < 350) return Math.min(imagesLength, 2)
  if (containerWidth < 400) return Math.min(imagesLength, 2)
  if (containerWidth < 500) return Math.min(imagesLength, 3)
  return Math.min(imagesLength, 4)
}

// Компоненты
export const ZoomImage: React.FC<ZoomImageProps> = React.memo(
  ({src, alt = 'zoom', zoom = 2, lensSize = 150, className = ''}) => {
    const imgRef = useRef<HTMLImageElement>(null)
    const [lensPos, setLensPos] = useState<{x: number; y: number} | null>(null)

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!imgRef.current) return

        const rect = imgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const posX = Math.max(lensSize / 2, Math.min(x, rect.width - lensSize / 2))
        const posY = Math.max(lensSize / 2, Math.min(y, rect.height - lensSize / 2))

        setLensPos({x: posX, y: posY})
      },
      [lensSize]
    )

    const handleMouseLeave = useCallback(() => {
      setLensPos(null)
    }, [])

    const lensStyle = useMemo(() => {
      if (!lensPos || !imgRef.current) return {}

      return {
        width: lensSize,
        height: lensSize,
        top: lensPos.y - lensSize / 2,
        left: lensPos.x - lensSize / 2,
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${(imgRef.current.width || 0) * zoom}px ${(imgRef.current.height || 0) * zoom}px`,
        backgroundPosition: `-${lensPos.x * zoom - lensSize / 2}px -${lensPos.y * zoom - lensSize / 2}px`
      }
    }, [lensPos, lensSize, zoom, src])

    return (
      <div
        className={`${styles.zoomImageWrapper} ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img ref={imgRef} src={src} alt={alt} className={styles.zoomImage} />
        {lensPos && <div className={styles.zoomLens} style={lensStyle} />}
      </div>
    )
  }
)

ZoomImage.displayName = 'ZoomImage'

const ArrowButton: React.FC<ArrowButtonProps> = React.memo(({onClick, disabled, extraClass = '', direction}) => {
  const arrowClass = useMemo(
    () =>
      `${styles.customArrow} ${styles[`customArrow${direction === 'left' ? 'Left' : 'Right'}`]} ${
        disabled ? styles.customArrowDisabled : ''
      } ${extraClass}`,
    [direction, disabled, extraClass]
  )

  const svgStyle = direction === 'left' ? {transform: 'rotate(180deg)'} : {}

  return (
    <div className={arrowClass} onClick={onClick} role='button' tabIndex={0}>
      <svg style={svgStyle} width='15' height='11' viewBox='0 0 15 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d={ARROW_SVG_PATH} fill='#2A2E46' />
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
      style={{backgroundImage: `url(${media})`, cursor: 'pointer'}}
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

  // Генерация структурированных данных
  const structuredData = useMemo(() => {
    // const baseUrl =
    //   typeof window !== 'undefined'
    //     ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    //     : 'https://exporteru.com'

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
  isSingleImage: boolean
}> = ({isOpen, onClose, images, currentIndex, productName, onNavigate, isSingleImage}) => (
  <ModalWindowDefault extraClass={styles.imageModalLarge} isOpen={isOpen} onClose={onClose}>
    <div className={styles.modalImageContainer}>
      {!isSingleImage && (
        <ArrowButton
          direction='left'
          extraClass={styles.customArrowStyles}
          disabled={false}
          onClick={() => onNavigate('prev')}
        />
      )}

      {getMediaType(images[currentIndex]) === 'video' ? (
        <video
          src={images[currentIndex]}
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline='true'
          controls
          className={styles.modalVideo}
        />
      ) : (
        <ZoomImage
          src={images[currentIndex]}
          alt={`${productName} - увеличенное изображение`}
          zoom={2}
          lensSize={150}
          className={styles.modalImage}
        />
      )}

      {!isSingleImage && (
        <ArrowButton
          direction='right'
          extraClass={styles.customArrowStyles}
          disabled={false}
          onClick={() => onNavigate('next')}
        />
      )}
    </div>
  </ModalWindowDefault>
)

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
}> = ({images, activeIndex, productName, mainSliderRef, mainLoaded, mainInstanceRef, isSingleImage, onDoubleClick}) => (
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

    {!isSingleImage && mainLoaded && mainInstanceRef.current && (
      <>
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
      </>
    )}
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
}> = ({
  images,
  activeIndex,
  productName,
  thumbnailSliderRef,
  // thumbnailLoaded,
  onThumbnailClick,
  onDoubleClick
}) => (
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
