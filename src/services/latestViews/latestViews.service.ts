import instance from '@/api/api.interceptor'
import {Product} from '@/services/products/product.types'

const ServiceLatestViews = {
  async getProductsByIds(ids: number[], currentLang?: string) {
    if (ids.length === 0) {
      return []
    }

    const response = await instance.get<Product[]>('/products-summary/ids', {
      params: {
        ids
      },
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data
  }
}

export default ServiceLatestViews
