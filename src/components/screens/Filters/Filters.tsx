'use client'
import {FC, useEffect, useState} from 'react'
import styles from './Filters.module.scss'
import CategoryCheckBoxUI from '@/components/UI-kit/inputs/CategoryCheckBoxUI/CategoryCheckBoxUI'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import RangeInput from '@/components/UI-kit/inputs/RangeInputUI/RangeInputUI'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import FiltersService from '@/services/filters/Filters.service'
import Skeleton from 'react-loading-skeleton'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import CheckBoxInputUI from '@/components/UI-kit/inputs/CheckBoxInputUI/CheckBoxInputUI'
import {useWindowWidth} from '@/hooks/useWindoWidth'
// импорт классический

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

const Filters: FC = () => {
  const [filtersIsOpen, setFiltersIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const {delivery, selectedFilters} = useTypedSelector((state) => state.filters)
  const windowWidth = useWindowWidth()
  const toggleFilters = () => {
    if (windowWidth > 500) return

    setFiltersIsOpen((prev) => !prev)
  }

  const {data, isLoading} = useQuery({
    queryKey: ['filters'],
    queryFn: () => FiltersService.getAll()
  })

  const {data: dataDel, isLoading: isDelLoading} = useQuery({
    queryKey: ['deliveris'],
    queryFn: () => FiltersService.getDeliveryMethodIds()
  })

  const {clearFilters, clearDelivery, toggleDelivery} = useActions()

  const handleDeliveryChange = (isChecked: boolean, title: string) => {
    toggleDelivery(title)
  }
  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ['products']})
  }, [selectedFilters, delivery, queryClient])

  const listOpenIf = () => {
    if (windowWidth > 500) return styles.isOpenList
    if (windowWidth < 500 && filtersIsOpen) return styles.isOpenList
    if (windowWidth < 500 && !filtersIsOpen) return styles.isCloseList
  }
  return (
    <div className={`${styles.filters__box}`}>
      <div
        className={`${styles.titles__box} ${!filtersIsOpen && styles.titles__box_without__margin} ${windowWidth > 500 && styles.titles__box_with__margin}`}
      >
        <div onClick={toggleFilters} className={`${styles.title__box}`}>
          {windowWidth < 500 && <Arrow isActive={filtersIsOpen} />}
          <h4 className={`${styles.filters__title}`}>Фильтры</h4>
        </div>
        <button
          onClick={() => {
            clearFilters()
            clearDelivery()
          }}
          className={`${styles.clear__filters}`}
        >
          сброс
        </button>
      </div>
      <span className={`${styles.span_over} ${listOpenIf()}`}>
        <div className={`${styles.filters__part}`}>
          <p className={`${styles.filters__part_title}`}>Категории</p>
          <div className={`${styles.filters__part_checkboxes}`}>
            {!isLoading &&
              data?.map((filter) => (
                <CategoryCheckBoxUI
                  key={filter.id}
                  title={filter.name}
                  filterName={filter.id.toString()}
                  // onChange={handleFilterChange}
                />
              ))}
            {isLoading && (
              <Skeleton
                style={{display: 'flex', gap: '7px', height: '20px', maxWidth: `${windowWidth < 550 ? '200px' : ''}`}}
                count={5}
              />
            )}
          </div>
        </div>
        <div className={`${styles.part__drop} ${styles.part__drop__range}`}>
          <div className={`${styles.filters__part_droplists}`}>
            <RangeInput
              filterName='priceRange'
              title='Стоимость'
              min={0}
              max={100000}
              step={10}
              defaultMin={100}
              defaultMax={100000}
              // onChange={handleRangeChange}
              debounceTime={500}
            />
          </div>
        </div>
        <div className={`${styles.part__drop} ${styles.part__drop__lists}`}>
          <p className={`${styles.filters__part_title_drop}`}>Категории</p>
          <div className={`${styles.filters__part_droplists}`}>
            <DropList
              positionIsAbsolute={false}
              direction={'right'}
              gap={'25'}
              title='Сырье'
              items={['Сырье1', 'Сырье2', 'Сырье3', 'Сырье4']}
            />
            <DropList
              positionIsAbsolute={false}
              direction={'right'}
              gap={'25'}
              title='Металлургия'
              items={['Сырье1', 'Сырье2', 'Сырье3', 'Сырье4']}
            />
            <DropList
              positionIsAbsolute={false}
              direction={'right'}
              gap={'25'}
              title='Древесина'
              items={['Сырье1', 'Сырье2', 'Сырье3', 'Сырье4']}
            />
            <DropList
              positionIsAbsolute={false}
              direction={'right'}
              gap={'25'}
              title='Щебни'
              items={['Сырье1', 'Сырье2', 'Сырье3', 'Сырье4']}
            />
            <DropList
              positionIsAbsolute={false}
              direction={'right'}
              gap={'25'}
              title='Соли'
              items={['Сырье1', 'Сырье2', 'Сырье3', 'Сырье4']}
            />
            <DropList
              positionIsAbsolute={false}
              direction={'right'}
              gap={'25'}
              title='Угли'
              items={['Сырье1', 'Сырье2', 'Сырье3', 'Сырье4']}
            />
          </div>
        </div>
        <div className={`${styles.end__part}`}>
          <div className={`${styles.end__part_title}`}>Способы доставки</div>
          <div className={`${styles.end__part_droplists}`}>
            {isDelLoading && (
              <Skeleton
                style={{display: 'flex', gap: '7px', height: '20px', maxWidth: `${windowWidth < 550 ? '190px' : ''}`}}
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
                    />
                  )
                })}
              </>
            )}
          </div>
        </div>
      </span>
    </div>
  )
}

export default Filters

{
  /* <div className='active-filters'>
        <h3>Активные фильтры:</h3>
        {activeFilters.length > 0 ? (
          <ul>
            {activeFilters.map((filter) => (
              <li key={filter}>{filter}</li>
            ))}
          </ul>
        ) : (
          <p>Нет активных фильтров</p>
        )}
      </div> */
}
