'use client'
import {useEffect, useState, ReactNode} from 'react'
import {useLocale} from 'next-intl'
import {useLatestViewsByIds} from '@/services/latestViews/latestViews.queries'
import {loadIdsFromLocalStorage} from '@/store/LatestViews/LatestViews.slice'

interface LatestViewsProviderProps {
  children: ReactNode
}

export default function LatestViewsProvider({children}: LatestViewsProviderProps) {
  const locale = useLocale()
  const [ids, setIds] = useState<number[]>([])

  // Загружаем ID из localStorage при монтировании и при изменении языка
  useEffect(() => {
    const loadedIds = loadIdsFromLocalStorage()
    setIds(loadedIds)
  }, [locale])

  // Используем TanStack Query для загрузки полных данных товаров по ID
  // Синхронизация с Redux происходит автоматически через onSuccess в useLatestViewsByIds
  const {isError} = useLatestViewsByIds(ids, locale)

  useEffect(() => {
    if (isError) {
      console.error('Failed to load latest views products')
    }
  }, [isError])

  return <>{children}</>
}
