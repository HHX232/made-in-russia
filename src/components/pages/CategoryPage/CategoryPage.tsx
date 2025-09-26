'use client'
import {useEffect, useState, useRef, useMemo} from 'react'
import Header from '@/components/MainComponents/Header/Header'
import styles from './CategoryPage.module.scss'
import Catalog from '@/components/screens/Catalog/Catalog'
import {Category} from '@/services/categoryes/categoryes.service'
import {useActions} from '@/hooks/useActions'
import Footer from '@/components/MainComponents/Footer/Footer'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useKeenSlider} from 'keen-slider/react'
import BreadCrumbs from '@/components/UI-kit/Texts/Breadcrumbs/Breadcrumbs'
import {usePathname} from 'next/navigation'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

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
  categories = [],
  idOfFilter,
  categoryTitleName,
  companyes,
  breadcrumbs
}: {
  categoryName: string
  categoryTitleName?: string
  level?: number
  parentCategory?: string
  categories?: Category[]
  idOfFilter?: number
  breadcrumbs?: {title: string; link: string}[]
  companyes?: {name: string; inn: string; ageInYears: string}[]
}) => {
  // Проверяем, выполняется ли код на сервере
  const isServer = typeof window === 'undefined'
  const t = useTranslations('CategoryPage')
  // Инициализируем состояние с переданными категориями для SSR
  const [sortedCategories, setSortedCategories] = useState<Category[]>(categories)
  const [activeFilterId, setActiveFilterId] = useState<number | null>(idOfFilter || null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)

  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const pathname = usePathname()
  const {clearFilters, setFilter} = useActions()
  const windowWidth = useWindowWidth()

  // Определяем, какую версию показывать
  const shouldShowDesktop = isServer || (mounted && windowWidth && windowWidth > 900)
  const shouldShowMobile = !isServer && mounted && windowWidth && windowWidth <= 900

  useEffect(() => {
    setMounted(true)
    return () => {
      clearFilters()
    }
  }, [clearFilters])

  useEffect(() => {
    clearFilters()
    setFilter({filterName: idOfFilter?.toString() || '', checked: idOfFilter ? true : false})
    setActiveFilterId(idOfFilter || null)

    return () => {
      clearFilters()
    }
  }, [clearFilters, idOfFilter, setFilter])

  const categoriesKey = useMemo(() => {
    return JSON.stringify(categories.map((cat) => cat.id || cat.slug))
  }, [categories])

  // --- Keen-slider settings для компаний (только на клиенте) ---
  const companiesSlides = useMemo(
    () => (companyes && !isServer ? groupCompaniesIntoSlides(companyes, windowWidth || 1200) : []),
    [companyes, windowWidth, isServer]
  )
  const companiesTimer = useRef<NodeJS.Timeout | null>(null)

  const [companiesSliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: 'snap',
      slides: {perView: 1, spacing: 15}
    },
    mounted
      ? [
          (slider) => {
            function clearNextTimeout() {
              if (companiesTimer.current) {
                clearTimeout(companiesTimer.current)
                companiesTimer.current = null
              }
            }
            function nextTimeout() {
              clearNextTimeout()
              if (companiesSlides.length > 1) {
                companiesTimer.current = setTimeout(() => {
                  slider.next()
                }, 6000)
              }
            }

            slider.on('created', () => {
              nextTimeout()
            })
            slider.on('dragStarted', () => {
              clearNextTimeout()
            })
            slider.on('animationEnded', () => {
              nextTimeout()
            })
            slider.on('updated', () => {
              nextTimeout()
            })
            slider.on('destroyed', () => {
              clearNextTimeout()
            })
          }
        ]
      : []
  )

  // --- Keen-slider settings для категорий (только на клиенте) ---
  const slidesPerView = windowWidth && windowWidth < 600 ? 1 : 2
  const timer = useRef<NodeJS.Timeout | null>(null)

  const [categoriesSliderRef, categoriesSliderInstanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: false,
      mode: 'snap',
      slides: {perView: slidesPerView, spacing: 15},
      slideChanged(s) {
        setCurrentSlide(s.track.details.rel)
      }
    },
    mounted
      ? [
          (slider) => {
            function clearNextTimeout() {
              if (timer.current) {
                clearTimeout(timer.current)
                timer.current = null
              }
            }
            function nextTimeout() {
              clearNextTimeout()
              const slidesForCategory = groupCategoriesIntoSlides(categoriesToDisplay)
              if (slidesForCategory.length > 1) {
                timer.current = setTimeout(() => {
                  slider.next()
                }, 6000)
              }
            }

            slider.on('created', () => {
              nextTimeout()
            })
            slider.on('dragStarted', () => {
              clearNextTimeout()
            })
            slider.on('animationEnded', () => {
              nextTimeout()
            })
            slider.on('updated', () => {
              nextTimeout()
            })
            slider.on('destroyed', () => {
              clearNextTimeout()
            })
          }
        ]
      : []
  )

  function groupCompaniesIntoSlides(companies: {name: string; inn: string; ageInYears: string}[], windowWidth: number) {
    let itemsPerSlide = 30
    if (windowWidth <= 480) {
      itemsPerSlide = 10
    } else if (windowWidth <= 600) {
      itemsPerSlide = 10
    } else if (windowWidth <= 900) {
      itemsPerSlide = 20
    } else if (windowWidth <= 1200) {
      itemsPerSlide = 30
    }

    const slides = []
    for (let i = 0; i < companies.length; i += itemsPerSlide) {
      slides.push(companies.slice(i, i + itemsPerSlide))
    }
    return slides
  }

  function groupCategoriesIntoSlides(categories: Category[]) {
    const slides = []
    for (let i = 0; i < categories.length; i += 2) {
      slides.push(categories.slice(i, i + 2))
    }
    return slides
  }

  // Сортировка категорий только на клиенте после монтирования
  useEffect(() => {
    if (mounted && level === 2 && listRef.current && categories.length > 0) {
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

        const sorted = measurements.sort((a, b) => {
          if (!a || !b) return 0
          return a.width - b.width
        })

        const newOrder = sorted.map((item) => item?.category).filter((cat): cat is Category => cat !== undefined)

        if (newOrder.length > 0) {
          setSortedCategories(newOrder)
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    } else if (!mounted) {
      // На сервере используем исходный порядок
      setSortedCategories(categories)
    }
  }, [mounted, level, categoryName, categoriesKey, categories])

  const categoriesToDisplay = sortedCategories

  const buildHref = (category: Category) => {
    if (level === 1) {
      return `/categories/${categoryName}/${category.slug.toLowerCase()}`
    } else {
      return `${pathname}/${category.slug.toLowerCase()}`
    }
  }

  const handleFilterClick = (category: Category) => {
    if (activeFilterId === category.id) {
      clearFilters()
      if (idOfFilter) {
        setFilter({filterName: idOfFilter.toString(), checked: true})
      }
      setActiveFilterId(null)
    } else {
      clearFilters()
      if (idOfFilter) {
        setFilter({filterName: idOfFilter.toString(), checked: true})
      }
      setFilter({filterName: category.id?.toString() || '', checked: true})
      setActiveFilterId(category.id || null)
    }
  }

  const slidesForCategory = groupCategoriesIntoSlides(categoriesToDisplay)
  const shouldUseSlider = slidesForCategory.length > 1

  return (
    <div style={{overflowX: 'hidden'}}>
      <Header />

      <div className='container'>
        <BreadCrumbs customItems={breadcrumbs} />

        <div className={styles.category__inner}>
          {level < 4 && (
            <h1 id='cy-category-page-title' className={styles.category__title__main}>
              {categoryTitleName
                ? categoryTitleName.charAt(0).toUpperCase() +
                  categoryTitleName.slice(1).replace(/_/g, ' ').replace(/%20/g, ' ')
                : categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace(/_/g, ' ').replace(/%20/g, ' ')}
            </h1>
          )}

          {/* Desktop версия - всегда рендерится для SSR */}
          {level < 3 && categoriesToDisplay.length > 0 && shouldShowDesktop && (
            <ul
              ref={listRef}
              className={`${styles.category__list} ${
                level === 1 ? styles.category__list__first : ''
              } ${level > 1 ? styles.category__list__more_than_first : ''} ${level === 2 ? styles.category__list__second : ''}`}
            >
              {categoriesToDisplay.map((category, index) => (
                <Link key={category.id || category.slug} href={buildHref(category)}>
                  <li
                    style={{
                      backgroundImage: `
                          ${level === 1 ? 'linear-gradient(rgba(24, 24, 24, 0.4), rgba(24, 24, 24, 0.4)),' : ''}
                          url(${
                            category.imageUrl
                              ? category.imageUrl
                              : (!category.imageUrl && level === 1 && CATEGORYESCONST[index]?.imageSrc) || ''
                          })`,
                      color: level === 1 ? '#FFF' : '#000'
                    }}
                    ref={(el) => {
                      if (level === 2) {
                        itemRefs.current[index] = el
                      }
                    }}
                    className={`${styles.category__item} ${level === 2 ? styles.category__item__second : ''} ${
                      level === 1 ? styles.category__item__with__image : ''
                    }`}
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

          {/* Мобильная версия - только после гидратации */}
          {level < 3 && categoriesToDisplay.length > 0 && shouldShowMobile && (
            <>
              {shouldUseSlider ? (
                <div className={styles.category__slider__wrapper}>
                  <div
                    ref={categoriesSliderRef}
                    className={`${styles.category__slider} category__slider__main ${
                      level === 1 ? 'category__slider__first' : ''
                    } keen-slider`}
                  >
                    {slidesForCategory.map((slideCategories, slideIndex) => (
                      <div key={slideIndex} className={`keen-slider__slide ${styles.category__slide}`}>
                        <div className={styles.category__slide__content}>
                          {slideCategories.map((category, index) => (
                            <Link key={category.id || category.slug} href={buildHref(category)}>
                              <div
                                style={{
                                  backgroundImage: `
                                      ${level === 1 ? 'linear-gradient(rgba(24, 24, 24, 0.4), rgba(24, 24, 24, 0.4)),' : ''}
                                      url(${
                                        category.imageUrl
                                          ? category.imageUrl
                                          : (!category.imageUrl &&
                                              level === 1 &&
                                              CATEGORYESCONST[slideIndex * 2 + index]?.imageSrc) ||
                                            ''
                                      })`,
                                  color: level === 1 ? '#FFF' : '#000'
                                }}
                                className={`${styles.category__item} ${level === 2 ? styles.category__item__second : ''} ${
                                  level === 1 ? styles.category__item__with__image : ''
                                } ${styles.category__item__slider}`}
                              >
                                <p
                                  className={`${styles.category__item__title} ${
                                    level === 2 ? styles.category__item__title__second : ''
                                  }`}
                                >
                                  {category.name}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Точки навигации */}
                  {shouldUseSlider && categoriesSliderInstanceRef.current && (
                    <div className={styles.category__dots}>
                      {slidesForCategory.map((_, idx) => (
                        <button
                          key={idx}
                          className={`${styles.category__dot} ${idx === currentSlide ? styles.category__dot__active : ''}`}
                          onClick={() => {
                            categoriesSliderInstanceRef.current?.moveToIdx(idx)
                            setCurrentSlide(idx)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Если слайдов мало, показываем список без слайдера
                <div
                  className={`${styles.category__simple__container} ${
                    level === 1 ? styles.category__simple__container__first : ''
                  } ${styles.category__simple__container__without__slider}`}
                >
                  {categoriesToDisplay.map((category, index) => (
                    <Link key={category.id || category.slug} href={buildHref(category)}>
                      <div
                        style={{
                          backgroundImage: `
                              ${level === 1 ? 'linear-gradient(rgba(24, 24, 24, 0.4), rgba(24, 24, 24, 0.4)),' : ''}
                              url(${
                                category.imageUrl
                                  ? category.imageUrl
                                  : (!category.imageUrl && level === 1 && CATEGORYESCONST[index]?.imageSrc) || ''
                              })`,
                          color: level === 1 ? '#FFF' : '#000'
                        }}
                        className={`${styles.category__item} ${level === 2 ? styles.category__item__second : ''} ${
                          level === 1 ? styles.category__item__with__image : ''
                        } ${styles.category__item__simple}`}
                      >
                        <p className={`${styles.category__item__title} ${styles.category__item__title__second}`}>
                          {category.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Фильтры для level === 3 */}
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

          <Catalog isShowFilters={false} initialProducts={[]} initialHasMore={false} />

          {/* Секция компаний - показываем простую версию на сервере, слайдер на клиенте */}
          {companyes && companyes.length > 0 && (
            <div className={styles.companies__section}>
              <h2 className={styles.companies__title}>{t('companies')}</h2>

              {/* Серверная версия - простая сетка */}
              {isServer && (
                <div className={styles.company__grid}>
                  {companyes.slice(0, 30).map((company, index) => (
                    <div key={company.name + index} className={styles.company__card}>
                      <div className={styles.company__info}>
                        <h3 className={styles.company__name}>{company.name}</h3>
                        <p className={styles.company__inn}>
                          {t('inn')}: {company.inn}
                        </p>
                        <p className={styles.company__age}>
                          {t('experience')}: {company.ageInYears} {t('years')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Клиентская версия - слайдер */}
              {!isServer && mounted && (
                <div className={styles.companies__slider__wrapper}>
                  <div
                    ref={companiesSliderRef}
                    className={`keen-slider ${styles.companies__slider} companies__slider__main`}
                  >
                    {companiesSlides.map((slideCompanies, slideIndex) => (
                      <div key={slideIndex} className={`keen-slider__slide ${styles.company__slide__item}`}>
                        <div className={styles.company__grid}>
                          {slideCompanies.map((company, index) => (
                            <div key={company.name + index} className={styles.company__card}>
                              <div className={styles.company__info}>
                                <h3 className={styles.company__name}>{company.name}</h3>
                                <p className={styles.company__inn}>
                                  {t('inn')}: {company.inn}
                                </p>
                                <p className={styles.company__age}>
                                  {t('experience')}: {company.ageInYears} {t('years')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CategoryPage
