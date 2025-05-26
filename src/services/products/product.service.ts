import {axiosClassic} from '@/api/api.interceptor'
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
  async getAll(params: ProductQueryParams = {}): Promise<ProductPageResponse> {
    // Устанавливаем значения по умолчанию
    const defaultParams = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      ...params
    }

    const {data} = await axiosClassic<ProductPageResponse>({
      url: PRODUCTS,
      method: 'GET',
      params: defaultParams
    })
    return data
  },

  async getById(productId: string | number): Promise<Product> {
    const {data} = await axiosClassic<Product>({
      url: `${PRODUCTS}/${productId}`,
      method: 'GET'
    })
    return data
  }
}

export default ProductService
