/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useEffect, useState} from 'react'
import styles from './Filters.module.scss'
import CategoryCheckBoxUI from '@/components/UI-kit/inputs/CategoryCheckBoxUI/CategoryCheckBoxUI'
// import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import RangeInput from '@/components/UI-kit/inputs/RangeInputUI/RangeInputUI'
import {useQueryClient} from '@tanstack/react-query'
import Skeleton from 'react-loading-skeleton'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useCategories} from '@/services/categoryes/categoryes.service'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
// import {renderCategoryItems} from '@/components/MainComponents/Header/Header'
// import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'

const Arrow = ({isActive}: {isActive: boolean}) => {
  return (
    <svg
      style={{transition: 'all .3s', transform: `${isActive ? 'rotate(180deg)' : ''}`}}
      width='27'
      height='14'
      viewBox='0 0 27 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0_2136_26)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M12.7002 11.4267L6.33603 5.06255L7.92678 3.4718L13.4955 9.04055L19.0643 3.4718L20.655 5.06255L14.2909 11.4267C14.0799 11.6376 13.7938 11.7561 13.4955 11.7561C13.1972 11.7561 12.9111 11.6376 12.7002 11.4267Z'
          fill='#2A2E46'
        />
      </g>
      <defs>
        <clipPath id='clip0_2136_26'>
          <rect x='27' width='13.5' height='27' rx='6.75' transform='rotate(90 27 0)' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

const Filters: FC<{
  specialFilters?: {name: string; id: string}[]
  extraBoxClass?: string
  extraDeleteButtonClass?: string
}> = ({specialFilters, extraBoxClass, extraDeleteButtonClass}) => {
  const [filtersIsOpen, setFiltersIsOpen] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  const queryClient = useQueryClient()
  const {delivery, selectedFilters, searchTitle} = useTypedSelector((state) => state.filters)
  const windowWidth = useWindowWidth()
  const t = useTranslations('Filters')
  const currentLang = useCurrentLanguage()
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleFilters = () => {
    if (!isMounted || !windowWidth || windowWidth > 500) return
    setFiltersIsOpen((prev) => !prev)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {data, isLoading} = useCategories(currentLang as any)

  useEffect(() => {
    console.log('data filters', data)
  }, [data])
  // const {data: dataDel, isLoading: isDelLoading} = useQuery({
  //   queryKey: ['deliveris'],
  //   queryFn: () => FiltersService.getDeliveryMethodIds({currentLang})
  // })

  const {clearFilters, clearDelivery, setSearchTitle} = useActions()

  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ['products']})
    // console.log('Мы сделала не валидными продукты; ' + searchTitle)
  }, [selectedFilters, delivery, queryClient, searchTitle])

  const listOpenIf = (): string => {
    if (!isMounted || !windowWidth) return styles.isCloseList

    if (windowWidth > 500) return styles.isOpenList
    if (windowWidth <= 500 && filtersIsOpen) return styles.isOpenList
    if (windowWidth <= 500 && !filtersIsOpen) return styles.isCloseList

    return styles.isCloseList
  }

  const getTitlesBoxClassName = (): string => {
    let className = styles.titles__box

    if (!filtersIsOpen) {
      className += ` ${styles.titles__box_without__margin}`
    }

    if (isMounted && windowWidth && windowWidth > 500) {
      className += ` ${styles.titles__box_with__margin}`
    }

    return className
  }

  const shouldShowArrow = (): boolean => {
    return isMounted && !!windowWidth && windowWidth < 500
  }

  const getSkeletonMaxWidth = (): string => {
    if (!isMounted || !windowWidth) return '200px'
    return windowWidth < 550 ? '200px' : 'auto'
  }

  return (
    <div className={`${styles.filters__box} ${extraBoxClass}`}>
      <div className={getTitlesBoxClassName()}>
        {/* <div onClick={toggleFilters} className={`${styles.title__box}`}>
          {shouldShowArrow() && <Arrow isActive={filtersIsOpen} />}
          <h4 className={`${styles.filters__title}`}>{t('filtersTitle')}</h4>
        </div> */}
        {/* <button
          onClick={() => {
            clearFilters()
            clearDelivery()
            setSearchTitle('')
          }}
          className={`${styles.clear__filters} ${styles.clear__filters__button__title}`}
        >
          сброс
        </button> */}
      </div>
      <span className={`${styles.span_over} ${listOpenIf()}`}>
        <div className={`${styles.filters__part}`}>
          <p className={`${styles.filters__part_title}`}>{t('filtersCategory')}</p>

          <div className={`${styles.filters__part_checkboxes}`}>
            {!isLoading &&
              (specialFilters || data)?.map((filter) => (
                <CategoryCheckBoxUI key={filter.id} title={filter.name} filterName={filter.id.toString()} />
              ))}
            {isLoading && (
              <Skeleton
                style={{
                  display: 'flex',
                  gap: '7px',
                  height: '20px',
                  maxWidth: getSkeletonMaxWidth()
                }}
                count={5}
              />
            )}
          </div>
        </div>
        <div className={`${styles.part__drop} ${styles.part__drop__range}`}>
          <div className={`${styles.filters__part_droplists}`}>
            <RangeInput
              filterName='priceRange'
              title={t('filtersPrice')}
              min={0}
              max={1000000}
              step={100}
              defaultMin={0}
              defaultMax={1000000}
              debounceTime={500}
            />
          </div>
        </div>
        {/* <div className={`${styles.part__drop} ${styles.part__drop__lists}`}>
          <p className={`${styles.filters__part_title_drop}`}>Категории</p>
          <div className={`${styles.filters__part_droplists}`}>
         
            {renderCategoryItems(categoriesList, false, 'right', '25')}
          </div>
        </div> */}
        {/* <div className={`${styles.end__part}`}>
          <div className={`${styles.end__part_title}`}>Способы доставки</div>
          <div className={`${styles.end__part_droplists}`}>
            {isDelLoading && (
              <Skeleton
                style={{
                  display: 'flex',
                  gap: '7px',
                  height: '20px',
                  maxWidth: getSkeletonMaxWidth()
                }}
                count={5}
              />
            )}
        {!isDelLoading && (
              <>
                {dataDel?.map((el, i) => {
                  return (
                    <CheckBoxInputUI
                      key={el.name + i}
                      title={el.name}
                      setCheckedOnFirstRender={!!delivery?.includes(el.id.toString())}
                      filterName={el.id.toString()}
                      onChange={handleDeliveryChange}
                      extraStyles={{minHeight: '20px', minWidth: '20px'}}
                    />
                  )
                })}
              </>
            )} 
          </div>
        </div> */}
      </span>
      <div style={{paddingRight: '23px', marginTop: '10px'}} className=''>
        {windowWidth && windowWidth <= 500 && filtersIsOpen && (
          <button
            onClick={() => {
              clearFilters()
              clearDelivery()
              setSearchTitle('')
            }}
            className={`${styles.clear__filters} ${styles.clear__filters__button__bottom} ${extraDeleteButtonClass}`}
          >
            {t('filtersReset')}
          </button>
        )}
        {windowWidth && windowWidth > 500 && (
          <button
            onClick={() => {
              clearFilters()
              clearDelivery()
              setSearchTitle('')
            }}
            className={`${styles.clear__filters} ${styles.clear__filters__button__bottom} ${extraDeleteButtonClass}`}
          >
            {t('filtersReset')}
          </button>
        )}
      </div>
    </div>
  )
}

export default Filters
