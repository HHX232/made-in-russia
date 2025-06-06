import {FC} from 'react'
import styles from './ProfilePageBottom.module.scss'
import Image from 'next/image'
import {Review} from '@/services/card/card.types'
import Comment from '@/components/UI-kit/elements/Comment/Comment'

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
export const reviewsExample: Review[] = [
  {
    id: 1,
    media: [
      {
        id: 101,
        url: 'https://images.unsplash.com/photo-1634672652995-ee7525bce595?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        mediaType: 'image',
        mimeType: 'image/jpeg',
        altText: 'Фото товара от покупателя',
        creationDate: '2024-12-15T10:30:00Z',
        lastModificationDate: '2024-12-15T10:30:00Z'
      },
      {
        id: 102,
        url: 'https://v.ftcdn.net/02/36/94/67/700_F_236946717_rfQFRMlgOrRO1Ivx5FC1ICw3oa3HnkQV_ST.mp4',
        mediaType: 'video',
        mimeType: 'video/mp4',
        altText: 'Видео распаковки товара',
        creationDate: '2024-12-15T10:35:00Z',
        lastModificationDate: '2024-12-15T10:35:00Z'
      }
    ],
    author: {
      id: 501,
      avatar: undefined,
      role: 'Покупатель',
      email: 'ivan.petrov@email.com',
      login: 'ivan_petrov',
      phoneNumber: '+7-900-123-45-67',
      region: 'Москва',
      registrationDate: '2023-08-15T09:00:00Z',
      lastModificationDate: '2024-11-20T14:30:00Z'
    },
    text: 'Отличный товар! Качество превзошло все ожидания. Доставка быстрая, упаковка надежная. Рекомендую всем!',
    rating: 5,
    creationDate: '2024-12-15T10:45:00Z',
    lastModificationDate: '2024-12-15T10:45:00Z'
  },
  {
    id: 2,
    media: [
      {
        id: 103,
        url: 'https://images.unsplash.com/photo-1634672652995-ee7525bce595?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        mediaType: 'image',
        mimeType: 'image/jpeg',
        altText: 'Товар в использовании',
        creationDate: '2024-12-10T16:20:00Z',
        lastModificationDate: '2024-12-10T16:20:00Z'
      }
    ],
    author: {
      id: 502,
      avatar: undefined,
      role: 'Верифицированный покупатель',
      email: 'maria.sidorova@email.com',
      login: 'maria_s',
      phoneNumber: '+7-985-456-78-90',
      region: 'Санкт-Петербург',
      registrationDate: '2022-03-10T12:00:00Z',
      lastModificationDate: '2024-12-01T08:15:00Z'
    },
    text: 'Товар хороший, но есть небольшие недостатки. Цена соответствует качеству. В целом доволен покупкой.',
    rating: 4,
    creationDate: '2024-12-10T16:30:00Z',
    lastModificationDate: '2024-12-10T16:30:00Z'
  },
  {
    id: 3,
    author: {
      id: 503,
      avatar: undefined,
      role: 'Покупатель',
      email: 'alex.kozlov@email.com',
      login: 'alexkozlov',
      phoneNumber: '+7-912-345-67-89',
      region: 'Екатеринбург',
      registrationDate: '2024-01-05T14:30:00Z',
      lastModificationDate: '2024-12-05T10:00:00Z'
    },
    text: 'Средний товар. Ожидал большего за такую цену. Работает, но не впечатляет.',
    rating: 3,
    creationDate: '2024-12-05T11:15:00Z',
    lastModificationDate: '2024-12-05T11:15:00Z'
  },
  {
    id: 4,
    media: [
      {
        id: 104,
        url: 'https://images.unsplash.com/photo-1634672652995-ee7525bce595?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        mediaType: 'image',
        mimeType: 'image/jpeg',
        altText: 'Фото дефекта товара',
        creationDate: '2024-12-01T14:45:00Z',
        lastModificationDate: '2024-12-01T14:45:00Z'
      }
    ],
    author: {
      id: 504,
      avatar: undefined,
      role: 'Покупатель',
      email: 'sergey.volkov@email.com',
      login: 'sergey_v',
      phoneNumber: '+7-903-567-89-01',
      region: 'Новосибирск',
      registrationDate: '2023-11-20T16:45:00Z',
      lastModificationDate: '2024-11-30T13:20:00Z'
    },
    text: 'К сожалению, товар пришел с браком. Пришлось возвращать. Качество контроля явно хромает.',
    rating: 2,
    creationDate: '2024-12-01T15:00:00Z',
    lastModificationDate: '2024-12-01T15:00:00Z'
  },
  {
    id: 5,
    author: {
      id: 505,
      avatar: undefined,
      role: 'Покупатель',
      email: 'olga.nikolaeva@email.com',
      login: 'olga_n',
      phoneNumber: '+7-916-234-56-78',
      region: 'Краснодар',
      registrationDate: '2024-06-12T11:30:00Z',
      lastModificationDate: '2024-11-25T09:45:00Z'
    },
    text: 'Ужасный товар! Полное разочарование. Деньги выброшены на ветер. Не рекомендую никому!',
    rating: 1,
    creationDate: '2024-11-25T10:00:00Z',
    lastModificationDate: '2024-11-25T10:00:00Z'
  },
  {
    id: 6,
    media: [
      {
        id: 105,
        url: 'https://images.unsplash.com/photo-1634672652995-ee7525bce595?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        mediaType: 'image',
        mimeType: 'image/jpeg',
        altText: 'Сравнение с аналогичным товаром',
        creationDate: '2024-11-20T12:15:00Z',
        lastModificationDate: '2024-11-20T12:15:00Z'
      },
      {
        id: 106,
        url: 'https://images.unsplash.com/photo-1634672652995-ee7525bce595?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        mediaType: 'image',
        mimeType: 'image/jpeg',
        altText: 'Детальное фото качества',
        creationDate: '2024-11-20T12:20:00Z',
        lastModificationDate: '2024-11-20T12:20:00Z'
      }
    ],
    author: {
      id: 506,
      avatar: undefined,
      role: 'Эксперт',
      email: 'dmitry.expert@email.com',
      login: 'dmitry_expert',
      phoneNumber: '+7-925-678-90-12',
      region: 'Казань',
      registrationDate: '2021-09-08T08:00:00Z',
      lastModificationDate: '2024-11-15T16:30:00Z'
    },
    text: 'Превосходное качество! Использую уже месяц - никаких нареканий. Сравнивал с конкурентами - этот товар явно лучше. Стоит своих денег.',
    rating: 5,
    creationDate: '2024-11-20T12:30:00Z',
    lastModificationDate: '2024-11-20T12:30:00Z'
  },
  {
    id: 7,
    author: {
      id: 507,
      avatar: undefined,
      role: 'Покупатель',
      email: 'anna.fedorova@email.com',
      login: 'anna_f',
      phoneNumber: '+7-987-123-45-67',
      region: 'Ростов-на-Дону',
      registrationDate: '2023-12-03T13:15:00Z',
      lastModificationDate: '2024-11-10T11:00:00Z'
    },
    text: 'Нормальный товар, но ничего особенного. За эти деньги можно найти что-то получше.',
    rating: 3,
    creationDate: '2024-11-10T11:30:00Z',
    lastModificationDate: '2024-11-10T11:30:00Z'
  },
  {
    id: 8,
    media: [
      {
        id: 107,
        url: 'https://v.ftcdn.net/02/36/94/67/700_F_236946717_rfQFRMlgOrRO1Ivx5FC1ICw3oa3HnkQV_ST.mp4',
        mediaType: 'video',
        mimeType: 'video/mp4',
        altText: 'Полная распаковка и обзор',
        creationDate: '2024-11-05T18:00:00Z',
        lastModificationDate: '2024-11-05T18:00:00Z'
      }
    ],
    author: {
      id: 508,
      avatar: undefined,
      role: 'Блогер',
      email: 'blogger.tech@email.com',
      login: 'tech_blogger',
      phoneNumber: '+7-999-876-54-32',
      region: 'Нижний Новгород',
      registrationDate: '2022-07-22T10:45:00Z',
      lastModificationDate: '2024-11-01T14:20:00Z'
    },
    text: 'Детально протестировал товар. Качество сборки отличное, функционал соответствует описанию. Есть небольшие замечания по дизайну, но в целом рекомендую.',
    rating: 4,
    creationDate: '2024-11-05T18:30:00Z',
    lastModificationDate: '2024-11-05T18:30:00Z'
  }
]
const ProfilePageBottomDelivery: FC = () => {
  return (
    <div className={`${styles.delivery__box}`}>
      <h3 className={`${styles.delivery__box__title}`}>Мои комментарии</h3>
      <ul className={`${styles.delivery__list}`}>
        {/* {deliveryListData.map((el, i) => {
          return <DeliveryListItem key={i} {...el} />
        })} */}
        {reviewsExample.map((el, i) => {
          return <Comment key={i} {...el} />
        })}
      </ul>
    </div>
  )
}

export default ProfilePageBottomDelivery
