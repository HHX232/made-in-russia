import instance, {axiosClassic} from '@/api/api.interceptor'
import {PRODUCTS} from './product.types'
import {Product, ProductPageResponse} from './product.types'

export interface ProductQueryParams {
  page?: number
  size?: number
  sort?: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const ProductService = {
  async getAll(
    params: ProductQueryParams = {},
    specialRoute?: string | undefined,
    currentLang?: string
  ): Promise<ProductPageResponse> {
    // Устанавливаем значения по умолчанию
    const defaultParams = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      ...params
    }

    let data: ProductPageResponse

    if (specialRoute && specialRoute.length !== 0) {
      const response = await instance<ProductPageResponse>({
        url: specialRoute,
        method: 'GET',
        params: defaultParams,
        headers: {
          'Accept-Language': currentLang
        }
      })
      data = response.data
    } else {
      const response = await axiosClassic<ProductPageResponse>({
        url: PRODUCTS,
        method: 'GET',
        params: defaultParams,
        headers: {
          'Accept-Language': currentLang
        }
      })
      data = response.data
    }

    return data
  },

  async getById(productId: string | number, currentLang: string): Promise<Product> {
    const {data} = await axiosClassic<Product>({
      url: `${PRODUCTS}/${productId}`,
      method: 'GET',
      headers: {
        'Accept-Language': currentLang
      }
    })
    return data
  },

  async getByIds(productIds: number[], currentLang: string): Promise<Product[]> {
    const {data} = await axiosClassic<Product[]>({
      url: `${PRODUCTS}/ids`,
      method: 'GET',
      params: {
        ids: productIds.join(',')
      },
      headers: {
        'Accept-Language': currentLang
      }
    })
    return data
  }
}

export default ProductService
