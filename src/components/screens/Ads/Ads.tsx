'use client'
import {FC, ReactNode, useMemo} from 'react'
import styles from './Promo.module.scss'
import {StaticImageData} from 'next/image'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Lazy loading слайдера
const Slider = dynamic(() => import('react-slick').then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className={styles.slider__loading}>Загрузка...</div>
})

// Константы для изображений
const PROMO_IMAGES = {
  promo1: '/ads1.webp',
  promo2: '/ads2.webp',
  promo3: '/ads3.webp'
} as const

interface IPromoItem {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  text?: string | ReactNode
  image: string | StaticImageData
  extraClass?: string
  extraStyle?: React.CSSProperties
  href: string
  priority?: boolean
  sizes?: string
}

const PromoItem: FC<IPromoItem> = ({
  title,
  subtitle,
  text,
  image,
  extraClass,
  extraStyle,
  href = '#',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 993px) 50vw, 33vw'
}) => {
  const imageUrl = typeof image === 'string' ? image : image.src

  return (
    <Link style={extraStyle} href={href} className={`${styles.promo__item_box} ${extraClass || ''}`}>
      {/* Оптимизированное изображение как фон */}
      <div className={styles.promo__item_bg}>
        <Image
          src={imageUrl}
          alt=''
          fill
          sizes={sizes}
          priority={priority}
          quality={85}
          placeholder='blur'
          blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+on//Z'
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>

      <div className={styles.promo__item_box__inner}>
        {typeof title === 'string' ? <h2 className={`${styles.el__title} fontInstrument`}>{title}</h2> : title}
        {typeof subtitle === 'string' ? (
          <p className={`${styles.el__subtitle} fontInstrument`}>{subtitle}</p>
        ) : (
          subtitle
        )}
        {typeof text === 'string' ? <p className={`${styles.el__text} fontInstrument`}>{text}</p> : text}
      </div>
    </Link>
  )
}

const Promo: FC = () => {
  // Мемоизация настроек слайдера
  const sliderSettings = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 1500,
      slidesToShow: 2,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4500,
      lazyLoad: 'ondemand' as const,
      responsive: [
        {
          breakpoint: 670,
          settings: {
            speed: 1500,
            autoplay: true,
            autoplaySpeed: 4500,
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    }),
    []
  )

  // Мемоизация элементов промо
  const promoItems = useMemo(
    () => ({
      main: (
        <PromoItem
          extraClass={styles.promo__item_box_1}
          href='#'
          title='Горящие скидки на дерево'
          subtitle='Успей и закажи прямо сейчас'
          text={
            <p className={`${styles.spec__text} fontInstrument`}>
              Только с <span>20 АПРЕЛЯ</span> по <span>14 МАЯ</span>
            </p>
          }
          image={PROMO_IMAGES.promo1}
          priority={true}
          sizes='(max-width: 768px) 100vw, (max-width: 993px) 100vw, 66vw'
        />
      ),
      coal: (
        <PromoItem
          href='#'
          extraStyle={{height: '100%'}}
          title={<h3 className={`${styles.second__title} fontInstrument`}>Новая поставка угля</h3>}
          subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>Бери пока не раскупили!</p>}
          text=''
          image={PROMO_IMAGES.promo2}
          sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
        />
      ),
      stone: (
        <PromoItem
          href='#'
          extraStyle={{height: '100%'}}
          title={<p className={`${styles.third__title} fontInstrument`}>Камень со скидкой</p>}
          subtitle={<p className={`${styles.third__subtitle} fontInstrument`}>до 40%</p>}
          text={<p className={`${styles.third__text} fontInstrument`}>Скидка работает только при самовывозе*</p>}
          image={PROMO_IMAGES.promo3}
          sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
        />
      )
    }),
    []
  )

  return (
    <div className={styles.promo_box}>
      <div className='container'>
        <div className={styles.promo_box__inner}>
          {promoItems.main}

          <div className={`${styles.promo__item_box_2} ${styles.desktop_only}`}>{promoItems.coal}</div>

          <div className={`${styles.promo__item_box_3} ${styles.desktop_only}`}>{promoItems.stone}</div>

          <div className={`${styles.slider__box__custom} ${styles.slider__box__custom__hidden}`}>
            <Slider {...sliderSettings}>
              <div className={styles.promo__item_box_4}>{promoItems.coal}</div>
              <div className={styles.promo__item_box_5}>{promoItems.stone}</div>
              <div className={styles.promo__item_box_6}>{promoItems.coal}</div>
              <div className={styles.promo__item_box_7}>{promoItems.stone}</div>
            </Slider>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Promo
