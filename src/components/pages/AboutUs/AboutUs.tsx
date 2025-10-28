import Header from '@/components/MainComponents/Header/Header'
import styles from './AboutUs.module.scss'
import Footer from '@/components/MainComponents/Footer/Footer'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

const AboutUs = () => {
  const t = useTranslations('AboutUsPage')

  return (
    <div>
      <Header />
      <div className={'main about'}>
        <section className={styles.section_topnull}>
          <h1 className={'visually-hidden'}>{t('title')}</h1>
          <div className={'container'}>
            <div className={styles.about__title}>{t('title')}</div>
            <div className={styles.about__row}>
              <div className={styles.about_block}>
                <div className={styles.about_block__number}>
                  <span>01</span>
                </div>
                <div className={styles.about_block__content}>
                  <h3 className={styles.about_block__title}>{t('mission')}</h3>
                  <div className={styles.about_block__description}>
                    <p>{t('firstParagraph')}</p>
                  </div>
                </div>
              </div>

              <div className={styles.about_block}>
                <div className={styles.about_block__number}>
                  <span>02</span>
                </div>
                <div className={styles.about_block__content}>
                  <h3 className={styles.about_block__title}>{t('mainGoal')}</h3>
                  <div className={styles.about_block__description}>
                    <p>{t('secondParagraph')}</p>
                  </div>
                </div>
              </div>

              <div className={styles.about_block}>
                <div className={styles.about_block__number}>
                  <span>03</span>
                </div>
                <div className={styles.about_block__content}>
                  <h3 className={styles.about_block__title}>{t('efficiency')}</h3>
                  <div className={styles.about_block__description}>
                    <p>{t('thirdParagraph')}</p>
                  </div>
                </div>
              </div>

              <div className={styles.about_block}>
                <div className={styles.about_block__number}>
                  <span>04</span>
                </div>
                <div className={styles.about_block__content}>
                  <h3 className={styles.about_block__title}>{t('unifiedCenter')}</h3>
                  <div className={styles.about_block__description}>
                    <p>{t('fifthParagraph')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={'visually-hidden'}>{t('joinTitle')}</h2>
          <div className={'container'}>
            <div className={styles.about_exporteru__block}>
              <div className={styles.about_exporteru__wrap}>
                <div className={styles.about_exporteru__title}>{t('joinTitle')}</div>
                <div className={styles.about_exporteru__buttons}>
                  <Link href='/register' className={styles.btn_accent}>
                    {t('becomePartner')}
                  </Link>
                </div>
              </div>
              <div className={styles.about_exporteru__image}>
                <Image src='/imagesNew/about/about-exporteru.webp' width='1200' height='350' alt='Exporteru' />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}

export default AboutUs
