'use client'
import {FC, useEffect, useState} from 'react'
import styles from './CardPage.module.scss'
import {useParams} from 'next/navigation'
import cardService from '@/services/card/card.service'
import Header from '@/components/MainComponents/Header/Header'
import {CardTopPage} from './CardTopPage'
import {Product} from '@/services/products/product.types'
import CardMiddlePage from './CardMiddlePage/CardMiddlePage'
import CardBottomPage from './CardBottomPage/CardBottomPage'

const user_avatar = '/comments/user__avatar.jpg'
const comm1 = '/comments/comm1.jpg'
const comm2 = '/comments/comm2.jpg'

const CardPage: FC = () => {
  const params = useParams()
  const [isLoading, setIsLOading] = useState(true)
  const [cardData, setCardData] = useState<Product | null>(null)

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const {data, isLoading: isLoadingRes} = await cardService.getCardById(params.id as string)
        setIsLOading(isLoadingRes)
        setCardData(data as Product)
        console.log('cardData', data, params.id)
      } catch (error) {
        console.error('Error fetching card:', error)
      }
    }

    fetchCardData()
  }, [params.id])

  return (
    <div className={`${styles.card__box}`}>
      <Header isShowBottom={false} />
      <div className='container'>
        <div className={`${styles.card__inner} ${styles.card__inner__main}`}>
          <CardTopPage isLoading={isLoading} cardData={cardData} />
        </div>
        <CardMiddlePage isLoading={isLoading} />
        <CardBottomPage
          isLoading={isLoading}
          comments={[
            {
              commentID: '1',
              userId: 'user101',
              userName: 'Алексей Иванов',
              userImage: user_avatar,
              commentText:
                'Отличный пост, очень информативно! Отличный пост, очень информативно! Отличный пост, очень информативно! Отличный пост, очень информативно!',
              createdAt: '2023-05-15T10:30:00Z',
              starsCount: 2,
              images: [comm1]
            },
            {
              commentID: '2',
              userId: 'user202',
              userName: 'Мария Петрова',
              userImage: user_avatar,
              commentText: 'Спасибо за полезную информацию!',
              createdAt: '2023-05-16T14:45:00Z',
              starsCount: 4,
              images: [comm2, comm1]
            },
            {
              commentID: '3',
              userId: 'user303',
              userName: 'Дмитрий Смирнов',
              userImage: user_avatar,
              commentText: 'Есть вопросы по второму пункту, можно уточнить?',
              createdAt: '2023-05-17T09:15:00Z',
              starsCount: 5,
              images: []
            },
            {
              commentID: '4',
              userId: 'user404',
              userName: 'Елена Кузнецова',
              userImage: user_avatar,
              commentText: 'Все понятно и доступно объяснено, благодарю!',
              createdAt: '2023-05-18T16:20:00Z',
              starsCount: 5,
              images: [comm2, comm1]
            },
            {
              commentID: '5',
              userId: 'user505',
              userName: 'Сергей Васильев',
              userImage: user_avatar,
              commentText: 'Хотелось бы увидеть больше примеров кода.',
              createdAt: '2023-05-19T11:10:00Z',
              starsCount: 3,
              images: [comm1]
            }
          ]}
        />
      </div>
    </div>
  )
}

export default CardPage

{
  /* {isLoading && <Skeleton className={`${styles.card__def__skeleton}`} count={5} />} */
}
