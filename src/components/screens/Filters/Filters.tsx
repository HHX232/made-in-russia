'use client'
import {FC} from 'react'
import styles from './Filters.module.scss'
import CategoryCheckBoxUI from '@/components/UI-kit/Inputs/CategoryCheckBoxUI/CategoryCheckBoxUI'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import RangeInput from '@/components/UI-kit/Inputs/RangeInputUI/RangeInputUI'
import {useQuery} from '@tanstack/react-query'
import FiltersService from '@/services/filters/Filters.service'
import Skeleton from 'react-loading-skeleton'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
// импорт классический

import {CSSProperties, useId, useState} from 'react'

import {useDebouncedCallback} from 'use-debounce'

interface ICheckBoxUIProps {
  title: string
  setCheckedOnFirstRender?: boolean
  extraClass?: string
  extraStyles?: CSSProperties
  onChange?: (checked: boolean, title: string) => void
  debounceTime?: number
  filterName: string
}

const CheckBoxUI: FC<ICheckBoxUIProps> = ({
  title,
  setCheckedOnFirstRender = false,
  extraClass,
  extraStyles,
  onChange,
  debounceTime = 1500,
  filterName
}) => {
  const id = useId()
  const [isChecked, setIsChecked] = useState(setCheckedOnFirstRender)

  const debouncedOnChange = useDebouncedCallback((checked: boolean) => {
    if (onChange) {
      onChange(checked, filterName)
    }
  }, debounceTime)

  const handleChange = () => {
    const newCheckedState = !isChecked
    setIsChecked(newCheckedState)
    debouncedOnChange(newCheckedState)
  }

  return (
    <label style={{...extraStyles}} className={`${styles.checkbox__container} ${extraClass || ''}`} htmlFor={id}>
      <div className={`${styles.checkbox__visual} ${isChecked ? styles.checkbox__visual_checked : ''}`}></div>
      <p className={`fontJaro ${styles.input__text || 'input__text'}`}>{title}</p>
      <input
        id={id}
        onChange={handleChange}
        checked={isChecked}
        className={`${styles.checkbox__hide_input}`}
        type={'checkbox'}
      />
    </label>
  )
}

const Filters: FC = () => {
  const {data, isLoading} = useQuery({
    queryKey: ['filters'],
    queryFn: () => FiltersService.getAll()
  })

  const {data: dataDel, isLoading: isDelLoading} = useQuery({
    queryKey: ['deliveris'],
    queryFn: () => FiltersService.getDeliveryMethodIds()
  })

  const {clearFilters, clearDelivery, toggleDelivery} = useActions()
  const {delivery} = useTypedSelector((state) => state.filters)

  const handleDeliveryChange = (isChecked: boolean, title: string) => {
    toggleDelivery(title)
  }
  return (
    <div className={`${styles.filters__box}`}>
      <div className={`${styles.titles__box}`}>
        <h4 className={`${styles.filters__title}`}>Фильтры</h4>
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
      <span className={`${styles.span_over}`}>
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
            {isLoading && <Skeleton style={{display: 'flex', gap: '7px', height: '20px'}} count={5} />}
          </div>
        </div>
        <div className={`${styles.part__drop}`}>
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
        <div className={`${styles.part__drop}`}>
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
            {isDelLoading && <Skeleton style={{display: 'flex', gap: '7px', height: '20px'}} count={5} />}
            {!isDelLoading && (
              <>
                {dataDel?.map((el, i) => {
                  return (
                    <CheckBoxUI
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
