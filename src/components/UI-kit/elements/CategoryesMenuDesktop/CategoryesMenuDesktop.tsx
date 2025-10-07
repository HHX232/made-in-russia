'use client'
import {FC, useState, useEffect, useRef} from 'react'
import styles from './CategoryesMenuDesktop.module.scss'
import {Category} from '@/services/categoryes/categoryes.service'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

interface ICategoryesMenuDesktopProps {
  categories: Category[] | undefined
  setCategoryListIsOpen: (value: boolean) => void
  isOpen?: boolean
  onToggle?: () => void
}

// const ValuesItem: FC<Category & {parentPath: string}> = ({children, name, slug, parentPath}) => {
//   return (
//     <div className={`${styles.subtitles__box__item}`}>
//       <Link href={`/categories/${parentPath}/${slug}`}>
//         <p className={`${styles.subtitles__box__item__title}`}>{name}</p>
//       </Link>
//     </div>
//   )
// }

type MenuLevel = 'main' | 'subcategory' | 'subsubcategory'

interface BreadcrumbItem {
  name: string
  level: MenuLevel
}

const CategoryesMenuDesktop: FC<ICategoryesMenuDesktopProps> = ({
  categories,
  setCategoryListIsOpen,
  isOpen = true
  // onToggle
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
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
      setIsMobile(window.innerWidth < 600)
    }

    checkWidth()
    window.addEventListener('resize', checkWidth)

    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  useEffect(() => {
    if (isMobile && isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement

        const isArrowClick =
          target.classList.contains('mobile_menu_item_arrow') ||
          target.closest('.mobile_menu_item_arrow') !== null ||
          target.className.includes('mobile_menu_item_arrow') ||
          target.classList.contains('back_button') ||
          target.closest('.back_button') !== null ||
          target.className.includes('back_button')

        if (menuRef.current && !menuRef.current.contains(target) && !isArrowClick) {
          handleCloseMenu()
        }
      }

      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)

      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobile, isMenuOpen])

  useEffect(() => {
    if (!isMobile && isOpen !== undefined) {
      if (!isOpen) {
        // Menu closed
      }
    }
  }, [isOpen, isMobile])

  const handleCategoryClick = (category: Category) => {
    if (!category.children || category.children.length === 0) {
      window.location.href = `/categories/${category.slug}`
      return
    }
    setSelectedCategory(category)
    setMenuLevel('subcategory')
    setBreadcrumbs([{name: category.name, level: 'main'}])
  }

  const handleSubcategoryClick = (subcategory: Category) => {
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
    if (isMobile) {
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
    if (!isMobile) {
      setActiveCategory(categoryName)
      setActiveSlug(categorySlug)
    }
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={styles.exp_catalog__menu}>
        <p className={styles.no_categories}>{t('isEmptyAll')}</p>
      </div>
    )
  }

  if (isMobile) {
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
                  <span>{category.name}</span>
                </Link>
                {category.children && category.children.length > 0 && (
                  <button
                    className={styles.mobile_menu_item_arrow}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryClick(category)
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
                  href={`/categories/${selectedCategory.slug}/${subcategory.slug}`}
                  className={styles.mobile_menu_item_content}
                  onClick={() => handleCloseMenu()}
                >
                  <span>{subcategory.name}</span>
                </Link>
                {subcategory.children && subcategory.children.length > 0 && (
                  <button
                    className={styles.mobile_menu_item_arrow}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubcategoryClick(subcategory)
                    }}
                  >
                    →
                  </button>
                )}
              </li>
            ))}

          {menuLevel === 'subcategory' && (!selectedCategory?.children || selectedCategory.children.length === 0) && (
            <li className={styles.mobile_menu_item}>
              <span>Нет подкатегорий</span>
            </li>
          )}

          {menuLevel === 'subsubcategory' &&
            selectedSubcategory &&
            selectedSubcategory.children &&
            selectedSubcategory.children.map((item) => (
              <li key={item.id} className={styles.mobile_menu_item}>
                <Link
                  href={`/categories/${selectedCategory?.slug}/${selectedSubcategory.slug}/${item.slug}`}
                  className={styles.mobile_menu_item_full}
                  onClick={() => handleCloseMenu()}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}

          {menuLevel === 'subsubcategory' &&
            (!selectedSubcategory?.children || selectedSubcategory.children.length === 0) && (
              <li className={styles.mobile_menu_item}>
                <span>Нет элементов</span>
              </li>
            )}
        </ul>
      </div>
    )
  }

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
                          <Link
                            href={`/categories/${el.slug}/${child.slug}`}
                            className={`${styles.exp_catalog__subcats_link}`}
                          >
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
