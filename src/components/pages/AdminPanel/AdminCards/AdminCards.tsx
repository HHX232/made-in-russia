'use client'
import styles from './AdminCards.module.scss'
import CardsCatalog from '@/components/screens/Catalog/CardsCatalog/CardsCatalog'

const AdminCards = () => {
  return (
    <div className={styles.container__cards}>
      <CardsCatalog canCreateNewProduct initialProducts={[]} initialHasMore={true} />
    </div>
  )
}

export default AdminCards
