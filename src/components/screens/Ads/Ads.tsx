'use client'
import {FC, ReactNode} from 'react'
import styles from './Promo.module.scss'
import Slider from 'react-slick'
import {StaticImageData} from 'next/image'
import Link from 'next/link'
// import {useWindowWidth} from '@/hooks/useWindoWidth'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const promo1 = '/ads1.jpg'
const promo2 = '/ads2.jpg'
const promo3 = '/ads3.jpg'

interface IPromoItem {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  text?: string | ReactNode
  image: string | StaticImageData
  extraClass?: string
  href: string
}

const PromoItem: FC<IPromoItem> = ({title, subtitle, text, image, extraClass, href = '#'}) => {
  const imageUrl = typeof image === 'string' ? image : image.src

  return (
    <Link
      href={href}
      style={{backgroundImage: `url(${imageUrl})`, display: 'block'}}
      className={`${styles.promo__item_box} ${extraClass || ''}`}
    >
      <div className={`${styles.promo__item_box__inner}`}>
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
  // let windowLess768 = false
  // useEffect(() => {
  //   if (windowWidth <= 768) {
  //     windowLess768 = true
  //   } else {
  //     windowLess768 = false
  //   }
  // }, [windowWidth])

  const settings = {
    dots: false,
    infinite: true,
    speed: 1500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
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
  }

  return (
    <div className={`${styles.promo_box}`}>
      <div className='container'>
        <div className={`${styles.promo_box__inner}`}>
          <PromoItem
            extraClass={styles.promo__item_box_1}
            href='#'
            title='Горящие скидки на дерево'
            subtitle='Успей и закажи прямо сейчас'
            text={
              <p className={`${styles.spec__text} fontInstrument`}>
                Только с <span> 20 АПРЕЛЯ</span> по <span>14 МАЯ</span>
              </p>
            }
            image={promo1}
          />

          <PromoItem
            href='#'
            extraClass={styles.promo__item_box_2}
            title={<h3 className={`${styles.second__title} fontInstrument`}>Новая поставка угля</h3>}
            subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>Бери пока не раскупили!</p>}
            text=''
            image={promo2}
          />

          <PromoItem
            href='#'
            extraClass={styles.promo__item_box_3}
            title={<p className={`${styles.third__title} fontInstrument`}> Камень со скидкой </p>}
            subtitle={<p className={`${styles.third__subtitle} fontInstrument`}> до 40%</p>}
            text={<p className={`${styles.third__text} fontInstrument`}> Скидка работает только при самовывозе* </p>}
            image={promo3}
          />

          <Slider className={`${styles.slider__box__custom} ${styles.slider__box__custom__hidden}`} {...settings}>
            <PromoItem
              href='#'
              extraClass={styles.promo__item_box_4}
              title={<h3 className={`${styles.second__title} fontInstrument`}>Новая поставка угля</h3>}
              subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>Бери пока не раскупили!</p>}
              text=''
              image={promo2}
            />
            <PromoItem
              href='#'
              extraClass={styles.promo__item_box_5}
              title={<p className={`${styles.third__title} fontInstrument`}> Камень со скидкой </p>}
              subtitle={<p className={`${styles.third__subtitle} fontInstrument`}> до 40%</p>}
              text={<p className={`${styles.third__text} fontInstrument`}> Скидка работает только при самовывозе* </p>}
              image={promo3}
            />
            <PromoItem
              href='#'
              extraClass={styles.promo__item_box_6}
              title={<h3 className={`${styles.second__title} fontInstrument`}>Новая поставка угля</h3>}
              subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>Бери пока не раскупили!</p>}
              text=''
              image={promo2}
            />
            <PromoItem
              href='#'
              extraClass={styles.promo__item_box_5}
              title={<p className={`${styles.third__title} fontInstrument`}> Камень со скидкой </p>}
              subtitle={<p className={`${styles.third__subtitle} fontInstrument`}> до 40%</p>}
              text={<p className={`${styles.third__text} fontInstrument`}> Скидка работает только при самовывозе* </p>}
              image={promo3}
            />
          </Slider>
        </div>
      </div>
    </div>
  )
}

export default Promo
