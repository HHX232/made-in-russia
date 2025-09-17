'use client'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import styles from './AdminCards.module.scss'
import CardsCatalog from '@/components/screens/Catalog/CardsCatalog/CardsCatalog'
import {Product} from '@/services/products/product.types'

const AdminCards = ({initialProducts, hasMore}: {initialProducts: Product[]; hasMore: boolean}) => {
  return (
    <div className={styles.container__cards}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 className={styles.admin__cards__title}>Товары</h1>
        <SearchInputUI />
      </div>
      <CardsCatalog
        isForAdmin={true}
        extraButtonsBoxClass={styles.extraButtonsBoxClass}
        canCreateNewProduct
        initialProducts={initialProducts || []}
        initialHasMore={true || hasMore}
      />
    </div>
  )
}

export default AdminCards
