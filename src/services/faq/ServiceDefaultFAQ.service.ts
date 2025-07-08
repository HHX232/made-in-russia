import instance from '@/api/api.interceptor'

const ServiceDefaultFAQ = {
  async getFAQ(currentLang?: string) {
    const response = await instance.get<{question: string; answer: string}[]>('/faq', {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data
  }
}
export default ServiceDefaultFAQ
