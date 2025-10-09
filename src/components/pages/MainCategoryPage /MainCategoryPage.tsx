'use client'
import {Category} from '@/services/categoryes/categoryes.service'
import style from './MainCategoryPage.module.scss'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import {useEffect} from 'react'

interface MainCategoryPageProps {
  categories?: Category[]
}

const MainCategoryPage = ({categories}: MainCategoryPageProps) => {
  const topLevelCategories =
    categories?.filter((category: Category) => !category.slug.includes('_') || category.slug.startsWith('l1_')) || []

  const t = useTranslations('mainCategory')
  const normalizeSlug = (slug: string): string => {
    return slug.replace(/^l\d+_/, '')
  }

  useEffect(() => {
    console.log('categories props', categories)
  }, [categories])

  if (!categories || categories?.length === 0) {
    return (
      <div className={style.container}>
        <div className={style.loading}>{t('loading')}</div>
      </div>
    )
  }

  return (
    <main className={style.catalog}>
      {/* <div className={style.container}>
        <nav className={style.breadcrumbs} aria-label='Breadcrumb'>
          <ul className={style.breadcrumbsList}>
            <li>
              <Link href='/'>{t('home')}</Link>
              <span className={style.breadSep}>/</span>
            </li>
            <li>
              <span>{t('title')}</span>
            </li>
          </ul>
        </nav>
      </div> */}

      <section className={style.categorys}>
        <h2 className={style.visuallyHidden}>{t('title')}</h2>
        <div className={'container'}>
          {/* Заголовок секции */}
          <div className={style.sectionHeader}>
            <div className={style.sectionHeaderTitle}>{t('title')}</div>
          </div>

          <div className={style.categoriesGrid}>
            {topLevelCategories.map((category: Category) => (
              <div key={category.id} className={style.gridCol}>
                <a href={`/categories/${normalizeSlug(category.slug)}`} className={style.categorysCard}>
                  <h3 className={style.categorysCardTitle}>{category.name}</h3>
                  {category.imageUrl && (
                    <div className={style.categorysCardImage}>
                      <Image width={500} height={300} src={category.imageUrl} alt={category.name} loading='lazy' />
                    </div>
                  )}
                </a>
              </div>
            ))}
          </div>

          {topLevelCategories.length === 0 && (
            <div className={style.emptyState}>
              <p>{t('empty')}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default MainCategoryPage
