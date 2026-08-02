import axios from 'axios'
import {axiosClassic} from '@/api/api.interceptor'
import ICardFull, {PaginatedResponse, Review} from './card.types'
import {Product} from '../products/product.types'
import {getAccessTokenServer} from '../auth/auth.helper'
const cardService = {
  async getCardById(id: number | string, currentLang?: string, hasTranslations?: boolean) {
    const accessToken = await getAccessTokenServer()
    console.log('accessToken on server', accessToken)

    try {
      const res = await axiosClassic.get<Product>(
        `/products-summary/${id}${hasTranslations ? '?hasTranslations=true' : ''}`,
        {
          headers: {
            'Accept-Language': currentLang || 'en',
            Authorization: `Bearer ${accessToken}`
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
  },
  async getFullCardById(id: string | number, currentLang?: string, hasTranslations?: boolean) {
    const accessToken = await getAccessTokenServer()
    console.log('accessToken on server (getFullCardById)', accessToken)
    console.log(
      'FULL REQUEST URL (getFullCardById)',
      axiosClassic.defaults.baseURL + `/products/${id}${hasTranslations ? '?hasTranslations=true' : ''}`
    )
    try {
      const res = await axiosClassic.get<ICardFull>(
        `/products/${id}${hasTranslations ? '?hasTranslations=true' : ''}`,
        {
          headers: {
            'Accept-Language': currentLang || 'en',
            'x-locale': currentLang || 'en',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      console.log('cardData in F getFullCardById', res.data)
      return {
        data: res.data,
        isLoading: false,
        isError: false,
        error: null
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          'getFullCardById failed:',
          'status =',
          err.response?.status,
          'body =',
          err.response?.data,
          'hadAccessToken =',
          Boolean(accessToken)
        )
      }
      return {
        data: null,
        isLoading: false,
        isError: true,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  },
  async getCommentsByCardId(id: string | number, page: number = 1, size: number = 10, currentLang?: string) {
    const accessToken = await getAccessTokenServer()
    console.log('accessToken on server', accessToken)
    try {
      const res = await axiosClassic.get<PaginatedResponse<Review>>(
        `/products/${id}/reviews?page=${page}&size=${size}`,
        {
          headers: {
            'Accept-Language': currentLang || 'en',
            Authorization: `Bearer ${accessToken}`
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
