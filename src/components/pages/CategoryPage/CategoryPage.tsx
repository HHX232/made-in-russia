'use client'
import {useEffect, useState, useRef, useMemo} from 'react'
import {useSearchParams, useRouter, usePathname} from 'next/navigation'
import Header from '@/components/MainComponents/Header/Header'
import styles from './CategoryPage.module.scss'
import Catalog from '@/components/screens/Catalog/Catalog'
import {Category} from '@/services/categoryes/categoryes.service'
import {useActions} from '@/hooks/useActions'
import Footer from '@/components/MainComponents/Footer/Footer'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useKeenSlider} from 'keen-slider/react'
import BreadCrumbs from '@/components/UI-kit/Texts/Breadcrumbs/Breadcrumbs'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import Image from 'next/image'

const CategoryPage = ({
  categoryName,
  level = 1,
  categories = [],
  idOfFilter,
  categoryTitleName,
  companyes,
  breadcrumbs,
  language,
  initialLastFilterSlug,
  categoryDescription,
  isShowPopulaTitle = true
}: {
  categoryName: string
  categoryTitleName?: string
  level?: number
  parentCategory?: string
  categories?: Category[]
  idOfFilter?: number
  breadcrumbs?: {title: string; link: string}[]
  companyes?: {name: string; inn: string; ageInYears: string}[]
  language?: 'ru' | 'en' | 'zh' | 'hi'
  initialLastFilterSlug?: string
  categoryDescription?: string
  isShowPopulaTitle?: boolean
}) => {
  const isServer = typeof window === 'undefined'
  const t = useTranslations('CategoryPage')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [sortedCategories, setSortedCategories] = useState<Category[]>(categories)
  const [activeFilterId, setActiveFilterId] = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentCompSlide, setCurrentCompSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [companiesSliderHeight, setCompaniesSliderHeight] = useState<number>(0)

  const listRef = useRef<HTMLUListElement>(null)
  const {clearFilters, setFilter} = useActions()
  const windowWidth = useWindowWidth()

  const shouldShowDesktop = isServer || (mounted && windowWidth && windowWidth > 900)
  const shouldShowMobile = !isServer && mounted && windowWidth && windowWidth <= 900

  const isLastCategoryLevel =
    level >= 3 && categories.length > 0 && (!categories[0]?.children || categories[0]?.children?.length === 0)

  useEffect(() => {
    setMounted(true)
    return () => {
      clearFilters()
    }
  }, [clearFilters])

  useEffect(() => {
    setSortedCategories(categories)
  }, [categories, language])

  // Обработка query параметра lastFilterName
  useEffect(() => {
    clearFilters()

    // Приоритет: query параметр > initialLastFilterSlug > idOfFilter
    const lastFilterNameFromQuery = searchParams?.get('lastFilterName')
    const lastFilterSlug = lastFilterNameFromQuery || initialLastFilterSlug

    if (lastFilterSlug) {
      // Ищем категорию по slug
      const foundCategory = categories.find((cat) => cat.slug.toLowerCase() === lastFilterSlug.toLowerCase())

      if (foundCategory && foundCategory.id) {
        // Устанавливаем фильтр основной категории если есть
        if (idOfFilter) {
          setFilter({filterName: idOfFilter.toString(), checked: true})
        }
        // Устанавливаем фильтр для найденной категории
        setFilter({filterName: foundCategory.id.toString(), checked: true})
        setActiveFilterId(foundCategory.id)
      } else if (idOfFilter) {
        // Если категория не найдена, используем idOfFilter
        setFilter({filterName: idOfFilter.toString(), checked: true})
        setActiveFilterId(idOfFilter)
      }
    } else if (idOfFilter) {
      // Если нет lastFilterName, используем idOfFilter
      setFilter({filterName: idOfFilter.toString(), checked: true})
      setActiveFilterId(idOfFilter)
    }

    return () => {
      clearFilters()
    }
  }, [clearFilters, idOfFilter, setFilter, categories, searchParams, initialLastFilterSlug])

  const companiesSlides = useMemo(
    () => (companyes && !isServer ? groupCompaniesIntoSlides(companyes, windowWidth || 1200) : []),
    [companyes, windowWidth, isServer]
  )

  function getActiveCompanySlideHeight(
    currentIndex: number,
    companiesSlides: {name: string; inn: string; ageInYears: string}[][]
  ): number {
    if (!companiesSlides || companiesSlides.length === 0) return 0

    const normalizedIndex = ((currentIndex % companiesSlides.length) + companiesSlides.length) % companiesSlides.length
    const companiesInSlide = companiesSlides[normalizedIndex]?.length || 0

    let columns = 1
    let rows = 1
    let rowHeight = 120

    if (windowWidth && windowWidth > 1300) {
      columns = 3
      rows = 4
      rowHeight = 180
    } else if (windowWidth && windowWidth > 1000 && windowWidth && windowWidth <= 1300) {
      columns = 2
      rows = 6
      rowHeight = 165
    } else if (windowWidth && windowWidth > 900 && windowWidth && windowWidth <= 1000) {
      columns = 2
      rows = 6
      rowHeight = 130
    } else if (windowWidth && windowWidth > 710 && windowWidth && windowWidth <= 900) {
      columns = 2
      rows = 3
      rowHeight = 135
    } else {
      columns = 1
      rows = 5
      rowHeight = 135
    }

    const usedRows = Math.ceil(companiesInSlide / columns)
    const totalRows = Math.min(usedRows, rows)

    const height = totalRows * rowHeight

    return height
  }

  const companiesTimer = useRef<NodeJS.Timeout | null>(null)

  const [companiesSliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: 'snap',
      slides: {perView: 1, spacing: 11},
      slideChanged: (slider) => {
        setCurrentCompSlide(slider.track.details.rel)
        setCompaniesSliderHeight(getActiveCompanySlideHeight(currentCompSlide, companiesSlides))
      }
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

            slider.on('created', nextTimeout)
            slider.on('dragStarted', clearNextTimeout)
            slider.on('animationEnded', nextTimeout)
            slider.on('updated', nextTimeout)
            slider.on('destroyed', clearNextTimeout)
          },

          (slider) => {
            const updateHeight = () => {
              const idx = slider.track.details.rel
              const height = getActiveCompanySlideHeight(idx, companiesSlides)
              setCompaniesSliderHeight(height)
              setCurrentCompSlide(idx)
            }
            slider.on('created', updateHeight)
            slider.on('slideChanged', updateHeight)
            slider.on('animationEnded', updateHeight)
            slider.on('updated', updateHeight)
            slider.on('animationEnded', updateHeight)
          }
        ]
      : []
  )

  useEffect(() => {
    if (instanceRef.current) {
      const idx = instanceRef.current.track.details.rel
      const slideEl = instanceRef.current.slides[idx] as HTMLElement
      const content = slideEl.querySelector(`.${styles.company__grid}`) as HTMLElement
      if (content) {
        setCompaniesSliderHeight(content.getBoundingClientRect().height)
      }
    }
  }, [mounted, companiesSlides])

  useEffect(() => {
    if (instanceRef.current && companiesSlides.length > 0) {
      const currentIndex = instanceRef.current.track.details.rel
      const height = getActiveCompanySlideHeight(currentIndex, companiesSlides)
      setCompaniesSliderHeight(height)
    }
  }, [mounted, companiesSlides, JSON.stringify(instanceRef.current?.track.details.rel)])

  useEffect(() => {
    if (mounted && instanceRef.current) {
      const updateHeight = () => {
        const currentIndex = instanceRef.current?.track.details.rel
        if (currentIndex !== undefined) {
          const activeSlide = instanceRef.current?.slides[currentIndex]
          if (activeSlide) {
            const slideElement = activeSlide as HTMLElement
            const slideContent = slideElement.querySelector(`.${styles.company__grid}`) as HTMLElement
            if (slideContent) {
              requestAnimationFrame(() => {
                const height = slideContent.getBoundingClientRect().height
                setCompaniesSliderHeight(height)
              })
            }
          }
        }
      }

      const timeoutId = setTimeout(updateHeight, 250)
      return () => clearTimeout(timeoutId)
    }
  }, [windowWidth, mounted, instanceRef, companiesSlides])

  const slidesPerView = windowWidth && windowWidth < 600 ? 1 : 2
  const timer = useRef<NodeJS.Timeout | null>(null)

  const [lastLevelSliderRef, lastLevelSliderInstanceRef] = useKeenSlider<HTMLDivElement>(
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

            slider.on('created', nextTimeout)
            slider.on('dragStarted', clearNextTimeout)
            slider.on('animationEnded', nextTimeout)
            slider.on('updated', nextTimeout)
            slider.on('destroyed', clearNextTimeout)
          }
        ]
      : []
  )

  function groupCompaniesIntoSlides(companies: {name: string; inn: string; ageInYears: string}[], windowWidth: number) {
    let itemsPerSlide = 12
    if (windowWidth <= 480) {
      itemsPerSlide = 5
    } else if (windowWidth <= 600) {
      itemsPerSlide = 5
    } else if (windowWidth <= 900) {
      itemsPerSlide = 5
    } else if (windowWidth <= 1200) {
      itemsPerSlide = 12
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

  const categoriesToDisplay = sortedCategories

  // Всегда строим плоскую ссылку: /categories/{slug}
  const buildHref = (category: Category) => {
    return `/categories/${category.slug.toLowerCase()}`
  }

  const handleFilterClick = (category: Category) => {
    const currentParams = new URLSearchParams(searchParams?.toString() || '')

    if (activeFilterId === category.id) {
      // Снимаем активный фильтр
      clearFilters()
      if (idOfFilter) {
        setFilter({filterName: idOfFilter.toString(), checked: true})
      }
      setActiveFilterId(null)

      // Удаляем query параметр
      currentParams.delete('lastFilterName')
    } else {
      // Устанавливаем новый активный фильтр
      clearFilters()
      if (idOfFilter) {
        setFilter({filterName: idOfFilter.toString(), checked: true})
      }
      setFilter({filterName: category.id?.toString() || '', checked: true})
      setActiveFilterId(category.id || null)

      // Добавляем/обновляем query параметр
      currentParams.set('lastFilterName', category.slug.toLowerCase())
    }

    // Обновляем URL
    const newUrl = currentParams.toString() ? `${pathname}?${currentParams.toString()}` : pathname

    router.push(newUrl, {scroll: false})
  }

  const slidesForLastLevel = groupCategoriesIntoSlides(categoriesToDisplay)
  const shouldUseSlider = slidesForLastLevel.length > 1

  return (
    <div style={{overflowX: 'hidden'}}>
      <Header />

      <div className='container'>
        <BreadCrumbs customItems={breadcrumbs} />

        <div className={styles.category__inner}>
          <h1 id='cy-category-page-title' className={styles.category__title__main}>
            {categoryTitleName
              ? categoryTitleName.charAt(0).toUpperCase() +
                categoryTitleName.slice(1).replace(/_/g, ' ').replace(/%20/g, ' ')
              : categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace(/_/g, ' ').replace(/%20/g, ' ')}
          </h1>

          {!isLastCategoryLevel && categoriesToDisplay.length > 0 && shouldShowDesktop && (
            <div className={`row ${styles.category__cards__grid}`}>
              {categoriesToDisplay.map((category) => (
                <div
                  key={category.id || category.slug}
                  className={`col-lg-4 col-xl-3 col-12 col-sm-6 ${styles.category__card__col}`}
                >
                  <div className={styles.category_in_card}>
                    {category.imageUrl && (
                      <Link href={buildHref(category)} className={styles.category_in_card__image}>
                        <Image src={category.imageUrl || ''} alt={category.name} width={302} height={201} />
                      </Link>
                    )}
                    <div className={styles.category_in_card__content}>
                      <Link href={buildHref(category)}>
                        <h3 className={styles.category_in_card__title}>{category.name}</h3>
                      </Link>
                      {category.children && category.children.length > 0 && (
                        <ul className={styles.category_in_card__list}>
                          {category.children.map((child) => (
                            <li key={child.id || child.slug}>
                              {/* Всегда плоская ссылка /categories/{slug} */}
                              <Link href={`/categories/${child.slug.toLowerCase()}`}>{child.name}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLastCategoryLevel && categoriesToDisplay.length > 0 && shouldShowMobile && (
            <div className={`row ${styles.category__cards__grid}`}>
              {categoriesToDisplay.map((category) => (
                <div key={category.id || category.slug} className={`col-12 ${styles.category__card__col}`}>
                  <div className={styles.category_in_card}>
                    {category.imageUrl && (
                      <Link href={buildHref(category)} className={styles.category_in_card__image}>
                        <Image src={category.imageUrl || ''} alt={category.name} width={302} height={201} />
                      </Link>
                    )}
                    <div className={styles.category_in_card__content}>
                      <Link href={buildHref(category)}>
                        <h3 className={styles.category_in_card__title}>{category.name}</h3>
                      </Link>
                      {category.children && category.children.length > 0 && (
                        <ul className={styles.category_in_card__list}>
                          {category.children.map((child) => (
                            <li key={child.id || child.slug}>
                              {/* Всегда плоская ссылка /categories/{slug} */}
                              <Link href={`/categories/${child.slug.toLowerCase()}`}>{child.name}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLastCategoryLevel && categoriesToDisplay.length > 0 && shouldShowDesktop && (
            <ul ref={listRef} className={`${styles.category__list} ${styles.category__list__last__level}`}>
              {categoriesToDisplay.map((category) => (
                <li
                  key={category.id || category.slug}
                  onClick={() => handleFilterClick(category)}
                  style={{
                    backgroundColor: activeFilterId === category.id ? 'rgba(0, 71, 186, 0.1)' : '#f4f5f6',
                    cursor: 'pointer'
                  }}
                  className={`${styles.category__item} ${styles.category__last__level__item}`}
                >
                  <p className={`${styles.category__item__title} ${styles.category__last__level__title}`}>
                    {category.name}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {isLastCategoryLevel && categoriesToDisplay.length > 0 && shouldShowMobile && (
            <>
              {shouldUseSlider ? (
                <div className={styles.category__slider__wrapper}>
                  <div
                    ref={lastLevelSliderRef}
                    className={`${styles.category__slider} category__slider__last keen-slider`}
                  >
                    {slidesForLastLevel.map((slideCategories, slideIndex) => (
                      <div key={slideIndex} className={`keen-slider__slide ${styles.category__slide}`}>
                        <div className={styles.category__slide__content}>
                          {slideCategories.map((category) => (
                            <div
                              key={category.id || category.slug}
                              onClick={() => handleFilterClick(category)}
                              style={{
                                backgroundColor: activeFilterId === category.id ? 'rgba(0, 71, 186, 0.1)' : '#f4f5f6',
                                cursor: 'pointer'
                              }}
                              className={`${styles.category__item} ${styles.category__item__slider} ${styles.category__last__level__item}`}
                            >
                              <p className={`${styles.category__item__title} ${styles.category__last__level__title}`}>
                                {category.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {shouldUseSlider && lastLevelSliderInstanceRef.current && (
                    <div className={styles.category__dots}>
                      {slidesForLastLevel.map((_, idx) => (
                        <button
                          key={idx}
                          className={`${styles.category__dot} ${idx === currentSlide ? styles.category__dot__active : ''}`}
                          onClick={() => {
                            lastLevelSliderInstanceRef.current?.moveToIdx(idx)
                            setCurrentSlide(idx)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <ul className={`${styles.category__list} ${styles.category__list__last__level}`}>
                  {categoriesToDisplay.map((category) => (
                    <li
                      key={category.id || category.slug}
                      onClick={() => handleFilterClick(category)}
                      style={{
                        backgroundColor: activeFilterId === category.id ? 'rgba(0, 71, 186, 0.1)' : '#f4f5f6',
                        cursor: 'pointer'
                      }}
                      className={`${styles.category__item} ${styles.category__last__level__item}`}
                    >
                      <p className={`${styles.category__item__title} ${styles.category__last__level__title}`}>
                        {category.name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          <p dangerouslySetInnerHTML={{__html: categoryDescription || ''}} className={styles.categoryDescription}></p>

          <Catalog
            mathMinHeight={true}
            extraSwiperClass={styles.extra__swiper__min}
            useContainer={false}
            isShowFilters={false}
            initialProducts={[]}
            isShowPopulaTitle={isShowPopulaTitle}
            initialHasMore={false}
          />

          {companyes && companyes.length > 0 && (
            <div className={`${styles.companies__section}`}>
              <div className={styles.navigation__box}>
                <h2 className={styles.companies__title}>{t('companies')}</h2>
                <div className={styles.arrows_box}>
                  <Image
                    onClick={() => {
                      instanceRef.current?.prev()
                      setCompaniesSliderHeight(getActiveCompanySlideHeight(currentCompSlide, companiesSlides))
                    }}
                    width={24}
                    height={24}
                    className={styles.left_arrow}
                    src='/iconsNew/arrow-right-def.svg'
                    alt='arrow prev'
                  />
                  <Image
                    onClick={() => {
                      instanceRef.current?.next()
                      setCompaniesSliderHeight(getActiveCompanySlideHeight(currentCompSlide, companiesSlides))
                    }}
                    width={24}
                    height={24}
                    className={styles.right_arrow}
                    src='/iconsNew/arrow-right-def.svg'
                    alt='arrow next'
                  />
                </div>
              </div>

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
                          {t('experience')}: {company.ageInYears} {t('years', {count: company.ageInYears})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isServer && mounted && (
                <div className={styles.companies__slider__wrapper}>
                  <div
                    ref={companiesSliderRef}
                    className={`keen-slider ${styles.companies__slider} companies__slider__main`}
                    style={{
                      height: companiesSliderHeight ? `${companiesSliderHeight}px` : 'auto',
                      transition: 'height 0.3s ease'
                    }}
                  >
                    {companiesSlides.map((slideCompanies, slideIndex) => (
                      <div key={slideIndex} className={`keen-slider__slide ${styles.company__slide__item}`}>
                        <div className={styles.company__grid}>
                          {slideCompanies.map((company, index) => (
                            <div key={company.name + company.inn + index} className={styles['companys-card']}>
                              <div className={styles['companys-card__top']}>
                                <div className={styles['companys-card__avatar']}>
                                  <span className={styles['avatar-name']}>
                                    {(() => {
                                      const parts = company.name.split('"')
                                      if (parts.length > 1 && parts[1].trim().length > 0) {
                                        return parts[1].trim().charAt(0)
                                      }
                                      return 'N'
                                    })()}
                                  </span>
                                </div>
                                <h3 className={styles['companys-card__name']}>{company.name}</h3>
                              </div>
                              <div className={styles['companys-card__bottom']}>
                                <span className={styles['companys-card__inn']}>
                                  {t('inn')}: {company.inn}
                                </span>
                                <span className={styles['companys-card__practice']}>
                                  {t('experience')}: {company.ageInYears} {t('years', {count: company.ageInYears})}
                                </span>
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
