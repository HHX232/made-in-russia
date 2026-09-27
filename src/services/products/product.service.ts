import instance, {axiosClassic} from '@/api/api.interceptor'
import {PRODUCTS} from './product.types'
import {PageResponse, Product, ProductPageResponse} from './product.types'

export interface ProductQueryParams {
  page?: number
  size?: number
  sort?: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// Spring Boot 3.x по умолчанию кладёт метаданные пагинации во вложенный объект
// "page" ({size, number, totalElements, totalPages}) вместо плоских полей верхнего
// уровня, которые ожидает остальной код. Приводим ответ к старому плоскому формату.
interface RawPageMeta {
  size?: number
  number?: number
  totalElements?: number
  totalPages?: number
}

export const normalizePageResponse = <T extends Omit<PageResponse<unknown>, 'pageable' | 'sort'>>(
  raw: T & {page?: RawPageMeta}
): T => {
  const page = raw?.page

  if (!page) {
    return raw
  }

  const totalPages = page.totalPages ?? raw.totalPages ?? 0
  const number = page.number ?? raw.number ?? 0
  const content = raw.content ?? []

  return {
    ...raw,
    size: page.size ?? raw.size,
    number,
    totalElements: page.totalElements ?? raw.totalElements,
    totalPages,
    last: raw.last ?? number >= totalPages - 1,
    first: raw.first ?? number === 0,
    numberOfElements: raw.numberOfElements ?? content.length,
    empty: raw.empty ?? content.length === 0
  }
}

const ProductService = {
  async getAll(
    params: ProductQueryParams = {},
    specialRoute?: string | undefined,
    currentLang?: string,
    accessToken?: string
  ): Promise<ProductPageResponse> {
    // Устанавливаем значения по умолчанию
    const defaultParams = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      // creationDate: params.creationDate || 'asc',
      ...params
    }

    let data: ProductPageResponse

    if (specialRoute && specialRoute.length !== 0) {
      const response = await instance<ProductPageResponse>({
        url: specialRoute,
        method: 'GET',
        params: defaultParams,
        headers: {
          'Accept-Language': currentLang,
          'x-language': currentLang,
          Authorization: `Bearer ${accessToken || ''}`
        }
      })
      data = normalizePageResponse(response.data)
    } else {
      const response = await axiosClassic<ProductPageResponse>({
        url: PRODUCTS,
        method: 'GET',
        params: defaultParams,
        headers: {
          'Accept-Language': currentLang,
          'x-language': currentLang,
          Authorization: `Bearer ${accessToken || ''}`
        }
      })
      data = normalizePageResponse(response.data)
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
