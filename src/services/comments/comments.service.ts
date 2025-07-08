import instance from '@/api/api.interceptor'

// types/comments.types.ts
export interface Author {
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
}

export interface Media {
  id: number
  mediaType: 'image' | 'video'
  mimeType: string
  url: string
  altText: string
  creationDate: string
  lastModificationDate: string
}

export interface ProductReview {
  id: number
  author: Author
  text: string
  media: Media[]
  rating: number
  creationDate: string
  lastModificationDate: string
}

export interface ProductReviewsResponse {
  content: ProductReview[]
  page?: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
  pageable?: {
    offset: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    paged: boolean
    pageNumber: number
    pageSize: number
    unpaged: boolean
  }
  totalElements?: number
  totalPages?: number
  last?: boolean
  size?: number
  number?: number
  sort?: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements?: number
  first?: boolean
  empty?: boolean
}

// Структура ответа для specialRoute
export interface SpecialRouteResponse {
  page: ProductReviewsResponse
}

export interface GetProductReviewsParams {
  page?: number
  size?: number
  minRating?: number
  maxRating?: number
  specialRoute?: string
  currentLang?: string
}

const commentsService = {
  async getCommentsByMyProducts(params: GetProductReviewsParams = {}) {
    try {
      const {page = 0, size = 10, minRating, maxRating} = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (minRating !== undefined) {
        queryParams.append('minRating', minRating.toString())
      }

      if (maxRating !== undefined) {
        queryParams.append('maxRating', maxRating.toString())
      }

      if (params.specialRoute) {
        const response = await instance.get<SpecialRouteResponse>(
          `${params.specialRoute}/reviews?${queryParams.toString()}`,
          {
            headers: {
              'Accept-Language': params.currentLang || 'en'
            }
          }
        )
        console.log('Special route response in service:', response)
        return {
          data: response.data.page || response.data,
          error: null
        }
      } else {
        const response = await instance.get<ProductReviewsResponse>(`/me/product-reviews?${queryParams.toString()}`, {
          headers: {
            'Accept-Language': params.currentLang || 'en'
          }
        })

        return {
          data: response.data,
          error: null
        }
      }
    } catch (e) {
      console.error('Error fetching product reviews:', e)
      return {
        data: null,
        error: e
      }
    }
  }
}

export default commentsService
