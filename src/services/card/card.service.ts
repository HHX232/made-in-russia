import {axiosClassic} from '@/api/api.interceptor'
import ICardFull from './card.types'
import {Product} from '../products/product.types'

const cardService = {
  async getCardById(id: number | string) {
    try {
      const res = await axiosClassic.get<ICardFull | Product>(`/products-summary/${id}`)
      return {
        data: res.data,
        isLoading: false,
        isError: false,
        error: null
      }
    } catch (err) {
      return {
        data: null,
        isLoading: false,
        isError: true,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }
}

export default cardService
