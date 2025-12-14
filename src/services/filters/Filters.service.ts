import {axiosClassic} from '@/api/api.interceptor'
import {DELIVERY, DeliveryMethod, Filter, FILTERS, FiltersResponse} from './filters.types'

const FiltersService = {
  async getAll({currentLang}: {currentLang: string}): Promise<FiltersResponse> {
    const response = await axiosClassic.get<FiltersResponse>(FILTERS, {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data
  },
  async getById(id: number | string, {currentLang}: {currentLang: string}): Promise<Filter> {
    const {data} = await axiosClassic.get<Filter>(`/categories/${id}`, {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return data
  },
  async getDeliveryMethodIds({currentLang}: {currentLang: string}): Promise<DeliveryMethod[]> {
    const result = await axiosClassic<DeliveryMethod[]>({
      url: DELIVERY,
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return result.data
  }
}

export default FiltersService
