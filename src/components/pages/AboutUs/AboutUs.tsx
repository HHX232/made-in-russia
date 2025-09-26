import Header from '@/components/MainComponents/Header/Header'
import styles from './AboutUs.module.scss'
import Footer from '@/components/MainComponents/Footer/Footer'
import {useTranslations} from 'next-intl'

const AboutUs = () => {
  const t = useTranslations('AboutUsPage')
  return (
    <div>
      <Header />
      <div className={styles.about__box}>
        <div className='container'>
          <h1>{t('title')}</h1>
          <div className={`${styles.about__box__inner}`}>
            <p>{t('firstParagraph')}</p>
            <p>{t('secondParagraph')}</p>
            <p>{t('thirdParagraph')}</p>
            <p>{t('fourthParagraph')}</p>
            <p>{t('fifthParagraph')}</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AboutUs
