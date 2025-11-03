import instance from '@/api/api.interceptor'
import {Product} from '@/services/products/product.types'

const ServiceFavorites = {
  async getFavorites(currentLang?: string) {
    const response = await instance.get<Product[]>('/me/favorite-products', {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data
  },

  async toggleFavorite(productId: number, currentLang?: string) {
    const response = await instance.put(
      `/me/favorite-products/${productId}`,
      {},
      {
        headers: {
          'Accept-Language': currentLang || 'en'
        }
      }
    )
    return response.data
  }
}

export default ServiceFavorites
