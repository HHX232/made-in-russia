// breadCrumbs.tsx
'use client'

import {usePathname} from 'next/navigation'
import {useTranslations} from 'next-intl'
import Link from 'next/link'

import styles from './Breadcrumbs.module.scss'

interface BreadCrumb {
  title: string
  link: string
}

interface BreadCrumbsProps {
  customItems?: BreadCrumb[]
  className?: string
}

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({customItems, className = ''}) => {
  const pathname = usePathname()
  const t = useTranslations('breadCrumbs')

  // Список ключей, для которых есть переводы
  const getTranslationKeys = () => {
    // Можно также получить из конфига или сделать проверку существования ключа
    const commonKeys = [
      'home',
      'products',
      'catalog',
      'card',
      'category',

      'about',
      'contacts',
      'blog',
      'news',
      'services',
      'electronics',
      'smartphones',
      'categories',
      'profile',
      'settings',
      'orders',
      'cart',
      'wishlist',
      'account'
    ]
    return new Set(commonKeys)
  }

  // Генерация крошек из URL
  const generateBreadCrumbs = (): BreadCrumb[] => {
    const pathSegments = pathname.split('/').filter(Boolean)

    // Убираем локаль из первого сегмента если есть (ru, en, etc)
    const cleanSegments = pathSegments.filter((segment) => !['ru', 'en', 'uk', 'de', 'fr', 'es'].includes(segment))

    const breadcrumbs: BreadCrumb[] = [{title: t('home'), link: '/'}]

    const translationKeys = getTranslationKeys()
    let currentPath = ''

    cleanSegments.forEach((segment) => {
      currentPath += `/${segment}`

      // Проверяем, есть ли перевод для этого сегмента
      let title: string
      if (translationKeys.has(segment)) {
        try {
          title = t(segment)
        } catch {
          title = segment
        }
      } else {
        // Используем сегмент как есть, без форматирования
        title = segment
      }

      breadcrumbs.push({
        title,
        link: currentPath
      })
    })

    return breadcrumbs
  }

  // Обработка кастомных элементов с переводами
  const processCustomItems = (items: BreadCrumb[]): BreadCrumb[] => {
    const translationKeys = getTranslationKeys()

    return items.map((item) => {
      // Извлекаем ключ из title для проверки перевода
      const titleKey = item.title.toLowerCase()

      if (translationKeys.has(titleKey)) {
        try {
          return {
            ...item,
            title: t(titleKey)
          }
        } catch {
          return item
        }
      }

      return item
    })
  }

  const breadcrumbs = customItems ? processCustomItems(customItems) : generateBreadCrumbs()

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className={`${styles.breadcrumbs} ${className}`} aria-label='Breadcrumb'>
      <ol className={styles.breadcrumbsList}>
        {breadcrumbs.map((crumb, index) => (
          <li key={`${crumb.link} ${index}`} className={styles.breadcrumbsItem}>
            {index < breadcrumbs.length - 1 ? (
              <>
                <Link href={crumb.link} className={styles.breadcrumbsLink} aria-label={`Navigate to ${crumb.title}`}>
                  {crumb.title}
                </Link>
                <span className={styles.breadcrumbsSeparator} aria-hidden='true'>
                  /
                </span>
              </>
            ) : (
              <span style={{color: '#6b7280'}} className={styles.breadcrumbsCurrent} aria-current='page'>
                {crumb.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default BreadCrumbs
