'use client'
import {FC, ReactNode, useMemo} from 'react'
import styles from './Promo.module.scss'
import {StaticImageData} from 'next/image'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {IPromoFromServer} from '@/app/[locale]/page'
import {usePathname} from 'next/navigation'
import Head from 'next/head'

// Lazy loading слайдера
const Slider = dynamic(() => import('react-slick').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div style={{height: '100%'}} className={styles.slider__loading}>
      Загрузка...
    </div>
  )
})

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

interface PromoProps {
  ads: IPromoFromServer[]
  organizationName?: string
  baseUrl?: string
  siteTitle?: string
}

// TODO проверить схему
// Утилита для удаления HTML тегов
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

// Генерация основной схемы промо-секции
const generateMainPromoSchema = (ads: IPromoFromServer[], organizationName: string, baseUrl: string) => {
  const bigAds = ads.filter((ad) => ad.isBig)
  const smallAds = ads.filter((ad) => !ad.isBig)

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPageElement',
    '@id': `${baseUrl}#promo-section`,
    name: 'Promotional Section',
    description: 'Featured promotional content and offers',
    isPartOf: {
      '@type': 'WebPage',
      '@id': baseUrl
    },
    ...(bigAds.length > 0 && {
      mainEntity: bigAds.map((ad) => ({
        '@type': 'PromotionalOffer',
        '@id': `${baseUrl}#promo-${ad.id}`,
        name: stripHtml(ad.title),
        description: stripHtml(ad.subtitle + (ad.thirdText ? ' ' + ad.thirdText : '')),
        image: {
          '@type': 'ImageObject',
          url: ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseUrl}${ad.imageUrl}`,
          width: 800,
          height: 600
        },
        url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`,
        validFrom: new Date().toISOString(),
        priceSpecification: {
          '@type': 'PriceSpecification',
          eligibleQuantity: {
            '@type': 'QuantitativeValue',
            value: 1
          }
        }
      }))
    }),
    ...(smallAds.length > 0 && {
      hasPart: smallAds.map((ad) => ({
        '@type': 'CreativeWork',
        '@id': `${baseUrl}#content-${ad.id}`,
        name: stripHtml(ad.title),
        description: stripHtml(ad.subtitle),
        image: {
          '@type': 'ImageObject',
          url: ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseUrl}${ad.imageUrl}`,
          width: 400,
          height: 300
        },
        url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`,
        datePublished: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: organizationName
        }
      }))
    })
  }
}

// Генерация схемы ItemList для e-commerce
const generateItemListSchema = (ads: IPromoFromServer[], baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${baseUrl}#promo-list`,
    name: 'Featured Promotions',
    description: 'Current promotional offers and featured content',
    numberOfItems: ads.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: ads.map((ad, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': ad.isBig ? 'Product' : 'Article',
        '@id': `${baseUrl}#item-${ad.id}`,
        name: stripHtml(ad.title),
        description: stripHtml(ad.subtitle),
        image: {
          '@type': 'ImageObject',
          url: ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseUrl}${ad.imageUrl}`,
          width: ad.isBig ? 800 : 400,
          height: ad.isBig ? 600 : 300
        },
        url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`,
        ...(ad.isBig && {
          offers: {
            '@type': 'Offer',
            '@id': `${baseUrl}#offer-${ad.id}`,
            availability: 'https://schema.org/InStock',
            url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`
          }
        }),
        ...(!ad.isBig && {
          datePublished: new Date().toISOString(),
          articleSection: 'Promotions'
        })
      }
    }))
  }
}

// Генерация схемы организации
const generateOrganizationSchema = (organizationName: string, baseUrl: string, logoUrl?: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: organizationName,
    url: baseUrl,
    ...(logoUrl && {
      logo: {
        '@type': 'ImageObject',
        url: logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`
      }
    }),
    sameAs: [
      // TODO Добавьте ссылки на социальные сети
      // 'https://facebook.com/yourpage',
      // 'https://twitter.com/yourhandle'
    ]
  }
}

// Генерация схемы BreadcrumbList (если нужно)
const generateBreadcrumbSchema = (baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${baseUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Promotions',
        item: `${baseUrl}#promo-section`
      }
    ]
  }
}

// Генерация схемы WebSite
const generateWebSiteSchema = (baseUrl: string, siteTitle: string, organizationName: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    url: baseUrl,
    name: siteTitle,
    description: `Official website of ${organizationName}`,
    publisher: {
      '@id': `${baseUrl}#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
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
    <Link
      draggable='false'
      style={{...extraStyle}}
      href={href}
      className={`${styles.promo__item_box} ${extraClass || ''}`}
    >
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
          blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgW0ATZ4AAAAASUVORK5CYII='
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
        <div className={styles.promo__gradient_overlay} />
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

// TODO изменить данные
const Promo: FC<PromoProps> = ({
  ads,
  organizationName = 'Your Company Name',
  baseUrl = 'https://your-domain.com',
  siteTitle = 'Your Site Title'
}) => {
  const pathname = usePathname()
  const currentLanguage = pathname.split('/')[1] || 'ru'

  // Разделяем рекламу на большую и маленькую
  const bigAds = useMemo(() => ads.filter((ad) => ad.isBig), [ads])
  const smallAds = useMemo(() => ads.filter((ad) => !ad.isBig), [ads])

  // Генерируем все схемы
  const schemas = useMemo(() => {
    const mainPromoSchema = generateMainPromoSchema(ads, organizationName, baseUrl)
    const itemListSchema = generateItemListSchema(ads, baseUrl)
    const organizationSchema = generateOrganizationSchema(organizationName, baseUrl)
    // const breadcrumbSchema = generateBreadcrumbSchema(baseUrl)
    const webSiteSchema = generateWebSiteSchema(baseUrl, siteTitle, organizationName)

    return {
      mainPromo: mainPromoSchema,
      itemList: itemListSchema,
      organization: organizationSchema,
      // breadcrumb: breadcrumbSchema,
      webSite: webSiteSchema
    }
  }, [ads, organizationName, baseUrl, siteTitle])

  // Создаем элементы больших реклам с правильными тегами
  const bigAdItems = useMemo(
    () =>
      bigAds.map((ad, index) => (
        <PromoItem
          key={ad.id}
          extraClass={styles.promo__item_box_1}
          extraStyle={{padding: '0 5px', marginLeft: '5px', marginRight: '5px'}}
          href={ad.link}
          title={ad.title}
          subtitle={ad.subtitle}
          text={
            ad.thirdText ? (
              <p dangerouslySetInnerHTML={{__html: ad.thirdText}} className={`${styles.spec__text} fontInstrument`} />
            ) : null
          }
          image={ad.imageUrl}
          priority={index === 0}
          sizes='(max-width: 768px) 100vw, (max-width: 993px) 100vw, 66vw'
        />
      )),
    [bigAds, currentLanguage]
  )

  // Создаем элементы маленьких реклам с правильными тегами
  const smallAdItems = useMemo(
    () =>
      smallAds.map((ad) => (
        <PromoItem
          key={ad.id}
          href={ad.link || '404'}
          extraStyle={{height: '100%', marginLeft: '5px', marginRight: '5px'}}
          title={
            <h3 dangerouslySetInnerHTML={{__html: ad.title}} className={`${styles.second__title} fontInstrument`} />
          }
          subtitle={
            <p
              className={`${styles.second__subtitle} fontInstrument`}
              dangerouslySetInnerHTML={{__html: ad.subtitle}}
            />
          }
          text={
            ad.thirdText ? (
              <p className={`${styles.third__text} fontInstrument`} dangerouslySetInnerHTML={{__html: ad.thirdText}} />
            ) : (
              ''
            )
          }
          image={ad.imageUrl}
          sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
        />
      )),
    [smallAds, currentLanguage]
  )

  const smallAdItemsForMobile = useMemo(
    () =>
      smallAds.map((ad) => (
        <PromoItem
          key={ad.id}
          href={ad.link || '404'}
          extraStyle={{height: '100%'}}
          extraClass={styles.promo__item_box_4}
          title={<h3 className={`${styles.second__title} fontInstrument`}>{ad.title}</h3>}
          subtitle={<p className={`${styles.second__subtitle} fontInstrument`}>{ad.subtitle}</p>}
          text={ad.thirdText ? <p className={`${styles.third__text} fontInstrument`}>{ad.thirdText}</p> : ''}
          image={ad.imageUrl}
          sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
        />
      )),
    [smallAds, currentLanguage]
  )

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
      beforeChange: () => {
        // Сбрасываем выделение, чтобы предотвратить копирование
        window?.getSelection()?.removeAllRanges()
      },
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

  const sliderSettingsSolo = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 1500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4500,
      lazyLoad: 'ondemand' as const,
      beforeChange: () => {
        // Сбрасываем выделение, чтобы предотвратить копирование
        window?.getSelection()?.removeAllRanges()
      },
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

  // Генерируем объединенную схему Graph
  const combinedSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@graph': [schemas.webSite, schemas.organization, schemas.mainPromo, schemas.itemList]
    }
  }, [schemas])

  return (
    <>
      {/* Schema.org JSON-LD */}
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(combinedSchema, null, 2)
          }}
        />
      </Head>

      <div className={styles.promo_box} itemScope itemType='https://schema.org/WebPageElement'>
        {/* Микроданные для промо-секции */}
        <meta itemProp='name' content='Promotional Section' />
        <meta itemProp='description' content='Featured promotional content and offers' />

        <div className='container'>
          <div className={styles.promo_box__inner}>
            {/* Большие рекламы */}
            <div className={styles.promo__item_box_1}>
              <Slider {...sliderSettingsSolo}>
                {bigAdItems.map((item, index) => {
                  return (
                    <div key={index} itemScope itemType='https://schema.org/PromotionalOffer'>
                      {item}
                    </div>
                  )
                })}
              </Slider>
            </div>

            {/* Маленькие рекламы для десктопа */}
            <div
              style={{height: '100%', display: 'block', minWidth: '0'}}
              className={`${styles.promo__item_box_2} ${styles.desktop_only} ${styles.slider__box__custom}`}
            >
              <Slider {...sliderSettingsSolo}>
                {smallAdItems.map((item, index) => {
                  return (
                    <div
                      style={{height: '100%', background: 'red'}}
                      key={index}
                      className={styles.full__height}
                      itemScope
                      itemType='https://schema.org/CreativeWork'
                    >
                      {item}
                    </div>
                  )
                })}
              </Slider>
            </div>

            {/* Дублирование маленьких реклам */}
            <div
              style={{height: '100%', display: 'block', minWidth: '0'}}
              className={`${styles.promo__item_box_2} ${styles.desktop_only} ${styles.slider__box__custom}`}
            >
              <Slider {...sliderSettingsSolo}>
                {smallAdItems.reverse().map((item, index) => {
                  return (
                    <div
                      style={{height: '100%', background: 'red'}}
                      key={index}
                      className={styles.full__height}
                      itemScope
                      itemType='https://schema.org/CreativeWork'
                    >
                      {item}
                    </div>
                  )
                })}
              </Slider>
            </div>

            {/* Мобильная версия */}
            <div
              style={{height: '100%'}}
              className={`${styles.slider__box__custom} ${styles.slider__box__custom__hidden}`}
            >
              <Slider {...sliderSettings}>
                {smallAdItemsForMobile.map((item, index) => {
                  return (
                    <div
                      className={styles.full__height}
                      style={{height: '100%'}}
                      key={index}
                      itemScope
                      itemType='https://schema.org/CreativeWork'
                    >
                      {item}
                    </div>
                  )
                })}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Promo

// Дополнительные утилиты для экспорта
export {
  generateMainPromoSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  stripHtml
}
