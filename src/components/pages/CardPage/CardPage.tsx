// components/pages/CardPage/CardPage.tsx
import {Suspense} from 'react'
import {notFound} from 'next/navigation'
import cardService from '@/services/card/card.service'
import Header from '@/components/MainComponents/Header/Header'
import {CardTopPage} from './CardTopPage'
import CardMiddlePage from './CardMiddlePage/CardMiddlePage'
import styles from './CardPage.module.scss'
import ICardFull from '@/services/card/card.types'
import CommentsSection from './CommentSection/CommentSection'
import CardBottomPage from './CardBottomPage/CardBottomPage'
import Footer from '@/components/MainComponents/Footer/Footer'
import {cookies, headers} from 'next/headers'
// import SEOHeader from '@/components/MainComponents/SEOHeader/SEOHeader'

async function CardContent({id}: {id: string}) {
  let cardData: ICardFull
  const cookieStore = await cookies()
  let locale = cookieStore.get('NEXT_LOCALE')?.value
  if (!locale) {
    const headersList = await headers()

    locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

    if (!locale) {
      const referer = headersList.get('referer')
      if (referer) {
        const match = referer.match(/\/([a-z]{2})\//)
        if (match && ['en', 'ru', 'zh'].includes(match[1])) {
          locale = match[1]
        }
      }
    }
  }
  try {
    const {data} = await cardService.getFullCardById(id, locale)
    cardData = data as ICardFull
    // console.log('cardData', cardData.aboutVendor?.media)
    if (!cardData) {
      notFound()
    }
  } catch (error) {
    console.error('Error fetching card data:', error)
    notFound()
  }

  return (
    <>
      <div className={`${styles.card__inner} ${styles.card__inner__main}`}>
        <CardTopPage isLoading={false} cardData={cardData} />
      </div>
      <CardMiddlePage isLoading={false} cardData={cardData} />
    </>
  )
}

export default async function CardPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params

  return (
    <div className={`${styles.card__box}`}>
      <Header />
      <div className='container'>
        <CardContent id={id} />
        <Suspense
          fallback={<CardBottomPage cardData={null} isLoading={true} comments={[]} specialLastElement={null} />}
        >
          <CommentsSection cardId={id} />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
