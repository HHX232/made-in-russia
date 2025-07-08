'use client'
import {useEffect, useState, useRef, useMemo} from 'react'
import Header from '@/components/MainComponents/Header/Header'
import styles from './CategoryPage.module.scss'
import Catalog from '@/components/screens/Catalog/Catalog'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Category} from '@/services/categoryes/categoryes.service'
import {useActions} from '@/hooks/useActions'
import Footer from '@/components/MainComponents/Footer/Footer'
import useWindowWidth from '@/hooks/useWindoWidth'
import Slider from 'react-slick'

const CATEGORYESCONST = [
  {title: 'Однолетние культуры', value: 'Annual_crops', imageSrc: '/category/cat1.jpg'},
  {title: 'Многолетние культуры', value: 'Perennial_crops', imageSrc: '/category/cat2.jpg'},
  {title: 'Рассада', value: 'Seedlings', imageSrc: '/category/cat3.jpg'},
  {title: 'Животноводство', value: 'Livestock_farming', imageSrc: '/category/cat4.jpg'},
  {title: 'Смешанное сельское хозяйство', value: 'Mixed_farming', imageSrc: '/category/cat5.jpg'}
]

const CategoryPage = ({
  categoryName,
  level = 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parentCategory,
  categories = [],
  idOfFilter,
  categoryTitleName
}: {
  categoryName: string
  categoryTitleName?: string
  level?: number
  parentCategory?: string
  categories?: Category[]
  idOfFilter?: number
}) => {
  const [sortedCategories, setSortedCategories] = useState<Category[]>(categories)
  const [activeFilterId, setActiveFilterId] = useState<number | null>(idOfFilter || null)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const pathname = usePathname()
  const {clearFilters, setFilter} = useActions()
  const windowWidth = useWindowWidth()
  useEffect(() => {
    return () => {
      clearFilters()
    }
  }, [])

  useEffect(() => {
    clearFilters()
    setFilter({filterName: idOfFilter?.toString() || '', checked: idOfFilter ? true : false})
    setActiveFilterId(idOfFilter || null)

    return () => {
      clearFilters()
    }
  }, [clearFilters, idOfFilter, setFilter])

  // Мемоизируем строковое представление категорий для сравнения
  const categoriesKey = useMemo(() => {
    return JSON.stringify(categories.map((cat) => cat.id || cat.slug))
  }, [categories])

  useEffect(() => {
    if (level === 2 && listRef.current && categories.length > 0) {
      // Даем время для рендеринга элементов
      const timeoutId = setTimeout(() => {
        const measurements = itemRefs.current
          .filter((ref) => ref !== null)
          .map((ref, index) => {
            if (!ref || !categories[index]) return null
            const width = ref.getBoundingClientRect().width
            return {
              index,
              width,
              category: categories[index]
            }
          })
          .filter((item) => item !== null)

        // Сортируем от меньшей ширины к большей
        const sorted = measurements.sort((a, b) => {
          if (!a || !b) return 0
          return a.width - b.width
        })

        // Обновляем порядок категорий
        const newOrder = sorted.map((item) => item?.category).filter((cat): cat is Category => cat !== undefined)

        if (newOrder.length > 0) {
          setSortedCategories(newOrder)
        }
      }, 100)

      // Очищаем таймаут при размонтировании или изменении зависимостей
      return () => clearTimeout(timeoutId)
    } else {
      // Для level !== 2 или когда нет необходимости в сортировке
      setSortedCategories(categories)
    }
  }, [level, categoryName, categoriesKey, categories]) // Используем categoriesKey вместо categories

  // Используем sortedCategories для отображения
  const categoriesToDisplay = sortedCategories

  // Функция для построения правильного href
  const buildHref = (category: Category) => {
    if (level === 1) {
      // Для первого уровня: /categories/{categoryName}/{slug}
      return `/categories/${categoryName}/${category.slug.toLowerCase()}`
    } else {
      // Для второго уровня используем текущий pathname и добавляем к нему новую категорию
      return `${pathname}/${category.slug.toLowerCase()}`
    }
  }

  // Обработчик клика для level === 3
  const handleFilterClick = (category: Category) => {
    if (activeFilterId === category.id) {
      // Если категория уже активна, деактивируем ее
      clearFilters()
      // Восстанавливаем базовый фильтр страницы если он есть
      if (idOfFilter) {
        setFilter({filterName: idOfFilter.toString(), checked: true})
      }
      setActiveFilterId(null)
    } else {
      // Очищаем предыдущие фильтры и устанавливаем новый
      clearFilters()
      // Устанавливаем базовый фильтр страницы если он есть
      if (idOfFilter) {
        setFilter({filterName: idOfFilter.toString(), checked: true})
      }
      // Добавляем дополнительный фильтр
      setFilter({filterName: category.id?.toString() || '', checked: true})
      setActiveFilterId(category.id || null)
    }
  }
  const mainSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2, // Показывать 2 слайда одновременно
    slidesToScroll: 1, // Прокручивать по одному слайду
    arrows: true,
    fade: false, // Убираем fade для корректной работы с несколькими слайдами
    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  // Функция для группировки категорий по 2 в слайд
  const groupCategoriesIntoSlides = (categories: Category[]) => {
    const slides = []
    for (let i = 0; i < categories.length; i += 2) {
      slides.push(categories.slice(i, i + 2))
    }
    return slides
  }

  return (
    <div>
      <Header />
      <div className='container'>
        <div className={styles.category__inner}>
          {level < 4 && (
            <h1 className={styles.category__title__main}>
              {categoryTitleName
                ? categoryTitleName.slice(0, 1).toUpperCase() +
                  categoryTitleName.slice(1).replace(/_/g, ' ').replace(/%20/g, ' ')
                : categoryName.slice(0, 1).toUpperCase() +
                  categoryName.slice(1).replace(/_/g, ' ').replace(/%20/g, ' ')}
            </h1>
          )}

          {/* Рендер для level < 3 с ссылками */}
          {level < 3 && categoriesToDisplay.length > 0 && windowWidth && windowWidth > 900 && (
            <ul
              ref={listRef}
              className={`${styles.category__list} ${level === 1 ? styles.category__list__first : ''} ${level > 1 ? styles.category__list__more_than_first : ''} ${level === 2 ? styles.category__list__second : ''}`}
            >
              {categoriesToDisplay.map((category, index) => (
                <Link key={category.id || category.slug} href={buildHref(category)}>
                  <li
                    style={{
                      backgroundImage: `
                                       ${level === 1 ? 'linear-gradient(rgba(24, 24, 24, 0.4), rgba(24, 24, 24, 0.4)),' : ''}
                                       url(${category.imageUrl ? category.imageUrl : (!category.imageUrl && level === 1 && CATEGORYESCONST[index]?.imageSrc) || ''})
                                       `,
                      color: level === 1 ? '#FFF' : '#000'
                    }}
                    ref={(el) => {
                      if (level === 2) {
                        itemRefs.current[index] = el
                      }
                    }}
                    className={`${styles.category__item} ${level === 2 ? styles.category__item__second : ''} ${level === 1 ? styles.category__item__with__image : ''}`}
                  >
                    <p
                      className={`${styles.category__item__title} ${level === 2 ? styles.category__item__title__second : ''}`}
                    >
                      {category.name}
                    </p>
                  </li>
                </Link>
              ))}
            </ul>
          )}

          {level < 3 && categoriesToDisplay.length > 0 && windowWidth && windowWidth < 900 && (
            <Slider {...mainSettings} className={`${styles.category__slider} category__slider__main ${level === 1 && "category__slider__first"}`}>
              {groupCategoriesIntoSlides(categoriesToDisplay).map((slideCategories, slideIndex) => (
                <div key={slideIndex} className={styles.category__slide}>
                  <div className={styles.category__slide__content}>
                    {slideCategories.map((category, index) => (
                      <Link key={category.id || category.slug} href={buildHref(category)}>
                        <div
                          style={{
                            backgroundImage: `
                                                   ${level === 1 ? 'linear-gradient(rgba(24, 24, 24, 0.4), rgba(24, 24, 24, 0.4)),' : ''}
                                                   url(${category.imageUrl ? category.imageUrl : (!category.imageUrl && level === 1 && CATEGORYESCONST[slideIndex * 2 + index]?.imageSrc) || ''})
                                                   `,
                            color: level === 1 ? '#FFF' : '#000'
                          }}
                          className={`${styles.category__item} ${level === 2 ? styles.category__item__second : ''} ${level === 1 ? styles.category__item__with__image : ''} ${styles.category__item__slider}`}
                        >
                          <p
                            className={`${styles.category__item__title} ${level === 2 ? styles.category__item__title__second : ''}`}
                          >
                            {category.name}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </Slider>
          )}

          {/* Рендер для level === 3 с фильтрами */}
          {level === 3 && categoriesToDisplay.length > 0 && (
            <ul ref={listRef} className={`${styles.category__list} ${styles.category__list__more_than_first}`}>
              {categoriesToDisplay.map((category) => (
                <li
                  key={category.id || category.slug}
                  onClick={() => handleFilterClick(category)}
                  style={{
                    backgroundColor: activeFilterId === category.id ? 'rgba(255, 182, 193, 0.3)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  className={`${styles.category__item} ${styles.category__item__second}`}
                >
                  <p className={`${styles.category__item__title} ${styles.category__item__title__second}`}>
                    {category.name}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Catalog isShowFilters={false} initialProducts={[]} initialHasMore={true} />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CategoryPage
