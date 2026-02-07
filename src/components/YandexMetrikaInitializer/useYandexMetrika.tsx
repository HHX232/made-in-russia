/* eslint-disable @typescript-eslint/no-explicit-any */
import {YandexMetrikaHitOptions} from './YandexMetrikaInitializer.types'

declare const ym: (id: number, method: any, ...params: unknown[]) => void

const enabled = !!(process.env.NODE_ENV === 'production')

const useYandexMetrika = (id: number) => {
  const hit = (url?: string, options?: YandexMetrikaHitOptions) => {
    if (enabled) {
      ym(id, 'hit', url, options)
    } else {
      console.log(`%c[YandexMetrika](hit)`, `color: orange`, url)
    }
  }

  return {hit}
}

export default useYandexMetrika
