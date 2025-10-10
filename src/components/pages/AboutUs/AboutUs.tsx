import Header from '@/components/MainComponents/Header/Header'
import styles from './AboutUs.module.scss'
import Footer from '@/components/MainComponents/Footer/Footer'
import {useTranslations} from 'next-intl'
import BreadCrumbs from '@/components/UI-kit/Texts/Breadcrumbs/Breadcrumbs'
import Image from 'next/image'
import Link from 'next/link'

const AboutUs = () => {
  const t = useTranslations('AboutUsPage')
  return (
    <div>
      <Header />
      <div className={`container`}>
        <BreadCrumbs className={`${styles.bread_crumbs_container}`} />
      </div>
      <div className={'main about'}>
        <section className={styles.section_topnull}>
          <h1 className={'visually-hidden'}>О нас</h1>
          <div className={'container'}>
            <div className={styles.about__title}>О нас</div>
            <div className={styles.about__row}>
              <div className={styles.about_block}>
                <div className={styles.about_block__number}>
                  <span>01</span>
                </div>
                <div className={styles.about_block__content}>
                  <h3 className={styles.about_block__title}>Наша миссия</h3>
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
                  <h3 className={styles.about_block__title}>Наша главная цель</h3>
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
                  <h3 className={styles.about_block__title}>Эффективность и контроль в каждой сделке</h3>
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
                  <h3 className={styles.about_block__title}>Единый центр для всех сырьевых потребностей</h3>
                  <div className={styles.about_block__description}>
                    <p>{t('fifthParagraph')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={'visually-hidden'}>
            Присоединяйтесь к Exporteru и откройте новые горизонты для вашего бизнеса
          </h2>
          <div className={'container'}>
            <div className={styles.about_exporteru__block}>
              <div className={styles.about_exporteru__wrap}>
                <div className={styles.about_exporteru__title}>
                  Присоединяйтесь к Exporteru и откройте новые горизонты для вашего бизнеса
                </div>
                <div className={styles.about_exporteru__buttons}>
                  <Link href='#' className={styles.btn_accent}>
                    Стать партнером
                  </Link>
                </div>
              </div>
              <div className={styles.about_exporteru__image}>
                <Image src='/imagesNew/about/about-exporteru.webp' width='1200' height='350' alt='Exporteru' />
              </div>
            </div>
          </div>
        </section>

        {/* <div className={styles.container}>
          <h1>{t('title')}</h1>
          <div className={styles.about__box__inner}>
            <p>{t('firstParagraph')}</p>
            <p>{t('secondParagraph')}</p>
            <p>{t('thirdParagraph')}</p>
            <p>{t('fourthParagraph')}</p>
            <p>{t('fifthParagraph')}</p>
          </div>
        </div> */}
      </div>
      <Footer />
    </div>
  )
}

export default AboutUs
