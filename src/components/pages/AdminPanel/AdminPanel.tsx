'use client'
import {FC, useEffect, useState} from 'react'
import styles from './AdminPanel.module.scss'
import AdminUsersPage from './AdminUsersPage/AdminUsersPage'
import {usePathname} from 'next/navigation'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import AdminTabBar from './AdminTabBar/AdminTabBar'
import AdminTranslatesPage from './AdminTranslatesPage/AdminTranslatesPage'
import AdminCards from './AdminCards/AdminCards'
import AdminCategoriesPage from './AdminCategoriesPage/AdminCategoriesPage'
import AdminAds from './AdminAds/AdminAds'
import AdminFAQPage from './AdminFAQPage/AdminFAQPage'
import AdminReviewsPage from './AdminReviewsPage/AdminReviewsPage'
import {Product} from '@/services/products/product.types'

export type TAdminTab = 'users' | 'categories' | 'cards' | 'ads' | 'FAQ' | 'translates'

const AdminPanel: FC<{initialProducts?: Product[]; hasMore?: boolean}> = ({initialProducts, hasMore = true}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<TAdminTab>()
  const pathname = usePathname()

  useEffect(() => {
    setActiveAdminTab(pathname.split('/').pop() as TAdminTab)
  }, [pathname])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTabChange = (tab: TAdminTab) => {
    setActiveAdminTab(tab)
  }

  const renderContent = () => {
    switch (activeAdminTab?.toLowerCase()) {
      case 'users':
        return <AdminUsersPage />
      case 'categories':
        return <AdminCategoriesPage />
      case 'cards':
        return <AdminCards initialProducts={initialProducts || []} hasMore={hasMore} />
      case 'ads':
        return <AdminAds />
      case 'translates':
        return <AdminTranslatesPage />
      case 'reviews':
        return <AdminReviewsPage />
      case 'faq':
        return <AdminFAQPage />
      default:
        return <p>Страница не найдена</p>
    }
  }

  return (
    <div>
      <Header />
      <div className={`${styles.content__inner} container`}>
        <div className={styles.inner}>
          <AdminTabBar />
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminPanel
