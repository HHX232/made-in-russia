import {useEffect, useState} from 'react'
import {useLocale} from 'next-intl'
import {useActions} from '@/hooks/useActions'
import ServiceFavorites from '@/services/favorite/favorite.service'

export const useFavorites = () => {
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {setFavorites} = useActions()

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true)
        const favorites = await ServiceFavorites.getFavorites(locale)
        setFavorites(favorites)
        setError(null)
      } catch (err) {
        console.error('Failed to load favorites:', err)
        setError('Failed to load favorites')
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [locale, setFavorites])

  return {isLoading, error}
}
