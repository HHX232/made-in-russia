'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import Ads from '@/components/screens/Ads/Ads'
import Header from '@/components/MainComponents/Header/Header'
import {FC} from 'react'
import Catalog, {CatalogProps} from '@/components/screens/Catalog/Catalog'
import {GetStaticProps} from 'next'
import ProductService from '@/services/products/product.service'

export const getStaticProps: GetStaticProps = async () => {
  const initialPage1 = await ProductService.getAll({page: 0, size: 10})
  const initialPage2 = await ProductService.getAll({page: 1, size: 10})

  return {
    props: {
      initialProducts: [...initialPage1.content, ...initialPage2.content],
      initialHasMore: !initialPage2.last
    },
    revalidate: 60
  }
}

const HomePage: FC<CatalogProps> = ({initialProducts, initialHasMore}) => {
  return (
    <>
      <Header />

      <Ads />
      <Catalog initialProducts={initialProducts} initialHasMore={initialHasMore} />
      {/* <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        {products?.map((product: Product) => {
          return (
            <Card
              key={Math.random()}
              id={product.id}
              title={product.title}
              price={product.price}
              discount={product.discount}
              imageUrl={product.imageUrl}
              discountedPrice={product.discountedPrice}
              deliveryMethod={product.deliveryMethod}
              fullProduct={product}
            />
          )
        })}
      </div> */}
    </>
  )
}

export default HomePage
