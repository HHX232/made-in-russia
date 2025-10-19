'use client'
import {FC, useState, useEffect} from 'react'
import Filters from '../Filters/Filters'
import styles from './Catalog.module.scss'
import CardsCatalog from './CardsCatalog/CardsCatalog'
import {Product} from '@/services/products/product.types'
import CardsCatalogWithPagination from './CardsCatalogWithPagination/CardsCatalogWithPagination'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import {useActions} from '@/hooks/useActions'
import ProductService from '@/services/products/product.service'
import {useTranslations} from 'next-intl'

export interface CatalogProps {
  initialProducts: Product[]
  initialHasMore: boolean
  isShowFilters?: boolean
  usePagesCatalog?: boolean
  showSearchInput?: boolean
  showCardsCount?: boolean
  showSpecialSearchFilters?: boolean
  resultTitle?: string
  showSearchTitle?: boolean
  specialRoute?: string
  useContainer?: boolean
  searchParams?: {[key: string]: string | string[] | undefined}
}

const Catalog: FC<CatalogProps> = ({
  initialProducts,
  initialHasMore,
  isShowFilters = false,
  usePagesCatalog = false,
  showSearchInput = true,
  showCardsCount = false,
  showSearchTitle = false,
  resultTitle,
  specialRoute,
  showSpecialSearchFilters = false,
  searchParams = {},
  useContainer = true
}) => {
  const [activeFilterName, setActiveFilterName] = useState<'originPrice' | 'creationDate'>('creationDate')
  const [activeFilterDirect, setActiveFilterDirect] = useState<'asc' | 'desc'>('desc')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const {clearFilters, clearDelivery, setSearchTitle} = useActions()
  const [productsCountGlobal, setProductsCountGlobal] = useState(0)
  const t = useTranslations('CatalogNew')

  const textParams = typeof searchParams.textParams === 'string' ? searchParams.textParams : undefined

  useEffect(() => {
    const fetchProductsCount = async () => {
      try {
        const data = await ProductService.getAll({page: 0, size: 1, title: textParams})
        setProductsCountGlobal(data?.totalElements)
        console.log('data fetchProductsCount', data)
      } catch {}
    }
    fetchProductsCount()
  }, [textParams])

  // Обработка параметра textParams при монтировании
  useEffect(() => {
    if (textParams) {
      setSearchTitle(textParams)
    }

    // Очистка при размонтировании
    return () => {
      setSearchTitle('')
    }
  }, [textParams, setSearchTitle])

  // Блокировка скролла при открытом мобильном фильтре
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileFilterOpen])

  const handleCloseMobileFilter = () => {
    setIsMobileFilterOpen(false)
  }

  return (
    <>
      <div
        className={`${useContainer ? 'container' : ''}  ${styles.top__fliters__container} ${showSpecialSearchFilters && styles.without__big__top__margin}`}
      >
        {isShowFilters && !showSpecialSearchFilters && (
          <div className={`${styles.top__fliters__container__inner}`}>
            {/* Кнопка фильтра для мобильных устройств */}
            {showSearchTitle && <h2>Результат поиска по запросу: {resultTitle || textParams}</h2>}
            <button className={styles.mobile__filter__button} onClick={() => setIsMobileFilterOpen(true)}>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M13.7336 2.73372V4.20039C13.7336 4.73372 13.4002 5.40039 13.0669 5.73372L10.2002 8.26706C9.80025 8.60039 9.53358 9.26706 9.53358 9.80039V12.6671C9.53358 13.0671 9.26692 13.6004 8.93358 13.8004L8.00025 14.4004C7.13358 14.9337 5.93358 14.3337 5.93358 13.2671V9.73372C5.93358 9.26706 5.66692 8.66706 5.40025 8.33372L5.08692 8.00706C4.88025 7.78706 4.84025 7.45372 5.00692 7.19372L8.42025 1.71372C8.54025 1.52039 8.75358 1.40039 8.98692 1.40039H12.4002C13.1336 1.40039 13.7336 2.00039 13.7336 2.73372Z'
                  fill='#2F2F2F'
                />
                <path
                  d='M6.89994 2.42039L4.53327 6.21372C4.3066 6.58039 3.7866 6.63372 3.4866 6.32039L2.8666 5.66706C2.53327 5.33372 2.2666 4.73372 2.2666 4.33372V2.80039C2.2666 2.00039 2.8666 1.40039 3.59993 1.40039H6.33327C6.85327 1.40039 7.17327 1.97372 6.89994 2.42039Z'
                  fill='#2F2F2F'
                />
              </svg>
              Фильтр
            </button>

            <div className={styles.drop__list__filter__box}>
              <svg
                className={styles.filter__svg}
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10.4498 6.71997L6.72974 3L3.00977 6.71997'
                  stroke='#292D32'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M6.72949 21V3'
                  stroke='#292D32'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M13.5498 17.28L17.2698 21L20.9898 17.28'
                  stroke='#292D32'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M17.2695 3V21'
                  stroke='#292D32'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <DropList
                extraClass={styles.min__drop__extra}
                title={t(activeFilterName)}
                useNewTheme
                extraListClass={styles.extra__extra__drop__list}
                items={[
                  <p
                    key={1}
                    style={{width: '100%'}}
                    onClick={() => {
                      setActiveFilterName('creationDate')
                      setActiveFilterDirect('desc')
                    }}
                  >
                    {t('new')}
                  </p>,
                  <p
                    style={{width: '100%'}}
                    key={2}
                    onClick={() => {
                      setActiveFilterName('originPrice')
                      setActiveFilterDirect('asc')
                    }}
                  >
                    {t('cheapest')}
                  </p>,
                  <p
                    style={{width: '100%'}}
                    key={3}
                    onClick={() => {
                      setActiveFilterName('originPrice')
                      setActiveFilterDirect('desc')
                    }}
                  >
                    {t('expensive')}
                  </p>
                ]}
              />
            </div>
            {showSearchInput && <SearchInputUI useNewBorder />}
            {showCardsCount && (
              <p style={{fontSize: '14px', color: '#2F2F2F'}}>
                {/* Найдено 123 товаров */}
                {t('found')} {productsCountGlobal} {t('products')}
              </p>
            )}
          </div>
        )}
        {showSpecialSearchFilters && (
          <div
            className={`${styles.top__fliters__container__inner} ${styles.top__fliters__container__inner__spec__search}`}
          >
            {/* Кнопка фильтра для мобильных устройств */}
            {showSearchTitle && (
              <h2 className={styles.search__title__big}>
                {t('resultTitle')}: {resultTitle || textParams}
              </h2>
              // <h2 className={styles.search__title__big}>Результат поиска по запросу: {resultTitle || textParams}</h2>
            )}
            <div className={styles.spec__search__line}>
              <button className={styles.mobile__filter__button} onClick={() => setIsMobileFilterOpen(true)}>
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M13.7336 2.73372V4.20039C13.7336 4.73372 13.4002 5.40039 13.0669 5.73372L10.2002 8.26706C9.80025 8.60039 9.53358 9.26706 9.53358 9.80039V12.6671C9.53358 13.0671 9.26692 13.6004 8.93358 13.8004L8.00025 14.4004C7.13358 14.9337 5.93358 14.3337 5.93358 13.2671V9.73372C5.93358 9.26706 5.66692 8.66706 5.40025 8.33372L5.08692 8.00706C4.88025 7.78706 4.84025 7.45372 5.00692 7.19372L8.42025 1.71372C8.54025 1.52039 8.75358 1.40039 8.98692 1.40039H12.4002C13.1336 1.40039 13.7336 2.00039 13.7336 2.73372Z'
                    fill='#2F2F2F'
                  />
                  <path
                    d='M6.89994 2.42039L4.53327 6.21372C4.3066 6.58039 3.7866 6.63372 3.4866 6.32039L2.8666 5.66706C2.53327 5.33372 2.2666 4.73372 2.2666 4.33372V2.80039C2.2666 2.00039 2.8666 1.40039 3.59993 1.40039H6.33327C6.85327 1.40039 7.17327 1.97372 6.89994 2.42039Z'
                    fill='#2F2F2F'
                  />
                </svg>
                {/* Фильтр */}
                {t('filter')}
              </button>

              <div className={styles.drop__list__filter__box}>
                <svg
                  className={styles.filter__svg}
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M10.4498 6.71997L6.72974 3L3.00977 6.71997'
                    stroke='#292D32'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M6.72949 21V3'
                    stroke='#292D32'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M13.5498 17.28L17.2698 21L20.9898 17.28'
                    stroke='#292D32'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M17.2695 3V21'
                    stroke='#292D32'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <DropList
                  extraClass={styles.min__drop__extra}
                  title={t(activeFilterName)}
                  useNewTheme
                  extraListClass={styles.extra__extra__drop__list}
                  items={[
                    <p
                      key={1}
                      style={{width: '100%'}}
                      onClick={() => {
                        setActiveFilterName('creationDate')
                        setActiveFilterDirect('desc')
                      }}
                    >
                      {t('new')}
                    </p>,
                    <p
                      style={{width: '100%'}}
                      key={2}
                      onClick={() => {
                        setActiveFilterName('originPrice')
                        setActiveFilterDirect('asc')
                      }}
                    >
                      {t('cheapest')}
                    </p>,
                    <p
                      style={{width: '100%'}}
                      key={3}
                      onClick={() => {
                        setActiveFilterName('originPrice')
                        setActiveFilterDirect('desc')
                      }}
                    >
                      {t('expensive')}
                    </p>
                  ]}
                />
              </div>
              {showSearchInput && <SearchInputUI useNewBorder />}
              {showCardsCount && (
                <p className={styles.global_count__cards}>
                  {' '}
                  {/* Найдено 123 товаров */}
                  {t('found')} {productsCountGlobal} {t('products')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        style={{overflowY: 'visible', overflowX: 'clip'}}
        className={`${useContainer ? 'container' : ''} ${styles.catalog__box}`}
      >
        {/* Десктопный фильтр */}
        {isShowFilters && (
          <div className={styles.desktop__filter}>
            <Filters />
          </div>
        )}
        {/* Мобильная выдвигающаяся панель с фильтрами */}
        {isShowFilters && (
          <div
            className={`${styles.mobile__filter__sidebar} ${isMobileFilterOpen ? styles.mobile__filter__sidebar__open : ''}`}
          >
            <div className={styles.mobile__filter__overlay} onClick={handleCloseMobileFilter} />

            <div className={styles.mobile__filter__panel}>
              <div className={styles.mobile__filter__header}>
                <h2>{t('filter')}</h2>
                <button className={styles.mobile__filter__close} onClick={handleCloseMobileFilter}>
                  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M12 4L4 12'
                      stroke='#171717'
                      strokeWidth='1.6'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M4 4L12 12'
                      stroke='#171717'
                      strokeWidth='1.6'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.mobile__filter__content}>
                <Filters extraBoxClass={styles.white__back} extraDeleteButtonClass={styles.hide__button} />
              </div>

              <div className={styles.mobile__filter__footer}>
                <button className={styles.mobile__filter__apply__btn} onClick={handleCloseMobileFilter}>
                  {/* Применить */}
                  {t('apply')}
                </button>
                <button
                  className={styles.mobile__filter__clear__btn}
                  onClick={() => {
                    clearDelivery()
                    clearFilters()
                    setSearchTitle('')
                  }}
                >
                  {/* Сбросить */}
                  {t('reset')}
                </button>
              </div>
            </div>
          </div>
        )}
        {usePagesCatalog && (
          <CardsCatalogWithPagination
            isForAdmin={false}
            pageSize={9}
            initialProducts={initialProducts}
            initialCurrentPage={0}
            sortField={activeFilterName}
            direction={activeFilterDirect}
            initialTotalPages={100}
            canCreateNewProduct={false}
          />
        )}
        {!usePagesCatalog && (
          <CardsCatalog specialRoute={specialRoute} initialProducts={initialProducts} initialHasMore={initialHasMore} />
        )}
      </div>
    </>
  )
}

export default Catalog
