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
import {getAbsoluteLanguage} from '@/api/api.helper'
import BreadCrumbs from '@/components/UI-kit/Texts/Breadcrumbs/Breadcrumbs'
// import SEOHeader from '@/components/MainComponents/SEOHeader/SEOHeader'

async function CardContent({id}: {id: string}) {
  let cardData: ICardFull
  const locale = await getAbsoluteLanguage()
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
      <BreadCrumbs
        customItems={[
          {title: 'home', link: '/'},
          {title: 'card', link: `/`},
          {title: cardData.category.name, link: `/categories/${cardData.category.slug}`},
          {title: cardData.title, link: `/`}
        ]}
      />
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
