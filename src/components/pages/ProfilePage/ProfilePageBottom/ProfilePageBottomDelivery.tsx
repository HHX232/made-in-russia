'use client'
import {FC, useEffect, useState} from 'react'
import styles from './ProfilePageBottom.module.scss'
import Image from 'next/image'
import {Review} from '@/services/card/card.types'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import {useTranslations} from 'next-intl'
import instance from '@/api/api.interceptor'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

type delStatus = 'Оформлен' | 'Доставлен' | 'Отменен' | 'Доставка'

interface IDeliveryListItemProps {
  count: number
  title: string
  imageUrl: string
  miniDescription: string
  price: number
  priceByOne: number
  status: delStatus
  byDate: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DeliveryListItem: FC<IDeliveryListItemProps> = ({
  count,
  title,
  imageUrl,
  miniDescription,
  price,
  status,
  byDate,
  priceByOne
}) => {
  return (
    <li className={`${styles.delivery__list__item}`}>
      <Image className={`${styles.delivery__list__item__image}`} src={imageUrl} alt={title} width={105} height={105} />
      <div className={`${styles.descr__box}`}>
        <p className={`${styles.descr__box__title}`}>{title}</p>
        <p className={`${styles.descr__box__miniDescription}`}>{miniDescription}</p>
        <p className={`${styles.descr__box__status} ${status === 'Доставлен' ? styles.delivered : ''}`}>{status}</p>
        <p className={`${styles.descr__box__byDate}`}>{'Оформлено: ' + byDate}</p>
      </div>
      <div className={`${styles.price__box}`}>
        <div className={`${styles.price__text}`}>Итого:</div>
        <div className={`${styles.prices}`}>
          <div className={`${styles.full__price}`}>{price + ' RUB'}</div>
          <div className={`${styles.one__box}`}>
            <div className={`${styles.price__by__one} ${styles.price__by__one__start}`}>{priceByOne + ' RUB'}</div>
            <div className={`${styles.price__by__one}`}>{' * ' + count}</div>
          </div>
        </div>
      </div>
    </li>
  )
}

// const deliveryListData: IDeliveryListItemProps[] = [
//   {
//     count: 1,
//     title: 'Фанера Fandok 12 мм 1525x1525 сорт 2/4  Фанера Fandok 12 мм 1525x1525 сорт 2/4 ',
//     imageUrl: '/profile/image2.png',
//     miniDescription: '10шт. 1525x1525 и еще какие нибудь важные слова описания, просто чтоб выглядело круто',
//     price: 1000,
//     priceByOne: 1000,
//     status: 'Оформлен',
//     byDate: '2025-06-03'
//   },
//   {
//     count: 2,
//     title: 'Панель ПВХ Europrofile Бамбук светлый ',
//     imageUrl: '/profile/image1.png',
//     miniDescription: '10шт. 1525x1525',
//     price: 3000,
//     priceByOne: 1500,
//     status: 'Доставлен',
//     byDate: '2025-06-03'
//   },
//   {
//     count: 2,
//     title: 'Панель ПВХ Europrofile Бамбук светлый ',
//     imageUrl: '/profile/image1.png',
//     miniDescription: '10шт. 1525x1525',
//     price: 3000,
//     priceByOne: 1500,
//     status: 'Доставлен',
//     byDate: '2025-06-03'
//   },
//   {
//     count: 2,
//     title: 'Панель ПВХ Europrofile Бамбук светлый ',
//     imageUrl: '/profile/image1.png',
//     miniDescription: '10шт. 1525x1525',
//     price: 3000,
//     priceByOne: 1500,
//     status: 'Доставлен',
//     byDate: '2025-06-03'
//   },
//   {
//     count: 2,
//     title: 'Панель ПВХ Europrofile Бамбук светлый ',
//     imageUrl: '/profile/image1.png',
//     miniDescription: '10шт. 1525x1525',
//     price: 3000,
//     priceByOne: 1500,
//     status: 'Доставлен',
//     byDate: '2025-06-03'
//   },
//   {
//     count: 2,
//     title: 'Панель ПВХ Europrofile Бамбук светлый ',
//     imageUrl: '/profile/image1.png',
//     miniDescription: '10шт. 1525x1525',
//     price: 3000,
//     priceByOne: 1500,
//     status: 'Доставлен',
//     byDate: '2025-06-03'
//   }
// ]

const ProfilePageBottomDelivery: FC = () => {
  const t = useTranslations('ProfilePage.ProfilePageBottomDelivery')
  const [reviews, setReviews] = useState<Review[]>([])
  const currentLang = useCurrentLanguage()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await instance.get<{content: Review[]}>('/me/reviews', {
          headers: {
            'Accept-Language': currentLang
          }
        })
        console.log('response reviews', response)
        setReviews(response.data.content)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    fetchReviews()
  }, [currentLang])
  return (
    <div className={`${styles.delivery__box}`}>
      <h3 className={`${styles.delivery__box__title}`}>{t('title')}</h3>
      <ul className={`${styles.delivery__list}`}>
        {/* {deliveryListData.map((el, i) => {
          return <DeliveryListItem key={i} {...el} />
        })} */}
        {reviews?.length === 0 && <p>{t('noReviews')}</p>}
        {reviews?.map((el, i) => {
          return <Comment key={i} {...el} />
        })}
      </ul>
    </div>
  )
}

export default ProfilePageBottomDelivery
