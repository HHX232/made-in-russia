'use client'
import {Category} from '@/services/categoryes/categoryes.service'
import style from './MainCategoryPage.module.scss'
import {useTranslations} from 'next-intl'

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

  if (!categories || categories?.length === 0) {
    return (
      <div className={style.container}>
        <div className={style.loading}>{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1 className={style.title}>{t('title')}</h1>
        <p className={style.subtitle}>{t('subtitle')}</p>
      </div>

      <div className={style.categoriesGrid}>
        {topLevelCategories.map((category: Category) => (
          <div key={category.id} className={style.categoryCard}>
            <a href={`/categories/${normalizeSlug(category.slug)}`} className={style.categoryLink}>
              {category.imageUrl && (
                <div className={style.categoryImage}>
                  <img src={category.imageUrl} alt={category.name} loading='lazy' />
                </div>
              )}

              <div className={style.categoryContent}>
                <h3 className={style.categoryName}>{category.name}</h3>

                {category.children && category.children.length > 0 && (
                  <div className={style.subcategoriesInfo}>
                    <span className={style.subcategoriesCount}>
                      {t('subcategoriesCount', {count: category.children.length})}
                    </span>
                  </div>
                )}
              </div>

              <div className={style.categoryArrow}>
                <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                  <path
                    d='M6 4l4 4-4 4'
                    stroke='currentColor'
                    strokeWidth='2'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
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
  )
}

export default MainCategoryPage
