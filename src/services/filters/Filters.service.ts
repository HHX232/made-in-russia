import {axiosClassic} from '@/api/api.interceptor'
import {DELIVERY, DeliveryMethod, Filter, FILTERS, FiltersResponse} from './filters.types'
import axios from 'axios'

const FiltersService = {
  async getAll(): Promise<FiltersResponse> {
    const response = await axiosClassic.get<FiltersResponse>(FILTERS)
    return response.data
  },
  async getById(id: number | string): Promise<Filter> {
    console.dir(axiosClassic)
    const {data} = await axios.get<Filter>(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`)
    return data
  },
  async getDeliveryMethodIds(): Promise<DeliveryMethod[]> {
    const result = await axiosClassic<DeliveryMethod[]>({
      url: DELIVERY
    })
    return result.data
  }
}

export default FiltersService
