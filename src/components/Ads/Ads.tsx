import {FC, ReactNode} from 'react'
import styles from './Ads.module.scss'
import ads1 from '@/assets/images/ads1.jpg'
import ads2 from '@/assets/images/ads2.jpg'
import ads3 from '@/assets/images/ads3.jpg'
import {StaticImageData} from 'next/image'

interface IAdsItem {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  text?: string | ReactNode
  image: string | StaticImageData
  extraClass?: string
}

const AdsItem: FC<IAdsItem> = ({title, subtitle, text, image, extraClass}) => {
  const imageUrl = typeof image === 'string' ? image : image.src

  return (
    <div style={{backgroundImage: `url(${imageUrl})`}} className={`${styles.ads__item_box} ${extraClass || ''}`}>
      <div className={`${styles.ads__item_box__inner}`}>
        {typeof title === 'string' ? <p>{title}</p> : title}
        {typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle}
        {typeof text === 'string' ? <p>{text}</p> : text}
      </div>
    </div>
  )
}

const Ads: FC = () => {
  return (
    <div className={`${styles.ads_box}`}>
      <div className='container'>
        <div className={`${styles.ads_box__inner}`}>
          <AdsItem extraClass={styles.ads__item_box_1} title='title' subtitle='subtitle' text='text' image={ads1} />
          <AdsItem extraClass={styles.ads__item_box_2} title='title' subtitle='subtitle' text='text' image={ads2} />
          <AdsItem extraClass={styles.ads__item_box_3} title='title' subtitle='subtitle' text='text' image={ads3} />
        </div>
      </div>
    </div>
  )
}

export default Ads
