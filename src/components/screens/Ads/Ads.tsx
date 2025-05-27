'use client'
import {FC, ReactNode} from 'react'
import styles from './Ads.module.scss'
import Slider from 'react-slick'
import {StaticImageData} from 'next/image'
import Link from 'next/link'
// import {useWindowWidth} from '@/hooks/useWindoWidth'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import {useWindowWidth} from '@/hooks/useWindoWidth'

const ads1 = '/ads1.jpg'
const ads2 = '/ads2.jpg'
const ads3 = '/ads3.jpg'
interface IAdsItem {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  text?: string | ReactNode
  image: string | StaticImageData
  extraClass?: string
  href: string
}

const AdsItem: FC<IAdsItem> = ({title, subtitle, text, image, extraClass, href = '#'}) => {
  const imageUrl = typeof image === 'string' ? image : image.src

  return (
    <Link
      href={href}
      style={{backgroundImage: `url(${imageUrl})`, display: 'block'}}
      className={`${styles.ads__item_box} ${extraClass || ''}`}
    >
      <div className={`${styles.ads__item_box__inner}`}>
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

const Ads: FC = () => {
  const windowWidth = useWindowWidth()
  // let windowLess768 = false
  // useEffect(() => {
  //   if (windowWidth <= 768) {
  //     windowLess768 = true
  //   } else {
  //     windowLess768 = false
  //   }
  // }, [windowWidth])

  // на 670 сделай 1 slidesToShow
  const settings = {
    dots: false,
    infinite: true,
    speed: 1500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    // pauseOnHover: true,
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
    <div className={`${styles.ads_box}`}>
      <div className='container'>
        <div className={`${styles.ads_box__inner}`}>
          <AdsItem
            extraClass={styles.ads__item_box_1}
            href='#'
            title='Горящие скидки на дерево'
            subtitle='Успей и закажи прямо сейчас'
            text={
              <p className={`${styles.spec__text} fontInstrument`}>
                Только с <span> 20 АПРЕЛЯ</span> по <span>14 МАЯ</span>
              </p>
            }
            image={ads1}
          />

          <AdsItem
            href='#'
            extraClass={styles.ads__item_box_2}
            title={<h3 className={`${styles.second__title} fontInstrument`}>Новая поставка угля</h3>}
            subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>Бери пока не раскупили!</p>}
            text=''
            image={ads2}
          />

          <AdsItem
            href='#'
            extraClass={styles.ads__item_box_3}
            title={<p className={`${styles.third__title} fontInstrument`}> Камень со скидкой </p>}
            subtitle={<p className={`${styles.third__subtitle} fontInstrument`}> до 40%</p>}
            text={<p className={`${styles.third__text} fontInstrument`}> Скидка работает только при самовывозе* </p>}
            image={ads3}
          />

          {windowWidth < 768 && (
            <Slider className={`${styles.slider__box__custom}`} {...settings}>
              <AdsItem
                href='#'
                extraClass={styles.ads__item_box_4}
                title={<h3 className={`${styles.second__title} fontInstrument`}>Новая поставка угля</h3>}
                subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>Бери пока не раскупили!</p>}
                text=''
                image={ads2}
              />
              <AdsItem
                href='#'
                extraClass={styles.ads__item_box_5}
                title={<p className={`${styles.third__title} fontInstrument`}> Камень со скидкой </p>}
                subtitle={<p className={`${styles.third__subtitle} fontInstrument`}> до 40%</p>}
                text={
                  <p className={`${styles.third__text} fontInstrument`}> Скидка работает только при самовывозе* </p>
                }
                image={ads3}
              />
              <AdsItem
                href='#'
                extraClass={styles.ads__item_box_6}
                title={<h3 className={`${styles.second__title} fontInstrument`}>Новая поставка угля</h3>}
                subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>Бери пока не раскупили!</p>}
                text=''
                image={ads2}
              />
              <AdsItem
                href='#'
                extraClass={styles.ads__item_box_5}
                title={<p className={`${styles.third__title} fontInstrument`}> Камень со скидкой </p>}
                subtitle={<p className={`${styles.third__subtitle} fontInstrument`}> до 40%</p>}
                text={
                  <p className={`${styles.third__text} fontInstrument`}> Скидка работает только при самовывозе* </p>
                }
                image={ads3}
              />
            </Slider>
          )}
        </div>
      </div>
    </div>
  )
}

export default Ads
