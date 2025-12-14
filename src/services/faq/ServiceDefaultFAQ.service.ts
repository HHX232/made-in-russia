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
  questionTranslations?: {ru: string; en: string; zh: string; hi: string}
  answerTranslations?: {ru: string; en: string; zh: string; hi: string}
}

const ServiceDefaultFAQ = {
  async getFAQ(currentLang?: string, params?: {hasTranslations?: boolean}) {
    const response = await instance.get<FAQ[]>('/faq', {
      headers: {
        'Accept-Language': currentLang || 'en'
      },
      params
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
        answer: data.answer,
        questionTranslations: data?.questionTranslations || {
          ru: currentLang === 'ru' ? data.question : '',
          en: currentLang === 'en' ? data.question : '',
          zh: currentLang === 'zh' ? data.question : '',
          hi: currentLang === 'hi' ? data.question : ''
        },
        answerTranslations: data?.answerTranslations || {
          ru: currentLang === 'ru' ? data.answer : '',
          en: currentLang === 'en' ? data.answer : '',
          zh: currentLang === 'zh' ? data.answer : '',
          hi: currentLang === 'hi' ? data.answer : ''
        }
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
