import {getAccessToken} from '@/services/auth/auth.helper'
import axios from 'axios'
import {getContentType} from './api.helper'

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  headers: getContentType()
})
export const axiosClassic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  headers: getContentType()
})

instance.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (config.headers && accessToken !== null) {
    config.headers.Authorization = `Bearer ${accessToken || 'stasic smotri'}`
  }
  return config
})

// Код из гпт

let _instance: Axios.AxiosInstance | null = null
let _axiosClassic: Axios.AxiosInstance | null = null

const getApiUrl = () => {
  if (typeof window === 'undefined') {
    // Серверный режим (SSR)
    return process.env.NEXT_PUBLIC_API_URL || 'http://default-server-api.com'
  } else {
    // Клиентский режим
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      window['ENV' as keyof typeof window]?.NEXT_PUBLIC_API_URL ||
      'http://default-client-api.com'
    )
  }
}

const createAxiosInstance = () => {
  const baseURL = `${getApiUrl()}/api/v1`

  console.log('Creating axios instance with URL:', baseURL) // Для дебага

  return axios.create({
    baseURL,
    headers: {
      ...getContentType(),
      'Content-Type': 'application/json'
    }
  })
}

export const getInstance = () => {
  if (!_instance) {
    _instance = createAxiosInstance()
    _instance.interceptors.request.use((config) => {
      const accessToken = getAccessToken()
      if (config.headers && accessToken !== null) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    })
  }
  return _instance
}

export const getAxiosClassic = () => {
  if (!_axiosClassic) {
    _axiosClassic = createAxiosInstance()
  }
  return _axiosClassic
}

export default instance
