/* eslint-disable @typescript-eslint/no-explicit-any */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {axiosClassic} from '@/api/api.interceptor'
import instance from '@/api/api.interceptor'
import {getAccessToken} from '@/services/auth/auth.helper'

export interface Category {
  id: number
  slug: string
  name: string
  title?: string
  label?: string
  description?: string
  metaDescription?: string
  imageUrl?: string
  okved?: string[]
  iconUrl?: string | null
  children: Category[]
  creationDate: string
  lastModificationDate: string
  okvedCategories: string[]
}

export interface EditingCategory {
  id?: number
  slug: string
  name: string
  title?: string
  label?: string
  description?: string
  metaDescription?: string
  imageUrl?: string
  iconUrl?: string | null
  children: Category[]
  parentId?: number | null
  image?: File
  icon?: File
  okvedCategories?: string[]
}

export interface CreateCategoryPayload {
  name: string
  title?: string
  label?: string
  description?: string
  metaDescription?: string
  slug: string
  parentId?: number | null
  nameTranslations: {
    en: string
    ru: string
    zh: string
    hi: string
  }
  titleTranslations?: {
    en: string
    ru: string
    zh: string
    hi: string
  }
  labelTranslations?: {
    en: string
    ru: string
    zh: string
    hi: string
  }
  descriptionTranslations?: {
    en: string
    ru: string
    zh: string
    hi: string
  }
  metaDescriptionTranslations?: {
    en: string
    ru: string
    zh: string
    hi: string
  }
  okvedCategories?: string[]
  image?: File | string
  icon?: File | string
  saveImage?: boolean
  saveIcon?: boolean
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {
  id: number
}

export type CategoriesResponse = Category[]
export type SupportedLanguage = 'ru' | 'en' | 'zh' | 'hi'

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
    iconUrl: category.iconUrl || null,
    title: category.title || '',
    label: category.label || '',
    description: category.description || '',
    metaDescription: category.metaDescription || '',
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
      title: payload.title || '',
      label: payload.label || '',
      description: payload.description || '',
      metaDescription: payload.metaDescription || '',
      slug: payload.slug.replace(/^(l[1-5]_)+/, ''),
      parentId: payload.parentId || null,
      nameTranslations: payload.nameTranslations,
      titleTranslations: payload.titleTranslations || {en: '', ru: '', zh: '', hi: ''},
      labelTranslations: payload.labelTranslations || {en: '', ru: '', zh: '', hi: ''},
      descriptionTranslations: payload.descriptionTranslations || {en: '', ru: '', zh: '', hi: ''},
      metaDescriptionTranslations: payload.metaDescriptionTranslations || {en: '', ru: '', zh: '', hi: ''},
      okvedCategories: payload.okvedCategories || []
    }

    const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
    formData.append('data', jsonBlob)

    if (payload.image && payload.image instanceof File) {
      formData.append('image', payload.image)
    }

    if (payload.icon && payload.icon instanceof File) {
      formData.append('icon', payload.icon)
    }

    // Формируем query параметры
    const queryParams = new URLSearchParams()
    if (payload.saveImage !== undefined) {
      queryParams.append('saveImage', String(payload.saveImage))
    }
    if (payload.saveIcon !== undefined) {
      queryParams.append('saveIcon', String(payload.saveIcon))
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
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
      title: payload.title || '',
      label: payload.label || '',
      description: payload.description || '',
      metaDescription: payload.metaDescription || '',
      slug: payload.slug.replace(/^(l[1-5]_)+/, ''),
      parentId: payload.parentId || null,
      nameTranslations: payload.nameTranslations,
      titleTranslations: payload.titleTranslations || {en: '', ru: '', zh: '', hi: ''},
      labelTranslations: payload.labelTranslations || {en: '', ru: '', zh: '', hi: ''},
      descriptionTranslations: payload.descriptionTranslations || {en: '', ru: '', zh: '', hi: ''},
      metaDescriptionTranslations: payload.metaDescriptionTranslations || {en: '', ru: '', zh: '', hi: ''},
      okvedCategories: payload.okvedCategories || []
    }
    console.log('то что пришло в функцию', payload, 'то что отправляем', dataPayload)

    const jsonBlob = new Blob([JSON.stringify(dataPayload)], {type: 'application/json'})
    formData.append('data', jsonBlob)

    if (payload.image && payload.image instanceof File) {
      formData.append('image', payload.image)
    } else {
      formData.append('image', null as any)
    }

    if (payload.icon && payload.icon instanceof File) {
      formData.append('icon', payload.icon)
    } else {
      formData.append('icon', null as any)
    }

    // Формируем query параметры
    const queryParams = new URLSearchParams()
    if (payload.saveImage !== undefined) {
      queryParams.append('saveImage', String(payload.saveImage))
    }
    if (payload.saveIcon !== undefined) {
      queryParams.append('saveIcon', String(payload.saveIcon))
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/categories/${payload.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
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
    staleTime: 25 * 60 * 1000, // 25 minutes
    gcTime: 35 * 60 * 1000 // 35 minutes
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
  const hiQuery = useCategories('hi')

  return {
    ru: ruQuery,
    en: enQuery,
    zh: zhQuery,
    hi: hiQuery,
    isLoading: ruQuery.isLoading || enQuery.isLoading || zhQuery.isLoading || hiQuery.isLoading,
    isError: ruQuery.isError || enQuery.isError || zhQuery.isError || hiQuery.isError,
    error: ruQuery.error || enQuery.error || zhQuery.error || hiQuery.error
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
