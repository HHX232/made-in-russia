import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {axiosClassic} from '@/api/api.interceptor'
import instance from '@/api/api.interceptor'
import {getAccessToken} from '@/services/auth/auth.helper'

export interface Category {
  id: number
  slug: string
  name: string
  imageUrl?: string
  children: Category[]
  creationDate: string
  lastModificationDate: string
  okvedCategories: string[]
}

export interface EditingCategory {
  id?: number
  slug: string
  name: string
  imageUrl?: string
  children: Category[]
  parentId?: number | null
  image?: File
  okvedCategories?: string[]
}

export interface CreateCategoryPayload {
  name: string
  slug: string
  parentId?: number | null
  nameTranslations: {
    en: string
    ru: string
    zh: string
  }
  okvedCategories?: string[]
  image?: File
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {
  id: number
}

export type CategoriesResponse = Category[]
export type SupportedLanguage = 'ru' | 'en' | 'zh'

// Query Keys
export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  list: (lang: SupportedLanguage) => [...categoriesKeys.lists(), lang] as const,
  details: () => [...categoriesKeys.all, 'detail'] as const,
  detail: (id: number | string, lang: SupportedLanguage) => [...categoriesKeys.details(), id, lang] as const
}

// Helper functions
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

// API Service
const CategoriesAPI = {
  async getAll(currentLang: string): Promise<Category[]> {
    const response = await axiosClassic.get<CategoriesResponse>('/all-categories', {
      headers: {
        'Accept-Language': currentLang || 'en',
        'x-language': currentLang || 'en'
      }
    })
    return response.data.map(cleanCategorySlug)
  },

  async getById(id: number | string, currentLang: string): Promise<Category> {
    const {data} = await axiosClassic.get<Category>(`/categories/${id}`, {
      headers: {
        'Accept-Language': currentLang || 'en',
        'x-language': currentLang || 'en'
      }
    })
    console.log('data category:', data)
    return cleanCategorySlug(data)
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Ошибка авторизации, пожалуйста, войдите снова')
    }

    const formData = new FormData()

    const dataPayload = {
      name: payload.name,
      slug: payload.slug.replace(/^(l[1-5]_)+/, ''),
      parentId: payload.parentId || null,
      nameTranslations: payload.nameTranslations,
      okvedCategories: payload.okvedCategories || []
    }

    const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
    formData.append('data', jsonBlob)

    if (payload.image) {
      formData.append('image', payload.image)
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ошибка ${response.status}: ${errorText}`)
    }

    return response.json()
  },

  async update(payload: UpdateCategoryPayload): Promise<Category> {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Ошибка авторизации, пожалуйста, войдите снова')
    }

    const formData = new FormData()

    const dataPayload = {
      name: payload.name,
      slug: payload.slug.replace(/^(l[1-5]_)+/, ''),
      parentId: payload.parentId || null,
      nameTranslations: payload.nameTranslations,
      okvedCategories: payload.okvedCategories || []
    }

    const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
    formData.append('data', jsonBlob)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData.append('image', payload?.image || (null as any))

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/categories/${payload.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ошибка ${response.status}: ${errorText}`)
    }

    return response.json()
  },

  async delete(id: number): Promise<void> {
    await instance.delete(`/categories/${id}`)
  }
}

// React Query Hooks
export const useCategories = (lang: SupportedLanguage) => {
  return useQuery({
    queryKey: categoriesKeys.list(lang),
    queryFn: () => CategoriesAPI.getAll(lang),
    staleTime: 25 * 60 * 1000, // 5 minutes
    gcTime: 35 * 60 * 1000 // 10 minutes
  })
}

export const useCategory = (id: number | string, lang: SupportedLanguage) => {
  return useQuery({
    queryKey: categoriesKeys.detail(id, lang),
    queryFn: () => CategoriesAPI.getById(id, lang),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: CategoriesAPI.create,
    onSuccess: () => {
      // Invalidate all categories lists
      queryClient.invalidateQueries({queryKey: categoriesKeys.lists()})
    },
    onError: (error) => {
      console.error('Error creating category:', error)
    }
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: CategoriesAPI.update,
    onSuccess: () => {
      // Invalidate all categories lists
      queryClient.invalidateQueries({queryKey: categoriesKeys.lists()})
      // Invalidate specific category details for all languages
      queryClient.invalidateQueries({queryKey: categoriesKeys.details()})
    },
    onError: (error) => {
      console.error('Error updating category:', error)
    }
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: CategoriesAPI.delete,
    onSuccess: () => {
      // Invalidate all categories data
      queryClient.invalidateQueries({queryKey: categoriesKeys.all})
    },
    onError: (error) => {
      console.error('Error deleting category:', error)
    }
  })
}

// Utility hooks for multiple languages
export const useAllCategoriesLanguages = () => {
  const ruQuery = useCategories('ru')
  const enQuery = useCategories('en')
  const zhQuery = useCategories('zh')

  return {
    ru: ruQuery,
    en: enQuery,
    zh: zhQuery,
    isLoading: ruQuery.isLoading || enQuery.isLoading || zhQuery.isLoading,
    isError: ruQuery.isError || enQuery.isError || zhQuery.isError,
    error: ruQuery.error || enQuery.error || zhQuery.error
  }
}

// Prefetch utility
export const usePrefetchCategories = () => {
  const queryClient = useQueryClient()

  const prefetchCategories = (lang: SupportedLanguage) => {
    queryClient.prefetchQuery({
      queryKey: categoriesKeys.list(lang),
      queryFn: () => CategoriesAPI.getAll(lang),
      staleTime: 5 * 60 * 1000
    })
  }

  const prefetchCategory = (id: number | string, lang: SupportedLanguage) => {
    queryClient.prefetchQuery({
      queryKey: categoriesKeys.detail(id, lang),
      queryFn: () => CategoriesAPI.getById(id, lang),
      staleTime: 5 * 60 * 1000
    })
  }

  return {prefetchCategories, prefetchCategory}
}

export default CategoriesAPI
