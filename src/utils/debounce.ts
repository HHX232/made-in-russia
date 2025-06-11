/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/debounce.ts

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// Альтернативная версия с возвратом Promise
export function debouncePromise<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null
  let resolveList: Array<(value: ReturnType<T>) => void> = []

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout)

      resolveList.push(resolve)

      timeout = setTimeout(() => {
        const result = func(...args)
        resolveList.forEach((res) => res(result))
        resolveList = []
      }, wait)
    })
  }
}

// Hook версия для React компонентов
import {useCallback, useRef} from 'react'

export function useDebounce<T extends (...args: any | any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeout = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeout.current) clearTimeout(timeout.current)

      timeout.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}
