import {axiosClassic} from '@/api/api.interceptor'
import ICardFull, {PaginatedResponse, Review} from './card.types'
import {Product} from '../products/product.types'
const cardService = {
  async getCardById(id: number | string, currentLang?: string) {
    try {
      const res = await axiosClassic.get<Product>(`/products-summary/${id}`, {
        headers: {
          'Accept-Language': currentLang || 'en'
        }
      })
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
  async getFullCardById(id: string | number, currentLang?: string) {
    try {
      const res = await axiosClassic.get<ICardFull>(`/products/${id}`, {
        headers: {
          'Accept-Language': currentLang || 'en'
        }
      })
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
  async getCommentsByCardId(id: string | number, page: number = 1, size: number = 10, currentLang?: string) {
    try {
      const res = await axiosClassic.get<PaginatedResponse<Review>>(
        `/products/${id}/reviews?page=${page}&size=${size}`,
        {
          headers: {
            'Accept-Language': currentLang || 'en'
          }
        }
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
