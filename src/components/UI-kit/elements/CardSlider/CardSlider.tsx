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

interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
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

const SLIDER_ASPECT_RATIO = 4 / 3

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

const loadImageDimensions = (src: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio
      })
    }
    img.onerror = reject
    img.src = src
  })
}

const getImageDisplayType = (
  aspectRatio: number,
  sliderAspectRatio: number = SLIDER_ASPECT_RATIO
): 'vertical' | 'horizontal' | 'wide' => {
  if (aspectRatio < 0.9) {
    return 'vertical'
  }

  if (aspectRatio >= 0.9 && aspectRatio <= sliderAspectRatio * 1.2) {
    return 'horizontal'
  }

  return 'wide'
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

const ZoomIcon: React.FC = () => (
  <svg
    className={styles.zoomIcon}
    fill='#ffffff'
    height='24px'
    width='24px'
    version='1.1'
    viewBox='0 0 512.001 512.001'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g>
      <g>
        <path d='M271.299,87.961c-46.862-46.863-121.118-50.95-172.726-9.507c-3.775,3.031-4.378,8.55-1.346,12.327c3.031,3.775,8.551,4.378,12.327,1.346c44.618-35.832,108.822-32.291,149.346,8.233c43.709,43.709,43.709,114.827,0,158.536c-21.173,21.173-49.324,32.833-79.268,32.833s-58.095-11.66-79.268-32.833c-38.328-38.328-43.802-98.444-13.015-142.943c2.755-3.981,1.761-9.443-2.221-12.198c-3.984-2.755-9.444-1.759-12.2,2.222c-35.61,51.471-29.286,120.998,15.035,165.32c24.485,24.485,57.041,37.97,91.668,37.97s67.182-13.485,91.668-37.97C321.843,220.751,321.843,138.507,271.299,87.961z' />
      </g>
    </g>
    <g>
      <g>
        <path d='M225.034,170.861h-36.636v-36.636c0-4.842-3.926-8.768-8.768-8.768c-4.843,0-8.768,3.926-8.768,8.768v36.636h-36.636c-4.843,0-8.768,3.926-8.768,8.768s3.925,8.768,8.768,8.768h36.636v36.636c0,4.842,3.924,8.768,8.768,8.768c4.843,0,8.768-3.926,8.768-8.768v-36.636h36.636c4.843,0,8.768-3.926,8.768-8.768S229.878,170.861,225.034,170.861z' />
      </g>
    </g>
    <g>
      <g>
        <path d='M492.544,415.283c-3.245-4.508-6.894-8.971-10.844-13.266c-3.278-3.563-8.823-3.797-12.39-0.518c-3.564,3.278-3.796,8.825-0.518,12.39c3.479,3.782,6.682,7.699,9.522,11.641c29.238,40.607,9.978,58.689,8.519,59.963c-0.582,0.44-0.911,0.803-1.374,1.387c-0.174,0.22-17.946,21.66-59.928-8.568c-22.406-16.133-37.798-39.319-54.094-63.867c-14.869-22.399-31.48-47.422-55.632-70.119c0.311,0.292,5.376-3.4,5.869-3.745c9.241-6.474,17.114-14.93,22.642-24.784c22.703,24.162,47.733,40.783,70.137,55.658c10.308,6.845,20.045,13.31,29.227,20.207c3.873,2.907,9.368,2.127,12.276-1.744c2.909-3.871,2.128-9.368-1.743-12.276c-9.59-7.204-19.533-13.805-30.06-20.795c-24.692-16.395-50.182-33.353-72.865-59.524c3.208-15.176,0.312-30.207-9.16-40.935c31.411-66.667,19.611-148.8-35.421-203.834c-70.07-70.07-184.084-70.071-254.155,0c-70.07,70.071-70.07,184.082,0,254.153c33.462,33.462,77.958,52.147,125.288,52.616c0.029,0,0.058,0,0.089,0c4.8,0,8.718-3.868,8.766-8.681c0.048-4.842-3.839-8.807-8.681-8.854c-42.712-0.423-82.864-17.286-113.06-47.481c-63.233-63.233-63.233-166.121,0-229.354c63.231-63.231,166.121-63.233,229.354,0c52.009,52.009,61.229,130.84,27.684,192.372c-15.226,27.929-38.865,51.171-67.031,65.954c-13.655,7.166-28.323,12.38-43.664,15.419c-4.75,0.941-7.839,5.554-6.897,10.304c0.942,4.75,5.559,7.842,10.304,6.897c14.527-2.877,28.503-7.525,41.705-13.761c7.702,6.786,17.975,10.502,29.229,10.503c3.912,0,7.855-0.443,11.771-1.279c26.114,22.66,43.047,48.12,59.42,72.782c17.204,25.917,33.455,50.397,58.455,68.399c17.978,12.944,34.765,19.459,50.081,19.458c3.909,0,7.723-0.424,11.435-1.275c12.489-2.861,19.575-9.759,21.746-12.18c2.422-2.17,9.32-9.255,12.182-21.746C514.908,458.544,508.791,437.847,492.544,415.283z M285.634,335.103c-3.373,0-7.656-0.499-11.83-2.374c23.189-14.267,43.122-33.99,57.692-56.988c0.241-0.379,0.486-0.755,0.724-1.136c0.172-0.276,0.353-0.546,0.523-0.822c2.955,6.47,3.18,14.431,0.894,22.536c-0.11,0.268-0.222,0.534-0.306,0.815C327.314,317.248,307.283,335.103,285.634,335.103z' />
      </g>
    </g>
  </svg>
)

const MediaRenderer: React.FC<{
  media: string
  alt: string
  type: 'image' | 'video'
  className?: string
  isThumbnail?: boolean
  onClick?: () => void
  showZoomIcon?: boolean
  onZoomClick?: () => void
  aspectRatio?: number
  displayType?: 'vertical' | 'horizontal' | 'wide'
}> = React.memo(
  ({
    media,
    alt,
    type,
    className = '',
    isThumbnail = false,
    onClick,
    showZoomIcon = false,
    onZoomClick,
    displayType
  }) => {
    const [isHovered, setIsHovered] = useState(false)

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

    const handleZoomClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (onZoomClick) {
        onZoomClick()
      }
    }

    if (type === 'video' || isThumbnail) {
      const videoClass = isThumbnail ? styles.imageSlider__thumbnailVideo : styles.imageSlider__mainVideo

      if (type === 'video') {
        return (
          <div
            className={styles.mediaRendererWrapper}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <video
              src={media}
              {...videoProps}
              className={`${videoClass} ${className}`}
              style={styleProps}
              onClick={onClick}
              aria-label={alt}
            />
            {showZoomIcon && !isThumbnail && isHovered && (
              <div
                onClick={handleZoomClick}
                onDoubleClick={handleZoomClick}
                style={{position: 'absolute', top: '16px', right: '16px', zIndex: 10}}
              >
                <ZoomIcon />
              </div>
            )}
          </div>
        )
      }

      const imageClass = styles.imageSlider__thumbnailImage

      return (
        <div
          className={styles.mediaRendererWrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            style={{backgroundImage: `url(${media})`, cursor: 'pointer', height: '100%'}}
            className={`${imageClass} ${className}`}
            role='img'
            aria-label={alt}
            onClick={onClick}
          />
        </div>
      )
    }

    const needsBackground = displayType === 'vertical' || displayType === 'wide'

    return (
      <div
        className={styles.mediaRendererWrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {needsBackground && (
          <div className={styles.imageSlider__backgroundImage} style={{backgroundImage: `url(${media})`}} />
        )}
        <div
          style={{
            backgroundImage: `url(${media})`,
            cursor: 'pointer',
            height: '100%',
            position: needsBackground ? 'relative' : 'static',
            zIndex: needsBackground ? 1 : 'auto'
          }}
          className={`${styles.imageSlider__mainImage} ${className} ${
            displayType === 'vertical' ? styles.imageSlider__mainImageVertical : ''
          }`}
          role='img'
          aria-label={alt}
          onClick={onClick}
        />
        {showZoomIcon && isHovered && (
          <div
            onClick={handleZoomClick}
            onDoubleClick={handleZoomClick}
            style={{position: 'absolute', top: '16px', right: '16px', zIndex: 10}}
          >
            <ZoomIcon />
          </div>
        )}
      </div>
    )
  }
)

MediaRenderer.displayName = 'MediaRenderer'

const useContainerWidth = (isClient: boolean) => {
  // ИЗМЕНИ эту строку:
  const [containerWidth, setContainerWidth] = useState<number | null>(() => {
    if (typeof window === 'undefined' || !isClient) return null
    return window.innerWidth // Используем ширину окна как начальное значение
  })

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

  // УБЕРИ useEffect который я добавил выше

  useLayoutEffect(() => {
    if (!isClient) return

    // Добавь несколько замеров подряд
    measureContainer()

    const timer1 = requestAnimationFrame(() => {
      measureContainer()
    })

    const timer2 = setTimeout(() => {
      measureContainer()
    }, 0)

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
      cancelAnimationFrame(timer1)
      clearTimeout(timer2)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [isClient, measureContainer])

  return containerWidth
}

const useImageDimensions = (images: string[]) => {
  const [dimensions, setDimensions] = useState<Map<string, ImageDimensions>>(new Map())

  useEffect(() => {
    const loadDimensions = async () => {
      const newDimensions = new Map<string, ImageDimensions>()

      for (const image of images) {
        if (getMediaType(image) === 'image') {
          try {
            const dims = await loadImageDimensions(image)
            newDimensions.set(image, dims)
          } catch (error) {
            console.error(`Failed to load dimensions for ${image}:`, error)
          }
        }
      }

      setDimensions(newDimensions)
    }

    loadDimensions()
  }, [images])

  return dimensions
}

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
  const imageDimensions = useImageDimensions(images)

  const [activeIndex, setActiveIndex] = useState(0)
  const [mainLoaded, setMainLoaded] = useState(false)
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  const isSingleImage = images.length === 1
  const slidesToShow = containerWidth
    ? calculateSlidesToShow(containerWidth, images.length)
    : Math.min(images.length, 4)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
      rubberband: false,
      created: () => {
        setThumbnailLoaded(true)
      }
    }),
    [slidesToShow]
  )

  const [mainSliderRef, mainInstanceRef] = useKeenSlider<HTMLDivElement>(mainSliderOptions)
  const [thumbnailSliderRef, thumbnailInstanceRef] = useKeenSlider<HTMLDivElement>(thumbnailSliderOptions)

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

  useEffect(() => {
    if (!thumbnailInstanceRef.current || activeIndex === undefined || !thumbnailLoaded || isSingleImage) return

    try {
      const thumbnailSlider = thumbnailInstanceRef.current
      const details = thumbnailSlider.track.details

      if (!details) return

      const visibleSlidesCount = Math.floor(slidesToShow)
      const firstVisibleIndex = Math.floor(details.abs)
      const lastVisibleIndex = firstVisibleIndex + visibleSlidesCount - 1

      const isVisible = activeIndex >= firstVisibleIndex && activeIndex <= lastVisibleIndex

      if (!isVisible) {
        let targetPosition: number

        if (activeIndex < firstVisibleIndex) {
          targetPosition = Math.max(0, activeIndex)
        } else {
          targetPosition = Math.max(
            0,
            Math.min(activeIndex - visibleSlidesCount + 1, images.length - visibleSlidesCount)
          )
        }

        thumbnailSlider.moveToIdx(targetPosition, true)
      }
    } catch (error) {
      console.warn('Thumbnail sync failed:', error)
    }
  }, [activeIndex, slidesToShow, thumbnailLoaded, isSingleImage, images.length, thumbnailInstanceRef])

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

  const handleModalThumbnailClick = useCallback((index: number) => {
    setModalImageIndex(index)
  }, [])

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

  if (isLoading) {
    return <LoadingSkeleton extraClass={extraClass} isSingleImage={isSingleImage} />
  }

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
        imageDimensions={imageDimensions}
      />
    </>
  )
}

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
  onThumbnailClick: (index: number) => void
  isSingleImage: boolean
}> = ({isOpen, onClose, images, currentIndex, productName, onThumbnailClick, isSingleImage}) => {
  const [localIndex, setLocalIndex] = useState(currentIndex)

  const [modalMainSliderRef, modalMainInstanceRef] = useKeenSlider<HTMLDivElement>({
    initial: currentIndex,
    loop: !isSingleImage,
    slides: {
      perView: 1,
      spacing: 0
    },
    slideChanged: (slider: any) => {
      const newIndex = slider.track.details.rel
      setLocalIndex(newIndex)
      onThumbnailClick(newIndex)
    }
  })

  const [modalThumbnailSliderRef, modalThumbnailInstanceRef] = useKeenSlider<HTMLDivElement>({
    initial: currentIndex,
    loop: false,
    mode: 'free-snap' as const,
    slides: {
      perView: 'auto',
      spacing: 12
    },
    rubberband: false
  })

  useEffect(() => {
    if (!modalMainInstanceRef.current) return

    const currentSlide = modalMainInstanceRef.current.track.details.rel
    if (currentIndex !== localIndex && currentIndex !== currentSlide) {
      modalMainInstanceRef.current.moveToIdx(currentIndex, true)
      setLocalIndex(currentIndex)
    }
  }, [currentIndex, localIndex, modalMainInstanceRef])

  useEffect(() => {
    if (!modalThumbnailInstanceRef.current) return

    try {
      modalThumbnailInstanceRef.current.moveToIdx(localIndex, true)
    } catch (error) {
      console.warn('Modal thumbnail sync failed:', error)
    }
  }, [localIndex, modalThumbnailInstanceRef])

  const handleArrowClick = useCallback(
    (direction: 'prev' | 'next') => {
      if (!modalMainInstanceRef.current) return

      const slider = modalMainInstanceRef.current
      const currentIdx = slider.track.details.rel
      const nextIdx =
        direction === 'prev' ? (currentIdx - 1 + images.length) % images.length : (currentIdx + 1) % images.length

      slider.moveToIdx(nextIdx, true)
    },
    [images.length, modalMainInstanceRef]
  )

  const isAtStart = localIndex === 0
  const isAtEnd = localIndex === images.length - 1

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
              disabled={!isSingleImage && isAtStart}
              onClick={(e) => {
                e.stopPropagation()
                if (!isAtStart) {
                  handleArrowClick('prev')
                }
              }}
            />
          )}

          <div className={styles.modalImageContainer}>
            <div ref={modalMainSliderRef} className='keen-slider' style={{height: '100%'}}>
              {images.map((media, index) => {
                const type = getMediaType(media)
                return (
                  <div
                    key={index}
                    className='keen-slider__slide'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}
                  >
                    {type === 'video' ? (
                      <video src={media} autoPlay muted loop playsInline controls className={styles.modalVideo} />
                    ) : (
                      <ZoomImage
                        src={media}
                        alt={`${productName} - изображение ${index + 1}`}
                        className={styles.modalImageWrapper}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {!isSingleImage && (
            <ArrowButton
              direction='right'
              extraClass={styles.modalArrowRight}
              disabled={!isSingleImage && isAtEnd}
              onClick={(e) => {
                e.stopPropagation()
                if (!isAtEnd) {
                  handleArrowClick('next')
                }
              }}
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
                      index === localIndex ? styles.modalThumbnailActive : ''
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
  imageDimensions: Map<string, ImageDimensions>
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
  onDoubleClick,
  imageDimensions
}) => {
  const isAtStart = activeIndex === 0
  const isAtEnd = activeIndex === images.length - 1

  return (
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
        imageDimensions={imageDimensions}
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
              if (!isAtStart) {
                mainInstanceRef.current?.prev()
              }
            }}
            disabled={isAtStart}
          />
          <ArrowButton
            direction='right'
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              if (!isAtEnd) {
                mainInstanceRef.current?.next()
              }
            }}
            disabled={isAtEnd}
          />
        </div>
      )}

      <ProductStructuredData productName={productName} productId={productId} />
    </div>
  )
}

const MainSlider: React.FC<{
  images: string[]
  activeIndex: number
  productName: string
  mainSliderRef: (node: HTMLDivElement | null) => void
  mainLoaded: boolean
  mainInstanceRef: any
  isSingleImage: boolean
  onDoubleClick: (index: number) => void
  imageDimensions: Map<string, ImageDimensions>
}> = ({images, activeIndex, productName, mainSliderRef, onDoubleClick, imageDimensions}) => (
  <div className={styles.imageSlider__main}>
    <div ref={mainSliderRef} className='keen-slider'>
      {images.map((image, index) => {
        const type = getMediaType(image)
        const isActive = index === activeIndex
        const dims = imageDimensions.get(image)
        const displayType = dims ? getImageDisplayType(dims.aspectRatio) : undefined

        return (
          <div key={index} className={`keen-slider__slide ${styles.imageSlider__slide}`}>
            <MediaItem
              media={image}
              type={type}
              index={index}
              productName={productName}
              isActive={isActive}
              onDoubleClick={onDoubleClick}
              aspectRatio={dims?.aspectRatio}
              displayType={displayType}
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
  aspectRatio?: number
  displayType?: 'vertical' | 'horizontal' | 'wide'
}> = React.memo(({media, type, index, productName, isActive, onDoubleClick, aspectRatio, displayType}) => {
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
        showZoomIcon={true}
        onZoomClick={() => onDoubleClick(index)}
        aspectRatio={aspectRatio}
        displayType={displayType}
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
}> = ({images, activeIndex, productName, thumbnailSliderRef, onThumbnailClick, onDoubleClick}) => {
  const prevActiveIndex = useRef(activeIndex)

  const [localRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      initial: 0,
      loop: false,
      mode: 'free' as const,
      slides: {
        perView: 'auto',
        spacing: 16
      },
      rubberband: false,
      drag: true
    },
    [
      (slider) => {
        let timeout2: ReturnType<typeof setTimeout> | undefined

        function clearNextTimeout() {
          if (timeout2) {
            clearTimeout(timeout2)
          }
        }

        slider.on('created', () => {
          const container = slider.container
          if (container) {
            const style = document.createElement('style')
            style.textContent = `
              .keen-slider.thumbnails-linear {
                transition-timing-function: linear !important;
              }
              .keen-slider.thumbnails-linear .keen-slider__slide {
                transition-timing-function: linear !important;
              }
            `
            document.head.appendChild(style)
            container.classList.add('thumbnails-linear')
          }
        })

        slider.on('dragStarted', clearNextTimeout)
        slider.on('animationEnded', () => {
          clearNextTimeout()
        })

        return () => {
          clearNextTimeout()
        }
      }
    ]
  )

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      localRef(node)
      thumbnailSliderRef(node)
    },
    [localRef, thumbnailSliderRef]
  )

  useEffect(() => {
    if (!instanceRef.current || activeIndex === undefined) return

    const animate = () => {
      try {
        const slider = instanceRef.current
        if (!slider) return

        const details = slider.track.details
        if (!details) return

        const slidesToShow = Math.floor(slider.size / (140 + 16))
        const firstVisibleIndex = Math.floor(details.abs)
        const lastVisibleIndex = firstVisibleIndex + slidesToShow - 1

        const isVisible = activeIndex >= firstVisibleIndex && activeIndex <= lastVisibleIndex

        if (!isVisible) {
          let targetPosition: number
          if (activeIndex < firstVisibleIndex) {
            targetPosition = Math.max(0, activeIndex)
          } else {
            targetPosition = Math.max(0, Math.min(activeIndex - slidesToShow + 1, images.length - slidesToShow))
          }

          const indexDiff = Math.abs(activeIndex - prevActiveIndex.current)
          const isFastTransition = indexDiff === 1

          if (isFastTransition) {
            slider.moveToIdx(targetPosition, true)
          } else {
            const currentPos = details.abs
            const distance = Math.abs(targetPosition - currentPos)
            const duration = Math.min(300 + distance * 50, 800)

            const startTime = performance.now()
            const startPos = currentPos

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)

              const newPos = startPos + (targetPosition - startPos) * progress

              slider.moveToIdx(newPos, false)

              if (progress < 1) {
                requestAnimationFrame(animate)
              }
            }

            requestAnimationFrame(animate)
          }
        }

        prevActiveIndex.current = activeIndex
      } catch (error) {
        console.warn('Thumbnail sync failed:', error)
      }
    }

    const timer = setTimeout(animate, 10)
    return () => clearTimeout(timer)
  }, [activeIndex, images.length, instanceRef])

  return (
    <div className={`spec__slider spec__slider_2 ${styles.imageSlider__thumbnails}`}>
      <div ref={combinedRef} className='keen-slider'>
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
}

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
