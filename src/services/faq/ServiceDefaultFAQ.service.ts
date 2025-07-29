import instance from '@/api/api.interceptor'

export interface FAQ {
  id: string
  question: string
  answer: string
  creationDate?: string
  lastModificationDate?: string
}

export interface CreateFAQRequest {
  question: string
  answer: string
}

export interface UpdateFAQRequest {
  id: string
  question: string
  answer: string
}

const ServiceDefaultFAQ = {
  async getFAQ(currentLang?: string) {
    const response = await instance.get<FAQ[]>('/faq', {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data
  },

  async createFAQ(data: CreateFAQRequest, currentLang?: string) {
    const response = await instance.post<FAQ>('/faq', data, {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data
  },

  async updateFAQ(data: UpdateFAQRequest, currentLang?: string) {
    const response = await instance.put<FAQ>(
      `/faq/${data.id}`,
      {
        question: data.question,
        answer: data.answer
      },
      {
        headers: {
          'Accept-Language': currentLang || 'en'
        }
      }
    )
    return response.data
  },

  async deleteFAQ(id: string, currentLang?: string) {
    const response = await instance.delete(`/faq/${id}`, {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data
  }
}

export default ServiceDefaultFAQ
