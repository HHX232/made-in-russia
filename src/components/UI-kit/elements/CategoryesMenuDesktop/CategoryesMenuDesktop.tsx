'use client'
import {FC, useState, useEffect, useRef} from 'react'
import styles from './CategoryesMenuDesktop.module.scss'
import {Category} from '@/services/categoryes/categoryes.service'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import Image from 'next/image'

interface ICategoryesMenuDesktopProps {
  categories: Category[] | undefined
  setCategoryListIsOpen: (value: boolean) => void
  isOpen?: boolean
  onToggle?: () => void
}

type MenuLevel = 'main' | 'subcategory' | 'subsubcategory'

interface BreadcrumbItem {
  name: string
  level: MenuLevel
}

const CategoryesMenuDesktop: FC<ICategoryesMenuDesktopProps> = ({categories, setCategoryListIsOpen, isOpen = true}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [menuLevel, setMenuLevel] = useState<MenuLevel>('main')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('CategoryMenu')

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name)
      setActiveSlug(categories[0].slug)
    }
  }, [categories, activeCategory])

  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth
      setIsMobile(width < 600)
      setIsTablet(width >= 600 && width < 992)
    }

    checkWidth()
    window.addEventListener('resize', checkWidth)

    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  useEffect(() => {
    if ((isMobile || isTablet) && isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement

        const isArrowClick =
          target.classList.contains('mobile_menu_item_arrow') ||
          target.closest('.mobile_menu_item_arrow') !== null ||
          target.className.includes('mobile_menu_item_arrow') ||
          target.classList.contains('back_button') ||
          target.closest('.back_button') !== null ||
          target.className.includes('back_button') ||
          target.closest('[class*="exp_catalog__cat_arrow"]') !== null

        const isSearchInput =
          target.closest('[class*="SearchInputUI"]') ||
          target.closest('[class*="search__box"]') ||
          target.closest('[class*="new_search_box"]') ||
          target.closest('input[type="text"]') ||
          target.closest('input[placeholder]') ||
          target.closest('button[aria-label="Search"]') ||
          target.closest('button[aria-label="Clear search"]')

        const isCatalogButton = target.closest('[id="catalog-btn"]') || target.closest('[class*="btn_catalog"]')

        if (menuRef.current && menuRef.current.contains(target)) {
          return
        }

        if (isArrowClick || isSearchInput || isCatalogButton) {
          return
        }

        handleCloseMenu()
      }

      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMobile, isTablet, isMenuOpen])

  useEffect(() => {
    if (!isMobile && !isTablet && isOpen !== undefined) {
      if (!isOpen) {
        // Menu closed
      }
    }
  }, [isOpen, isMobile, isTablet])

  const handleCategoryClick = (category: Category, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!category.children || category.children.length === 0) {
      window.location.href = `/categories/${category.slug}`
      return
    }
    setSelectedCategory(category)
    setMenuLevel('subcategory')
    setBreadcrumbs([{name: category.name, level: 'main'}])
  }

  const handleSubcategoryClick = (subcategory: Category, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!subcategory.children || subcategory.children.length === 0) {
      window.location.href = `/categories/${selectedCategory?.slug}/${subcategory.slug}`
      return
    }
    setSelectedSubcategory(subcategory)
    setMenuLevel('subsubcategory')
    setBreadcrumbs((prev) => [...prev, {name: subcategory.name, level: 'subcategory'}])
  }

  const handleBack = () => {
    if (menuLevel === 'subsubcategory') {
      setMenuLevel('subcategory')
      setSelectedSubcategory(null)
      setBreadcrumbs((prev) => prev.slice(0, -1))
    } else if (menuLevel === 'subcategory') {
      setMenuLevel('main')
      setSelectedCategory(null)
      setBreadcrumbs([])
    }
  }

  const handleCloseMenu = () => {
    if (isMobile || isTablet) {
      setIsMenuOpen(false)
      setMenuLevel('main')
      setSelectedCategory(null)
      setSelectedSubcategory(null)
      setBreadcrumbs([])
      setCategoryListIsOpen(false)
    } else {
      setCategoryListIsOpen(false)
    }
  }

  const handleCategoryHover = (categoryName: string, categorySlug: string) => {
    if (!isMobile && !isTablet) {
      setActiveCategory(categoryName)
      setActiveSlug(categorySlug)
    }
  }

  const getIconSize = () => {
    if (isMobile) return 20
    if (isTablet) return 20
    return 24
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={styles.exp_catalog__menu}>
        <p className={styles.no_categories}>{t('isEmptyAll')}</p>
      </div>
    )
  }

  // Мобильная и планшетная версия с уровнями
  if (isMobile || isTablet) {
    return (
      <div className={styles.mobile_menu} ref={menuRef}>
        <div className={styles.mobile_menu_header}>
          {menuLevel !== 'main' && (
            <button className={styles.back_button} onClick={handleBack}>
              {t('backButton')}
            </button>
          )}
          <div className={styles.breadcrumbs}>
            {menuLevel === 'main' && t('categoryTitle')}
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {index > 0 && ' / '}
                {crumb.name}
              </span>
            ))}
          </div>
          <div
            className={styles.close_button}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleCloseMenu()
            }}
          >
            ✕
          </div>
        </div>

        <ul className={styles.mobile_menu_list}>
          {menuLevel === 'main' &&
            categories?.map((category) => (
              <li key={category.id} className={styles.mobile_menu_item}>
                <Link
                  href={`/categories/${category.slug}`}
                  className={styles.mobile_menu_item_content}
                  onClick={() => handleCloseMenu()}
                >
                  {category.iconUrl && (
                    <Image
                      src={category.iconUrl}
                      alt={category.name}
                      width={getIconSize()}
                      height={getIconSize()}
                      className={styles.category_icon}
                    />
                  )}
                  <span>{category.name}</span>
                </Link>
                {category.children && category.children.length > 0 && (
                  <button
                    className={styles.mobile_menu_item_arrow}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryClick(category, e)
                    }}
                  >
                    →
                  </button>
                )}
              </li>
            ))}

          {menuLevel === 'subcategory' &&
            selectedCategory &&
            selectedCategory.children &&
            selectedCategory.children.map((subcategory) => (
              <li key={subcategory.id} className={styles.mobile_menu_item}>
                <Link
                  href={`/categories/${subcategory.slug}`}
                  className={styles.mobile_menu_item_content}
                  onClick={() => handleCloseMenu()}
                >
                  {subcategory.iconUrl && (
                    <Image
                      src={subcategory.iconUrl}
                      alt={subcategory.name}
                      width={getIconSize()}
                      height={getIconSize()}
                      className={styles.category_icon}
                    />
                  )}
                  <span>{subcategory.name}</span>
                </Link>
                {subcategory.children && subcategory.children.length > 0 && (
                  <button
                    className={styles.mobile_menu_item_arrow}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubcategoryClick(subcategory, e)
                    }}
                  >
                    →
                  </button>
                )}
              </li>
            ))}

          {menuLevel === 'subcategory' && (!selectedCategory?.children || selectedCategory.children.length === 0) && (
            <li className={styles.mobile_menu_item}>
              <span>{t('subCategoryEmpty')}</span>
            </li>
          )}

          {menuLevel === 'subsubcategory' &&
            selectedSubcategory &&
            selectedSubcategory.children &&
            selectedSubcategory.children.map((item) => (
              <li key={item.id} className={styles.mobile_menu_item}>
                <Link
                  href={`/categories/${item.slug}`}
                  className={styles.mobile_menu_item_full}
                  onClick={() => handleCloseMenu()}
                >
                  {item.iconUrl && (
                    <Image
                      src={item.iconUrl}
                      alt={item.name}
                      width={getIconSize()}
                      height={getIconSize()}
                      className={styles.category_icon}
                    />
                  )}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}

          {menuLevel === 'subsubcategory' &&
            (!selectedSubcategory?.children || selectedSubcategory.children.length === 0) && (
              <li className={styles.mobile_menu_item}>
                <span>{t('noElements')}</span>
              </li>
            )}
        </ul>
      </div>
    )
  }

  // Десктопная версия с hover
  if (isOpen === false) {
    return null
  }

  return (
    <div className={`${styles.exp_catalog__menu}`}>
      <nav className={`${styles.exp_catalog__sidebar}`}>
        <div className={`${styles.exp_catalog__catwrapper}`}>
          <ul className={`${styles.exp_catalog__cat}`}>
            {categories?.map((el) => {
              return (
                <li
                  className={`${styles.exp_catalog__cat_item} ${activeCategory === el.name ? styles.active : ''}`}
                  onMouseEnter={() => handleCategoryHover(el.name, el.slug)}
                  key={el.id}
                >
                  <Link href={`/categories/${el.slug}`} className={`${styles.exp_catalog__cat_link}`}>
                    {el.iconUrl && (
                      <Image src={el.iconUrl} alt={el.name} width={24} height={24} className={styles.category_icon} />
                    )}
                    <span>{el.name}</span>
                  </Link>
                  <span className={`${styles.exp_catalog__cat_arrow}`}></span>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <div className={`${styles.exp_catalog__content}`}>
        {activeCategory && activeSlug && (
          <div className={`${styles.exp_catalog__subcats} ${styles.active}`}>
            <div className={`${styles.exp_catalog__subcats_header}`}>
              <h2 className={`${styles.exp_catalog__subcats_title}`}>
                <Link href={`/categories/${activeSlug}`}>{activeCategory}</Link>
              </h2>
            </div>
            <ul className={`${styles.exp_catalog__subcats_list}`}>
              {categories
                ?.filter((el) => el.name === activeCategory)
                ?.map((el) => {
                  return el.children && el.children.length > 0 ? (
                    el.children.map((child) => {
                      return (
                        <li key={child.id}>
                          <Link href={`/categories/${child.slug}`} className={`${styles.exp_catalog__subcats_link}`}>
                            {child.iconUrl && (
                              <Image
                                src={child.iconUrl}
                                alt={child.name}
                                width={24}
                                height={24}
                                className={styles.subcategory_icon}
                              />
                            )}
                            {child.name}
                          </Link>
                        </li>
                      )
                    })
                  ) : (
                    <li key={`empty-${el.id}`} className={styles.empty_category}>
                      <p>{t('subCategoryEmpty')}</p>
                    </li>
                  )
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
export default CategoryesMenuDesktop
