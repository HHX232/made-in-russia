import {useKeenSlider} from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import {useState, useRef, useEffect} from 'react'
import Image from 'next/image'
import styles from './LoginSlider.module.scss'
import {useTranslations} from 'next-intl'
import useWindowWidth from '@/hooks/useWindoWidth'

interface Slide {
  title: string
  description: string
  image: string
}

const LoginSlider = () => {
  const t = useTranslations('LoginSlider')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const windowWidth = useWindowWidth()
  const textWrapRef = useRef<HTMLDivElement | null>(null)
  const navigationRef = useRef<HTMLDivElement | null>(null)

  const slides: Slide[] = [
    {
      title: t('slide2Title'),
      description: t('slide2Description'),
      image: '/imagesNew/registration-slider/slide-3.webp'
    },
    {
      title: t('slide3Title'),
      description: t('slide3Description'),
      image: '/imagesNew/registration-slider/slide-2.webp'
    },
    {
      title: t('slide4Title'),
      description: t('slide4Description'),
      image: '/imagesNew/registration-slider/slide-1.webp'
    },
    {
      title: t('slide1Title'),
      description: t('slide1Description'),
      image: '/imagesNew/registration-slider/slide-3.webp'
    }
  ]

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: {
      perView: 1,
      spacing: 0
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
    loop: true
  })

  // useEffect(() => {
  //   if ((windowWidth && windowWidth > 840) || !textWrapRef.current || !navigationRef.current) return
  //   const rect = textWrapRef.current.offsetHeight
  //   const offset = 10
  //   navigationRef.current.style.top = `${rect + offset}px`
  // }, [windowWidth, currentSlide, loaded])

  useEffect(() => {
    if (!loaded || !textWrapRef.current || !navigationRef.current || (windowWidth && windowWidth > 840)) return
    const rect = textWrapRef.current.offsetHeight
    const offset = 10
    navigationRef.current.style.top = `${(rect + offset) / 2.5}px`
  }, [windowWidth, loaded])

  return (
    <div className={styles.slider__container}>
      <div ref={sliderRef} className='keen-slider'>
        {slides.map((slide, idx) => (
          <div key={idx} className={`keen-slider__slide ${styles.slider__slide}`}>
            <div className={styles.slider__card}>
              <div ref={textWrapRef} className={styles.slider__textwrap}>
                <h2 className={styles.slider__title}>{slide.title}</h2>
                <p className={styles.slider__description}>{slide.description}</p>
              </div>
              <div className={styles.slider__image}>
                <Image src={slide.image} width={580} height={745} alt={slide.title} style={{objectFit: 'cover'}} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {loaded && instanceRef.current && (
        <div ref={navigationRef} className={styles.navigation__wrap}>
          <div className={styles.navigation__arrows}>
            <div className={`${styles.arrow} ${styles.arrow__left}`} onClick={() => instanceRef.current?.prev()} />
            <div className={`${styles.arrow} ${styles.arrow__right}`} onClick={() => instanceRef.current?.next()} />
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginSlider
