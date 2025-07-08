import {axiosClassic} from '@/api/api.interceptor'

export interface Category {
  id: number
  slug: string
  name: string
  imageUrl?: string
  children: Category[]
  creationDate: string
  lastModificationDate: string
}

export type CategoriesResponse = Category[]

const cleanSlug = (slug: string): string => {
  return slug.replace(/^l\d+_/, '')
}

const cleanCategorySlug = (category: Category): Category => {
  return {
    ...category,
    slug: cleanSlug(category.slug),
    children: category.children.map(cleanCategorySlug)
  }
}

const CategoriesService = {
  async getAll(currentLang: string): Promise<Category[]> {
    const response = await axiosClassic.get<CategoriesResponse>('/all-categories', {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return response.data.map(cleanCategorySlug)
  },

  async getById(id: number | string, currentLang: string): Promise<Category> {
    const {data} = await axiosClassic.get<Category>(`/categories/${id}`, {
      headers: {
        'Accept-Language': currentLang || 'en'
      }
    })
    return cleanCategorySlug(data)
  }
}

export default CategoriesService
