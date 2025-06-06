/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useRef, useEffect} from 'react'
import Image from 'next/image'
import Slider from 'react-slick'
import styles from './CardSlider.module.scss'
import Skeleton from 'react-loading-skeleton'

const CustomArrowLeft = ({className, onClick}: any) => (
  <div className={`${className} ${styles.customArrow} ${styles.customArrowLeft}`} onClick={onClick}>
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

const CustomArrowRight = ({className, onClick}: any) => (
  <div className={`${className} ${styles.customArrow} ${styles.customArrowRight}`} onClick={onClick}>
    <svg width='15' height='11' viewBox='0 0 15 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M8.293 0.293031C8.48053 0.105559 8.73484 0.000244141 9 0.000244141C9.26516 0.000244141 9.51947 0.105559 9.707 0.293031L14.207 4.79303C14.3945 4.98056 14.4998 5.23487 14.4998 5.50003C14.4998 5.76519 14.3945 6.0195 14.207 6.20703L9.707 10.707C9.5184 10.8892 9.2658 10.99 9.0036 10.9877C8.7414 10.9854 8.49059 10.8803 8.30518 10.6948C8.11977 10.5094 8.0146 10.2586 8.01233 9.99643C8.01005 9.73423 8.11084 9.48163 8.293 9.29303L11 6.50003H1.5C1.23478 6.50003 0.98043 6.39467 0.792893 6.20714C0.605357 6.0196 0.5 5.76525 0.5 5.50003C0.5 5.23481 0.605357 4.98046 0.792893 4.79292C0.98043 4.60539 1.23478 4.50003 1.5 4.50003H11L8.293 1.70703C8.10553 1.5195 8.00021 1.26519 8.00021 1.00003C8.00021 0.734866 8.10553 0.480558 8.293 0.293031Z'
        fill='#2A2E46'
      />
    </svg>
  </div>
)

const SlickCardSlider = ({isLoading}: {isLoading: boolean}) => {
  const images = [
    '/new_login.jpg',
    '/login__image.jpg',
    '/new_login.jpg',
    '/new_login.jpg',
    '/login__image.jpg',
    '/new_login.jpg',
    '/login__image.jpg'
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const mainSliderRef = useRef<Slider>(null)
  const thumbnailSliderRef = useRef<Slider>(null)

  useEffect(() => {
    if (thumbnailSliderRef.current) {
      const timer = setTimeout(() => {
        thumbnailSliderRef.current?.slickGoTo(activeIndex)
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [activeIndex])

  const mainSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    prevArrow: <CustomArrowLeft />,
    nextArrow: <CustomArrowRight />,
    beforeChange: (current: number, next: number) => {
      setActiveIndex(next)
    }
  }

  const thumbnailSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: images.length > 4 ? 4 : images.length,
    slidesToScroll: 1,
    focusOnSelect: true,
    centerMode: images.length > 4,
    centerPadding: '0px',
    arrows: false,
    swipeToSlide: true,
    initialSlide: activeIndex,
    responsive: [
      {
        breakpoint: 9999,
        settings: {
          slidesToShow: images.length > 4 ? 4 : images.length
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: images.length > 3 ? 3 : images.length
        }
      }
    ]
  }

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
    if (mainSliderRef.current) {
      mainSliderRef.current.slickGoTo(index, true)
    }
  }
  return (
    <div className={`spec__slider ${styles.imageSlider}`}>
      <div className={styles.imageSlider__main}>
        <Slider ref={mainSliderRef} {...mainSettings}>
          {images.map((image, index) => (
            <div key={index} className={styles.imageSlider__slide}>
              <div className={styles.imageSlider__imageWrapper}>
                {!isLoading ? (
                  <Image
                    src={image}
                    alt={`Slide ${index + 1}`}
                    width={500}
                    height={500}
                    layout='responsive'
                    className={styles.imageSlider__mainImage}
                  />
                ) : (
                  <Skeleton width={500} height={500} />
                )}
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className={`spec__slider spec__slider_2 ${styles.imageSlider__thumbnails}`}>
        <Slider ref={thumbnailSliderRef} {...thumbnailSettings}>
          {!isLoading
            ? images.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.imageSlider__thumbnail} ${
                    index === activeIndex ? styles.imageSlider__thumbnailActive : ''
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <Image src={image} alt={`Thumbnail ${index + 1}`} width={100} height={100} layout='responsive' />
                </div>
              ))
            : Array.from({length: images.length}).map((_, index) => <Skeleton key={index} width={100} height={100} />)}
        </Slider>
      </div>
    </div>
  )
}

export default SlickCardSlider
