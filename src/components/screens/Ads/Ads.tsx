/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {FC, useMemo, useState, useEffect} from 'react'
import styles from './Promo.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import {IPromoFromServer} from '@/app/[locale]/page'
import Head from 'next/head'
import {
  generateMainPromoSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  stripHtml
} from './ads.helpers'

// Ленивая загрузка слайдера с улучшенным фоллбэком
let SliderComponent: any = null
const loadSlider = () => {
  if (!SliderComponent) {
    return import('react-slick').then((mod) => {
      SliderComponent = mod.default
      return SliderComponent
    })
  }
  return Promise.resolve(SliderComponent)
}

// Компонент статического фоллбэка
const StaticPromoFallback: FC<{ads: IPromoFromServer[]}> = ({ads}) => {
  const bigAd = ads.find((ad) => ad.isBig)
  const smallAds = ads.filter((ad) => !ad.isBig).slice(0, 2)

  return (
    <div className={styles.promo_box__inner}>
      {/* Большая реклама */}
      {bigAd && (
        <div className={styles.promo__item_box_1}>
          <PromoItemOptimized
            ad={bigAd}
            priority={true}
            sizes='(max-width: 768px) 100vw, (max-width: 993px) 100vw, 66vw'
            extraClass={styles.promo__item_box_1}
            extraStyle={{padding: '0 5px', marginLeft: '5px', marginRight: '5px'}}
          />
        </div>
      )}

      {/* Маленькие рекламы */}
      {smallAds.map((ad) => (
        <div
          key={ad.id}
          className={`${styles.promo__item_box_2} ${styles.desktop_only}`}
          style={{height: '100%', display: 'block', minWidth: '0'}}
        >
          <PromoItemOptimized
            ad={ad}
            priority={false}
            sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
            extraStyle={{height: '100%', marginLeft: '5px', marginRight: '5px'}}
            isSmall={true}
          />
        </div>
      ))}

      {/* Мобильная версия - показываем только первые 2 */}
      <div className={`${styles.slider__box__custom} ${styles.slider__box__custom__hidden}`}>
        <div style={{display: 'flex', gap: '10px'}}>
          {smallAds.map((ad) => (
            <div key={ad.id} style={{flex: '0 0 50%'}}>
              <PromoItemOptimized
                ad={ad}
                priority={false}
                sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
                extraClass={styles.promo__item_box_4}
                extraStyle={{height: '100%'}}
                isSmall={true}
                isMobile={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Оптимизированный компонент элемента промо
const PromoItemOptimized: FC<{
  ad: IPromoFromServer
  priority?: boolean
  sizes?: string
  extraClass?: string
  extraStyle?: React.CSSProperties
  isSmall?: boolean
  isMobile?: boolean
}> = ({
  ad,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 993px) 50vw, 33vw',
  extraClass,
  extraStyle,
  isSmall = false,
  isMobile = false
}) => {
  return (
    <Link
      draggable='false'
      style={{...extraStyle}}
      href={ad.link}
      className={`${styles.promo__item_box} ${extraClass || ''}`}
    >
      <div className={styles.promo__item_bg}>
        <Image
          src={ad.imageUrl}
          alt={ad.title}
          fill
          sizes={sizes}
          priority={priority}
          quality={priority ? 90 : 75}
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
        {isSmall ? (
          <>
            <h3
              className={`${styles.second__title} fontInstrument`}
              {...(!isMobile && {dangerouslySetInnerHTML: {__html: ad.title}})}
            >
              {isMobile ? ad.title : undefined}
            </h3>
            <p
              className={`${styles.second__subtitle} fontInstrument`}
              {...(!isMobile && {dangerouslySetInnerHTML: {__html: ad.subtitle}})}
            >
              {isMobile ? ad.subtitle : undefined}
            </p>
            {ad.thirdText && (
              <p
                className={`${styles.third__text} fontInstrument`}
                {...(!isMobile && {dangerouslySetInnerHTML: {__html: ad.thirdText}})}
              >
                {isMobile ? ad.thirdText : undefined}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className={`${styles.el__title} fontInstrument`}>{ad.title}</h2>
            <p className={`${styles.el__subtitle} fontInstrument`}>{ad.subtitle}</p>
            {ad.thirdText && (
              <p dangerouslySetInnerHTML={{__html: ad.thirdText}} className={`${styles.spec__text} fontInstrument`} />
            )}
          </>
        )}
      </div>
    </Link>
  )
}

// Динамический слайдер с оптимизацией
const DynamicSlider: FC<{
  ads: IPromoFromServer[]
  isLoading: boolean
}> = ({ads, isLoading}) => {
  const [sliderReady, setSliderReady] = useState(false)
  const [SliderComponent, setSliderComponent] = useState<React.ComponentType<any> | null>(null)

  // Все хуки должны быть вызваны до любого условного возврата
  const bigAds = useMemo(() => ads.filter((ad) => ad.isBig), [ads])
  const smallAds = useMemo(() => ads.filter((ad) => !ad.isBig), [ads])

  // Настройки слайдера
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
      beforeChange: () => window?.getSelection()?.removeAllRanges(),
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
      ...sliderSettings,
      slidesToShow: 1,
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
    [sliderSettings]
  )

  // Создаем элементы с мемоизацией
  const bigAdItems = useMemo(
    () =>
      bigAds.map((ad, index) => (
        <div key={ad.id} itemScope itemType='https://schema.org/PromotionalOffer'>
          <PromoItemOptimized
            ad={ad}
            priority={index === 0}
            sizes='(max-width: 768px) 100vw, (max-width: 993px) 100vw, 66vw'
            extraClass={styles.promo__item_box_1}
            extraStyle={{padding: '0 5px', marginLeft: '5px', marginRight: '5px'}}
          />
        </div>
      )),
    [bigAds]
  )

  const smallAdItems = useMemo(
    () =>
      smallAds.map((ad) => (
        <div
          key={ad.id}
          style={{height: '100%'}}
          className={styles.full__height}
          itemScope
          itemType='https://schema.org/CreativeWork'
        >
          <PromoItemOptimized
            ad={ad}
            priority={false}
            sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
            extraStyle={{height: '100%', marginLeft: '5px', marginRight: '5px'}}
            isSmall={true}
          />
        </div>
      )),
    [smallAds]
  )

  const smallAdItemsForMobile = useMemo(
    () =>
      smallAds.map((ad) => (
        <div
          key={ad.id}
          className={styles.full__height}
          style={{height: '100%'}}
          itemScope
          itemType='https://schema.org/CreativeWork'
        >
          <PromoItemOptimized
            ad={ad}
            priority={false}
            sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
            extraClass={styles.promo__item_box_4}
            extraStyle={{height: '100%'}}
            isSmall={true}
            isMobile={true}
          />
        </div>
      )),
    [smallAds]
  )

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        loadSlider().then((LoadedSlider) => {
          setSliderComponent(() => LoadedSlider)
          setSliderReady(true)
        })
      }, 100) // Небольшая задержка для завершения рендера

      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!sliderReady || !SliderComponent) {
    return <StaticPromoFallback ads={ads} />
  }

  return (
    <div className={styles.promo_box__inner}>
      {/* Большие рекламы */}
      <div className={styles.promo__item_box_1}>
        <SliderComponent {...sliderSettingsSolo}>{bigAdItems}</SliderComponent>
      </div>

      {/* Маленькие рекламы для десктопа */}
      <div
        style={{height: '100%', display: 'block', minWidth: '0'}}
        className={`${styles.promo__item_box_2} ${styles.desktop_only} ${styles.slider__box__custom}`}
      >
        <SliderComponent {...sliderSettingsSolo}>{smallAdItems}</SliderComponent>
      </div>

      {/* Дублирование маленьких реклам */}
      <div
        style={{height: '100%', display: 'block', minWidth: '0'}}
        className={`${styles.promo__item_box_2} ${styles.desktop_only} ${styles.slider__box__custom}`}
      >
        <SliderComponent {...sliderSettingsSolo}>{[...smallAdItems].reverse()}</SliderComponent>
      </div>

      {/* Мобильная версия */}
      <div style={{height: '100%'}} className={`${styles.slider__box__custom} ${styles.slider__box__custom__hidden}`}>
        <SliderComponent {...sliderSettings}>{smallAdItemsForMobile}</SliderComponent>
      </div>
    </div>
  )
}

interface PromoProps {
  ads: IPromoFromServer[]
  organizationName?: string
  baseUrl?: string
  siteTitle?: string
}

// TODO: проверить все данные
const Promo: FC<PromoProps> = ({
  ads,
  organizationName = 'Your Company Name',
  baseUrl = 'https://your-domain.com',
  siteTitle = 'Your Site Title'
}) => {
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Оптимизированная загрузка
  useEffect(() => {
    // Устанавливаем флаг загрузки после монтирования
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000) // Задержка 0.5 секунды для лучшего UX

    return () => clearTimeout(timer)
  }, [])

  // Генерируем схемы только один раз
  const schemas = useMemo(() => {
    const mainPromoSchema = generateMainPromoSchema(ads, organizationName, baseUrl)
    const itemListSchema = generateItemListSchema(ads, baseUrl)
    const organizationSchema = generateOrganizationSchema(organizationName, baseUrl)
    const webSiteSchema = generateWebSiteSchema(baseUrl, siteTitle, organizationName)

    return {
      '@context': 'https://schema.org',
      '@graph': [webSiteSchema, organizationSchema, mainPromoSchema, itemListSchema]
    }
  }, [ads, organizationName, baseUrl, siteTitle])

  return (
    <>
      {/* Schema.org JSON-LD */}
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemas, null, 2)
          }}
        />
      </Head>

      <div className={styles.promo_box} itemScope itemType='https://schema.org/WebPageElement'>
        <meta itemProp='name' content='Promotional Section' />
        <meta itemProp='description' content='Featured promotional content and offers' />

        <div className='container'>
          <DynamicSlider ads={ads} isLoading={!isPageLoaded} />
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
