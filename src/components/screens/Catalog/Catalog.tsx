'use client'
import {FC} from 'react'
import Filters from '../Filters/Filters'
import styles from './Catalog.module.scss'
import CardsCatalog from './CardsCatalog/CardsCatalog'
import {Product} from '@/services/products/product.types'

export interface CatalogProps {
  initialProducts: Product[]
  initialHasMore: boolean
  isShowFilters?: boolean
}

const Catalog: FC<CatalogProps> = ({initialProducts, initialHasMore, isShowFilters = true}) => {
  return (
    <div style={{overflow: 'visible'}} className={`container ${styles.catalog__box}`}>
      {isShowFilters && <Filters />}
      <CardsCatalog initialProducts={initialProducts} initialHasMore={initialHasMore} />
    </div>
  )
}

export default Catalog
