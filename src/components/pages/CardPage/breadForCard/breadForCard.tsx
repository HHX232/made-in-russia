import BreadCrumbs from '@/components/UI-kit/Texts/Breadcrumbs/Breadcrumbs'
import ICardFull from '@/services/card/card.types'
import {useCategories} from '@/services/categoryes/categoryes.service'
import {buildBreadcrumbsForCard} from '@/utils/findCategoryPath'
import styles from './breadForCard.module.scss'
const BreadForCard = ({cardData, currentLang}: {cardData: ICardFull | null; currentLang: string}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = useCategories(currentLang as any)
  if (!cardData) return null
  const normalizedSlug = cardData?.category?.slug?.replace(/^l\d+_/, '') || ''

  const bread = buildBreadcrumbsForCard(categories?.data || [], normalizedSlug, cardData?.title || '')

  return (
    <div className={styles.bread}>
      <BreadCrumbs customItems={bread} />
    </div>
  )
}

export default BreadForCard
