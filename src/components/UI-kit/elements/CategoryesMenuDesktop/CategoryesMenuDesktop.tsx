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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ValuesItem: FC<Category & {parentPath: string}> = ({children, name, slug, parentPath}) => {
  return (
    <div className={`${styles.subtitles__box__item}`}>
      <Link href={`/categories/${parentPath}/${slug}`}>
        <p className={`${styles.subtitles__box__item__title}`}>{name}</p>
      </Link>
    </div>
  )
}

type MenuLevel = 'main' | 'subcategory' | 'subsubcategory'

interface BreadcrumbItem {
  name: string
  level: MenuLevel
}

const CategoryesMenuDesktop: FC<ICategoryesMenuDesktopProps> = ({
  categories,
  setCategoryListIsOpen,
  isOpen = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggle
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

  // Инициализация первой категории при загрузке
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

  // Обработчик клика вне меню для мобильных устройств
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement

        // Проверяем, что клик НЕ по стрелочке
        const isArrowClick =
          target.classList.contains('mobile_menu_item_arrow') ||
          target.closest('.mobile_menu_item_arrow') !== null ||
          target.className.includes('mobile_menu_item_arrow') ||
          target.classList.contains('back_button') ||
          target.closest('.back_button') !== null ||
          target.className.includes('back_button')

        console.log('isArrowClick:', isArrowClick, 'target classes:', target.className)

        if (menuRef.current && !menuRef.current.contains(target) && !isArrowClick) {
          handleCloseMenu()
        }
      }

      // Добавляем небольшую задержку чтобы избежать конфликта с открытием меню
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)

      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobile, isMenuOpen])

  // Обработчик для десктопа - реагируем на изменение isOpen
  useEffect(() => {
    if (!isMobile && isOpen !== undefined) {
      // Если меню закрывается извне, сбрасываем активную категорию
      if (!isOpen) {
        // Можно оставить последнюю выбранную категорию
        // или сбросить на первую при следующем открытии
      }
    }
  }, [isOpen, isMobile])

  const handleCategoryClick = (category: Category) => {
    // Если у категории нет детей, переходим по ссылке
    if (!category.children || category.children.length === 0) {
      window.location.href = `/categories/${category.slug}`
      return
    }
    setSelectedCategory(category)
    setMenuLevel('subcategory')
    console.log('go to subcategory')
    console.log('selectedCategory', selectedCategory, 'category', category)
    setBreadcrumbs([{name: category.name, level: 'main'}])
  }

  const handleSubcategoryClick = (subcategory: Category) => {
    // Если у подкатегории нет детей, переходим по ссылке
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
      // Задержка для плавной анимации закрытия
    } else {
      setCategoryListIsOpen(false)
    }
  }

  // const handleOpenMenu = () => {
  //   setIsMenuOpen(true)
  // }

  // Hover handlers для десктопа
  const handleCategoryHover = (categoryName: string, categorySlug: string) => {
    if (!isMobile) {
      setActiveCategory(categoryName)
      setActiveSlug(categorySlug)
    }
  }

  // Проверка наличия категорий
  if (!categories || categories.length === 0) {
    return (
      <div className={styles.menu__box}>
        <p className={styles.no_categories}>{t('isEmptyAll')}</p>
      </div>
    )
  }

  // Мобильная версия
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
                <button
                  className={styles.mobile_menu_item_arrow}
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Clicked category:', category.name, 'Children:', category.children)
                    handleCategoryClick(category)
                  }}
                >
                  →
                </button>
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
                <button
                  className={styles.mobile_menu_item_arrow}
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Clicked subcategory:', subcategory.name, 'Children:', subcategory.children)
                    handleSubcategoryClick(subcategory)
                  }}
                >
                  →
                </button>
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
    <div className={`${styles.menu__box}`}>
      <ul id='cy-category-list-box' className={`${styles.titles__box}`}>
        {categories?.map((el) => {
          return (
            <li
              className={`${styles.titles__box__item} ${activeCategory === el.name ? styles.titles__box__item__active : ''}`}
              onMouseEnter={() => handleCategoryHover(el.name, el.slug)}
              key={el.id}
            >
              <Link
                id='cy-category-list-item-title'
                href={`/categories/${el.slug}`}
                style={{width: '100%'}}
                onClick={() => {
                  // Если у категории есть дети, предотвращаем переход по ссылке при клике
                  if (el.children && el.children.length > 0) {
                    // e.preventDefault()
                    handleCategoryHover(el.name, el.slug)
                  }
                }}
              >
                <div style={{width: '100%'}}>{el.name}</div>
              </Link>
            </li>
          )
        })}
      </ul>
      {activeCategory && activeSlug && (
        <span className={`${styles.span__subtitles__box}`}>
          <Link href={`/categories/${activeSlug}`}>
            <div className={`${styles.subtitles__title}`}>{activeCategory}</div>
          </Link>
          <ul id='cy-subcategory-list-box' className={`${styles.subtitles__box}`}>
            {categories
              ?.filter((el) => el.name === activeCategory)
              ?.map((el) => {
                return el.children && el.children.length > 0 ? (
                  el.children
                    .slice()
                    .sort((a, b) => a.name.length - b.name.length)
                    .map((child) => {
                      return (
                        <li id='cy-subcategory-list-item' key={child.id}>
                          <ValuesItem key={child.id} {...child} parentPath={el.slug} />
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
        </span>
      )}
    </div>
  )
}
export default CategoryesMenuDesktop
