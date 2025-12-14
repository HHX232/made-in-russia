import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useEffect} from 'react'
import ServiceLatestViews from './latestViews.service'
import {useActions} from '@/hooks/useActions'
import {Product} from '@/services/products/product.types'

// Query keys
export const latestViewsKeys = {
  all: ['latestViews'] as const,
  byIds: (ids: number[], locale: string) => [...latestViewsKeys.all, 'byIds', ids, locale] as const
}

// Hook для получения товаров по ID из localStorage
export const useLatestViewsByIds = (ids: number[], locale: string) => {
  const {setLatestViews} = useActions()

  const query = useQuery({
    queryKey: latestViewsKeys.byIds(ids, locale),
    queryFn: () => ServiceLatestViews.getProductsByIds(ids, locale),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2
  })

  useEffect(() => {
    if (query.data) {
      const orderedProducts = ids
        .map((id) => query.data.find((product) => product.id === id))
        .filter((product): product is Product => product !== undefined)

      setLatestViews(orderedProducts)
    }
  }, [query.data, ids, setLatestViews])

  return query
}

// Hook для инвалидации кэша при изменении товара
export const useInvalidateLatestViews = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({queryKey: latestViewsKeys.all})
  }
}
