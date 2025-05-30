// import {axiosClassic} from '@/api/api.interceptor'
// import {DELIVERY, DeliveryMethod, Filter, FILTERS, FiltersResponse} from './filters.types'

// const FiltersService = {
//   async getAll(): Promise<FiltersResponse> {
//     const response = await axiosClassic.get<FiltersResponse>(FILTERS)
//     return response.data
//   },
//   async getById(id: number | string): Promise<Filter> {
//     const {data} = await axiosClassic.get<Filter>(`/categories/${id}`)
//     return data
//   },
//   async getDeliveryMethodIds(): Promise<DeliveryMethod[]> {
//     const result = await axiosClassic<DeliveryMethod[]>({
//       url: DELIVERY
//     })
//     return result.data
//   }
// }

// export default FiltersService

// Тестовая версия из гпт

import {getAxiosClassic} from '@/api/api.interceptor'
import {DELIVERY, DeliveryMethod, Filter, FILTERS, FiltersResponse} from './filters.types'

const FiltersService = {
  async getAll(): Promise<FiltersResponse> {
    const response = await getAxiosClassic().get<FiltersResponse>(FILTERS)
    return response.data
  },
  async getById(id: number | string): Promise<Filter> {
    const {data} = await getAxiosClassic().get<Filter>(`/categories/${id}`)
    return data
  },
  async getDeliveryMethodIds(): Promise<DeliveryMethod[]> {
    const result = await getAxiosClassic()<DeliveryMethod[]>({
      url: DELIVERY
    })
    return result.data
  }
}

export default FiltersService
