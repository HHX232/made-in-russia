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

  if (!config.headers?.['Accept-Language']) {
    const currentHeaders = getContentType()
    // Use Object.assign or set individual headers instead of spread operator
    Object.assign(config.headers, currentHeaders)
  }

  return config
})

// Добавляем интерцептор для axiosClassic тоже
axiosClassic.interceptors.request.use((config) => {
  if (!config.headers?.['Accept-Language']) {
    const currentHeaders = getContentType()
    Object.assign(config.headers, currentHeaders)
  }

  return config
})

export default instance
