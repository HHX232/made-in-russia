import {getAccessToken} from '@/services/auth/auth.helper'
import axios from 'axios'
import {getContentType} from './api.helper'

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL_SECOND + '/api/v1',
  headers: getContentType()
})

export const axiosClassic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL_SECOND + '/api/v1',
  headers: getContentType()
})

instance.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (config.headers && accessToken !== null) {
    config.headers.Authorization = `Bearer ${accessToken || 'stasic smotri'}`
  }

  const currentHeaders = getContentType()
  config.headers['Accept-Language'] = currentHeaders['Accept-Language']

  return config
})

// Добавляем интерцептор для axiosClassic тоже
axiosClassic.interceptors.request.use((config) => {
  // Всегда обновляем Accept-Language на основе текущего языка
  const currentHeaders = getContentType()
  config.headers['Accept-Language'] = currentHeaders['Accept-Language']

  return config
})

export default instance
