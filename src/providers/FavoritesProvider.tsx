'use client'
import {useEffect, ReactNode} from 'react'
import {useLocale} from 'next-intl'
import {useActions} from '@/hooks/useActions'
import ServiceFavorites from '@/services/favorite/favorite.service'

interface FavoritesProviderProps {
  children: ReactNode
}

export default function FavoritesProvider({children}: FavoritesProviderProps) {
  const locale = useLocale()
  const {setFavorites} = useActions()

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      try {
        const favorites = await ServiceFavorites.getFavorites(locale)
        if (isMounted) {
          setFavorites(favorites)
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
        if (isMounted) {
          setFavorites([])
        }
      }
    }

    loadFavorites()

    return () => {
      isMounted = false
    }
  }, [locale, setFavorites])

  return <>{children}</>
}
