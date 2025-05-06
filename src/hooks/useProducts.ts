import ProductService, {ProductQueryParams} from '@/services/products/product.service'
import {ProductPageResponse} from '@/services/products/product.types'
import {useQuery} from '@tanstack/react-query'

export const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery<ProductPageResponse>({
    queryKey: ['products', params],
    queryFn: () => ProductService.getAll(params),
    placeholderData: (previousData) => previousData ?? undefined
  })
}
