import {axiosClassic} from '@/api/api.interceptor'
import ICardFull, {PaginatedResponse, Review} from './card.types'
import {Product} from '../products/product.types'

const cardService = {
  async getCardById(id: number | string) {
    try {
      const res = await axiosClassic.get<Product>(`/products-summary/${id}`)
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
  },
  async getFullCardById(id: string | number) {
    try {
      const res = await axiosClassic.get<ICardFull>(`/products/${id}`)
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
  },
  async getCommentsByCardId(id: string | number, page: number = 1, size: number = 10) {
    try {
      const res = await axiosClassic.get<PaginatedResponse<Review>>(
        `/products-summary/${id}/reviews?page=${page}&size=${size}&minRating=1&maxRating=5`
      )
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
