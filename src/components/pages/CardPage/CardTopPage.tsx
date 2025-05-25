'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import Skeleton from 'react-loading-skeleton'
import BasketButtonUI from '@/components/UI-kit/buttons/BasketButtonUI/BasketButtonUI'
import CardSlider from '@/components/UI-kit/elements/CardSlider/CardSlider'
import StarsCount from '@/components/UI-kit/Texts/StarsCount/StarsCount'
import StringDescriptionGroup from '@/components/UI-kit/Texts/StringDescriptionGroup/StringDescriptionGroup'
import {Product} from '@/services/products/product.types'
import {createPriceWithDot} from '@/utils/createPriceWithDot'
import renderPriceUnit from '@/utils/createUnitPrice'
import getDatesDifference from '@/utils/getDatesDifference'
import Link from 'next/link'
import styles from './CardPage.module.scss'
import Image from 'next/image'
import {ReactNode, useEffect, useState} from 'react'

interface IPriceItem {
  title: string | ReactNode
  currentPrice?: string | null
  originalPrice: string | null
  priceUnit: string
}

interface IPriceList {
  items: IPriceItem[]
  discountExpiration?: string | null
}

const im1 = '/mini__comment1.jpg'
const im2 = '/mini_comment2.jpg'
const im4 = '/shop__test.svg'
const im3 = '/mini_comment_3.jpg'
const var1 = '/var1.jpg'
const var2 = '/var2.jpg'
const var3 = '/var3.jpg'

const ShopProfile = ({name, imageSrc, isLoading}: {name: string; imageSrc: string; isLoading: boolean}) => {
  return (
    <Link href={`#`} className={`${styles.shop__profile}`}>
      {!isLoading ? (
        <Image className={`${styles.profile__image}`} src={imageSrc} alt='mini__comment' width={60} height={60} />
      ) : (
        <Skeleton style={{width: 100000, maxWidth: '60px'}} height={60} width={60} />
      )}
      <div className={`${styles.name__profile__box}`}>
        {!isLoading ? (
          <p className={`${styles.shop__name__text}`}>{name}</p>
        ) : (
          <Skeleton style={{width: 100000, maxWidth: '180px'}} height={20} />
        )}
        {!isLoading ? (
          <p className={`${styles.shop__name__subtext}`}>Компания</p>
        ) : (
          <Skeleton style={{width: 100000, maxWidth: '180px'}} height={20} />
        )}
      </div>
    </Link>
  )
}

const VariantsBox = ({imagesUrls = []}: {imagesUrls: string[]}) => {
  return (
    <div className={`${styles.variants__content__box}`}>
      {imagesUrls.map((el, i) => {
        return (
          <Image
            key={i}
            className={`${styles.variants__content__box__item} ${i == 2 && styles.variants__content__box__item__active} `}
            src={el}
            alt='variant'
            width={60}
            height={60}
          />
        )
      })}
    </div>
  )
}

export const CardTopPage = ({isLoading, cardData}: {isLoading: boolean; cardData: Product | null}) => {
  const [cardMiniData, setCardMiniData] = useState<Product | null>(cardData)

  useEffect(() => {
    if (cardData) {
      setCardMiniData(cardData)
    }
  }, [cardData])

  useEffect(() => {
    console.log('cardMiniData', cardMiniData)
  }, [cardMiniData])

  const [priceList, setPriceList] = useState<IPriceList>({
    items: [
      {
        title: '1-5 т.',
        currentPrice: '900',
        originalPrice: '1200',
        priceUnit: 'USD/т'
      },
      {
        title: '5-20 т.',
        currentPrice: '1500',
        originalPrice: '2000',
        priceUnit: 'USD/т'
      },
      {
        title: 'От 20т',
        currentPrice: '700',
        originalPrice: '700',
        priceUnit: 'USD/т'
      }
    ],
    discountExpiration: '2025-06-27'
  })

  const isReallyLoading = isLoading || !cardMiniData

  return (
    <>
      <div className={`${styles.card__slider__box}`}>
        <CardSlider isLoading={isReallyLoading} />
      </div>
      <div className={`${styles.card__mini__info}`}>
        {!isReallyLoading ? (
          <h1 className={`${styles.card__mini__info__title}`}>{cardMiniData!.title || 'Заголовок товара здесь'}</h1>
        ) : (
          <Skeleton style={{width: 100000, maxWidth: '350px'}} height={80} />
        )}
        <div className={`${styles.mini__counts}`}>
          {!isReallyLoading ? (
            <StarsCount count={4.9} />
          ) : (
            <Skeleton style={{width: 100000, maxWidth: '350px'}} height={20} />
          )}
          {!isReallyLoading ? <p className={`${styles.card__del__count}`}>3645 заказов</p> : <></>}
          {!isReallyLoading ? <p className={`${styles.card__comments__count}`}>254 отзыва</p> : <></>}
        </div>
        {!isReallyLoading ? (
          <div className={`${styles.images__comments__slider__box}`}>
            <Image
              className={`${styles.images__comments__slider__box__item_img}`}
              src={im1}
              alt='mini__comment'
              width={60}
              height={60}
            />
            <Image
              className={`${styles.images__comments__slider__box__item_img}`}
              src={im2}
              alt='mini__comment'
              width={60}
              height={60}
            />
            <Image
              className={`${styles.images__comments__slider__box__item_img}`}
              src={im3}
              alt='mini__comment'
              width={60}
              height={60}
            />
            <Image
              className={`${styles.images__comments__slider__box__item_img}`}
              src={im2}
              alt='mini__comment'
              width={60}
              height={60}
            />
          </div>
        ) : (
          <div className={`${styles.images__comments__slider__box}`}>
            <Skeleton style={{width: 100000, maxWidth: '340px'}} count={1} height={60} width={60} />
          </div>
        )}

        <ShopProfile isLoading={isReallyLoading} name={'Имя продавца'} imageSrc={im4} />

        <div className={`${styles.variants__box}`}>
          {!isReallyLoading ? (
            <h2 className={`${styles.variants__title}`}>Варианты:</h2>
          ) : (
            <Skeleton height={24} width={100} />
          )}
          {!isReallyLoading ? (
            <VariantsBox imagesUrls={[var1, var2, var3, var1, var2, var3]} />
          ) : (
            <div className={`${styles.variants__content__box}`}>
              <Skeleton height={60} width={60} />
              <Skeleton height={60} width={60} />
              <Skeleton height={60} width={60} />
            </div>
          )}
          {!isReallyLoading ? (
            <StringDescriptionGroup
              item__extra__class={`${styles.extra__descr__item__class__111}`}
              listGap={'15'}
              elementsFontSize={'15'}
              titleMain=''
              items={[
                {title: 'Артикул ', value: 'DMSR-DL02'},
                {title: 'Разновидность ', value: 'Европейский Дуб'},
                {title: 'Лицевой шпон ', value: '4 мм'},
                {title: 'Упаковка ', value: '23,3 квадратных фута на коробку'}
              ]}
            />
          ) : (
            <div>
              <Skeleton height={16} width={200} />
              <Skeleton height={16} width={180} />
              <Skeleton height={16} width={160} />
              <Skeleton height={16} width={220} />
            </div>
          )}
          {!isReallyLoading ? (
            <span className={`${styles.descr__more__info}`}>
              <Link href={'#'}>Подробнее</Link>
            </span>
          ) : (
            <Skeleton height={16} width={80} />
          )}
        </div>
      </div>
      <div className={`${styles.card__state}`}>
        <div className={`${styles.card__state__big}`}>
          <ul className={`${styles.prices__list}`}>
            {priceList.items.map((el, i) => {
              return (
                <li className={`${styles.prices__list_item}`} key={i}>
                  {!isReallyLoading ? (
                    <p className={`${styles.price__list__title}`}>{el.title}</p>
                  ) : (
                    <Skeleton style={{width: 100000, maxWidth: '45px'}} height={30} />
                  )}
                  {!isReallyLoading ? (
                    <p className={`${styles.price__list__value__start}`}>
                      <span
                        className={`${styles.price__original__price} ${el.currentPrice !== el.originalPrice && styles.price__original__with__discount}`}
                      >
                        {createPriceWithDot(el.originalPrice as string)}
                      </span>
                      {el.originalPrice !== el.currentPrice ? (
                        <span className={`${styles.discount__price}`}>
                          {createPriceWithDot(el.currentPrice as string)}
                        </span>
                      ) : (
                        ''
                      )}
                      <span className={`${styles.price__unit}`}>
                        {renderPriceUnit(
                          el.priceUnit,
                          [
                            styles.price__currency__first,
                            el.currentPrice !== el.originalPrice ? styles.price__currency__first__active : ''
                          ],
                          [styles.price__unitMeasure]
                        )}
                      </span>
                    </p>
                  ) : (
                    <Skeleton style={{width: '100%', maxWidth: '150px'}} height={30} />
                  )}
                </li>
              )
            })}
          </ul>
          <div className={`${styles.discount__date__box}`}>
            <span className={`${styles.date__count}`}>
              {!isReallyLoading ? (
                getDatesDifference({startDate: Date.now(), endDate: priceList.discountExpiration?.toString()}) + ' дней'
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '45px'}} height={16} />
              )}
            </span>
            <span className={`${styles.date__text__end}`}>
              {!isReallyLoading ? (
                ` до конца скидки`
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '100%'}} height={16} />
              )}
            </span>
          </div>
          <div className={`${styles.min__weight}`}>
            {!isReallyLoading ? (
              `Минимальный объем заказа 1т.`
            ) : (
              <Skeleton style={{width: 100000, maxWidth: '100%'}} height={16} />
            )}
          </div>

          <div className='styles.buttons__box'>
            {!isReallyLoading && cardMiniData ? (
              <BasketButtonUI
                textColor='dark'
                iconColor='dark'
                extraClass={`${styles.extra__shop__button}`}
                product={cardMiniData}
              />
            ) : (
              <Skeleton height={48} width={150} />
            )}
            {!isReallyLoading ? (
              <button
                onClick={(event) => {
                  event.preventDefault()
                }}
                className={`${styles.by__now__button}`}
              >
                Купить сейчас
              </button>
            ) : (
              <Skeleton height={48} width={150} />
            )}
          </div>
        </div>
        <div className={`${styles.card__state__mini}`}>
          {!isReallyLoading ? (
            <h4 className={`${styles.state__mini__title}`}>Информация о доставке</h4>
          ) : (
            <Skeleton style={{width: 100000, maxWidth: '100%', marginBottom: '16px'}} height={26} />
          )}
          <ul className={`${styles.state__mini__list}`}>
            <li className={`${styles.state__mini__list__item}`}>
              {!isReallyLoading ? (
                <p className={`${styles.state__mini__list__item__text}`}>по России</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '70px'}} height={16} />
              )}
              {!isReallyLoading ? (
                <p className={`${styles.state__mini__list__item__value}`}>1-3 недели</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '100px'}} height={16} />
              )}
            </li>
            <li className={`${styles.state__mini__list__item}`}>
              {!isReallyLoading ? (
                <p className={`${styles.state__mini__list__item__text}`}>по Китаю </p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '70px'}} height={16} />
              )}
              {!isReallyLoading ? (
                <p className={`${styles.state__mini__list__item__value}`}>2-6 недели</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '100px'}} height={16} />
              )}
            </li>
          </ul>
          {!isReallyLoading ? (
            <h4 className={`${styles.state__mini__title}`}>Варианты упаковки</h4>
          ) : (
            <Skeleton style={{width: 100000, maxWidth: '100%', marginBottom: '16px'}} height={26} />
          )}
          <ul className={`${styles.state__mini__list}`}>
            <li className={`${styles.state__mini__list__item}`}>
              {!isReallyLoading ? (
                <p className={`${styles.state__mini__list__item__text}`}>Паллеты</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '70px'}} height={16} />
              )}
            </li>
            <li className={`${styles.state__mini__list__item}`}>
              {!isReallyLoading ? (
                <p className={`${styles.state__mini__list__item__text}`}>Коробки</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '70px'}} height={16} />
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
