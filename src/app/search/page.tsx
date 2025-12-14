import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import Catalog from '@/components/screens/Catalog/Catalog'
import React from 'react'

interface SearchPageProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}

export default async function Search({searchParams}: SearchPageProps) {
  const params = await searchParams

  return (
    <>
      <Header useSticky={false} />
      <Catalog
        showSearchTitle
        showSearchInput={false}
        usePagesCatalog={true}
        initialHasMore={true}
        initialProducts={[]}
        showCardsCount
        isShowFilters
        showSpecialSearchFilters
        searchParams={params}
      />
      <Footer />
    </>
  )
}
