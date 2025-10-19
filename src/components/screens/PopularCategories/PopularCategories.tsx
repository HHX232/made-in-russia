import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './PopularCategories.module.scss'
import {useTranslations} from 'next-intl'

interface CategoryItem {
  id: number
  title: string
  image: string
  link: string
}

interface PopularCategoriesProps {
  categories?: CategoryItem[]
  viewAllLink?: string
  viewAllText?: string
  sectionTitle?: string
}

const PopularCategories: React.FC<PopularCategoriesProps> = ({categories, viewAllLink = '#'}) => {
  const t = useTranslations('PopularCategories')
  const defaultCategories: CategoryItem[] = [
    {
      id: 1,
      title: t('cat1'),
      // title: 'Металлургическая продукция',
      image: '/imagesNew/main/main-2-1.webp',
      link: '/categories/metallurgy'
    },
    {
      id: 2,
      title: t('cat2'),
      // title: 'Древесина',
      image: '/imagesNew/main/main-2-2.webp',
      link: '/categories/wood-and-wood-products'
    },
    {
      id: 3,
      title: t('cat3'),
      // title: 'Минеральная продукция',
      image: '/imagesNew/main/main-2-3.webp',
      link: '/categories/other-non-metallic-mineral-products'
    },
    {
      id: 4,
      title: t('cat4'),
      // title: 'Полезные ископаемые',
      image: '/imagesNew/main/main-2-4.webp',
      link: '/categories/poleznye-iskopaemye'
    }
  ]
  const [cat1, cat2, cat3, cat4] = categories || defaultCategories

  return (
    <section className={`${styles.section} ${styles.popularcats}`}>
      <h2 className={styles.visuallyHidden}>{t('sectionTitleT')}</h2>
      <div className={`container ${styles.container}`}>
        <div className={styles.sectionFlexheader}>
          <div className={styles.sectionFlexheaderTitle}>{t('sectionTitleT')}</div>
          <Link href={viewAllLink} id='popularcats-button' className={styles.btnAccent}>
            {t('viewAllTextT')}
          </Link>
        </div>

        <div className={styles.row}>
          <div className={styles.column40}>
            {cat1 && (
              <div className={`${styles.popularcatsItem} ${styles.item1}`}>
                <Image
                  src={cat1.image}
                  alt={cat1.title}
                  fill
                  style={{objectFit: 'cover'}}
                  sizes='(max-width: 768px) 100vw, 43vw'
                />
                <div className={styles.popularcatsPosition}>
                  <h3 className={styles.popularcatsTitle}>{cat1.title}</h3>
                  <div className={styles.popularcatsMore}>
                    <Link href={cat1.link} className={styles.popularcatsMorelink}>
                      <span>{t('more')}</span>
                      <svg className={`${styles.icon} ${styles.iconRightLong}`}>
                        <use href='/iconsNew/arrow-right.svg'></use>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.column60}>
            <div className={styles.row}>
              <div className={styles.col6}>
                {cat2 && (
                  <div className={`${styles.popularcatsItem} ${styles.item2}`}>
                    <Image
                      src={cat2.image}
                      alt={cat2.title}
                      fill
                      style={{objectFit: 'cover'}}
                      sizes='(max-width: 768px) 50vw, 28.5vw'
                    />
                    <div className={styles.popularcatsPosition}>
                      <h3 className={styles.popularcatsTitle}>{cat2.title}</h3>
                      <div className={styles.popularcatsMore}>
                        <Link href={cat2.link} className={styles.popularcatsMorelink}>
                          <span>{t('more')}</span>
                          <svg className={`${styles.icon} ${styles.iconRightLong}`}>
                            <use href='/iconsNew/arrow-right.svg'></use>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.col6}>
                {cat3 && (
                  <div className={`${styles.popularcatsItem} ${styles.item3}`}>
                    <Image
                      src={cat3.image}
                      alt={cat3.title}
                      fill
                      style={{objectFit: 'cover'}}
                      sizes='(max-width: 768px) 50vw, 28.5vw'
                    />
                    <div className={styles.popularcatsPosition}>
                      <h3 className={styles.popularcatsTitle}>{cat3.title}</h3>
                      <div className={styles.popularcatsMore}>
                        <Link href={cat3.link} className={styles.popularcatsMorelink}>
                          <span>{t('more')}</span>
                          <svg className={`${styles.icon} ${styles.iconRightLong}`}>
                            <use href='/iconsNew/arrow-right.svg'></use>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.col12}>
                {cat4 && (
                  <div className={`${styles.popularcatsItem} ${styles.item4}`}>
                    <Image
                      src={cat4.image}
                      alt={cat4.title}
                      fill
                      style={{objectFit: 'cover'}}
                      sizes='(max-width: 768px) 100vw, 57vw'
                    />
                    <div className={styles.popularcatsPosition}>
                      <h3 className={styles.popularcatsTitle}>{cat4.title}</h3>
                      <div className={styles.popularcatsMore}>
                        <Link href={cat4.link} className={styles.popularcatsMorelink}>
                          <span>{t('more')}</span>
                          <svg className={`${styles.icon} ${styles.iconRightLong}`}>
                            <use href='/iconsNew/arrow-right.svg'></use>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div id='popularcats-place' className={styles.popularcatsTransfered}></div>
      </div>
    </section>
  )
}

export default PopularCategories
