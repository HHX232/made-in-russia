'use client'

import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import styles from './nprogress-provider.module.scss'

interface NProgressState {
  isVisible: boolean
  progress: number
}

class NProgressManager {
  private listeners: Set<(state: NProgressState) => void> = new Set()
  private state: NProgressState = {isVisible: false, progress: 0}
  private incrementTimer: NodeJS.Timeout | null = null
  private hideTimer: NodeJS.Timeout | null = null

  subscribe(listener: (state: NProgressState) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    // Используем requestAnimationFrame для оптимальной производительности
    requestAnimationFrame(() => {
      this.listeners.forEach((listener) => listener({...this.state}))
    })
  }

  start() {
    if (this.state.isVisible) return

    // Очищаем предыдущие таймеры
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    this.state = {isVisible: true, progress: 0.08}
    this.notify()

    // Быстрый автоинкремент для отзывчивости
    this.incrementTimer = setInterval(() => {
      if (this.state.progress < 0.85) {
        this.inc()
      }
    }, 150) // Сократили с 300 до 150мс
  }

  inc(amount?: number) {
    if (!this.state.isVisible) return

    const increment = amount || Math.random() * 0.15 + 0.05
    this.state.progress = Math.min(this.state.progress + increment, 0.9)
    this.notify()
  }

  set(progress: number) {
    if (!this.state.isVisible) return

    this.state.progress = Math.min(Math.max(progress, 0), 1)
    this.notify()
  }

  done() {
    if (!this.state.isVisible) return

    // Очищаем автоинкремент
    if (this.incrementTimer) {
      clearInterval(this.incrementTimer)
      this.incrementTimer = null
    }

    // Мгновенно устанавливаем 100%
    this.state.progress = 1
    this.notify()

    // Быстрое скрытие без задержки
    this.hideTimer = setTimeout(() => {
      this.state = {isVisible: false, progress: 0}
      this.notify()
    }, 50) // Сократили с 200 до 50мс
  }

  // Мгновенное скрытие для экстренных случаев
  hide() {
    if (this.incrementTimer) {
      clearInterval(this.incrementTimer)
      this.incrementTimer = null
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    this.state = {isVisible: false, progress: 0}
    this.notify()
  }

  isStarted() {
    return this.state.isVisible
  }
}

const nprogress = new NProgressManager()

// Компонент прогресс-бара
const NProgressBar = () => {
  const [state, setState] = useState<NProgressState>({isVisible: false, progress: 0})

  useEffect(() => {
    const unsubscribe = nprogress.subscribe(setState)
    return unsubscribe
  }, [])

  if (!state.isVisible) return null

  return (
    <div className={styles.nprogressContainer}>
      <div
        className={styles.nprogressBar}
        style={{
          transform: `translateX(${-100 + state.progress * 100}%)`
        }}
      >
        <div className={styles.nprogressPeg} />
      </div>
    </div>
  )
}

// Основной провайдер с оптимизированным отслеживанием
const NProgressProvider = () => {
  const pathname = usePathname()

  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement

      if (target.closest('button') || target.tagName === 'BUTTON') {
        return
      }
      const link = target.closest('a')

      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        try {
          const url = new URL(link.href)
          const currentUrl = new URL(window.location.href)

          if (
            url.origin === currentUrl.origin &&
            url.pathname !== currentUrl.pathname &&
            !link.target // Не обрабатываем ссылки с target="_blank"
          ) {
            nprogress.start()
          }
        } catch {}
      }
    }

    const handlePopState = () => {
      nprogress.start()
    }

    // Используем passive слушатели для лучшей производительности
    document.addEventListener('click', handleLinkClick, {capture: true, passive: true})
    window.addEventListener('popstate', handlePopState, {passive: true})

    return () => {
      document.removeEventListener('click', handleLinkClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    nprogress.done()
  }, [pathname])

  return <NProgressBar />
}

export default NProgressProvider

// Экспортируем методы для ручного управления
export const NProgressAPI = {
  start: () => nprogress.start(),
  done: () => nprogress.done(),
  hide: () => nprogress.hide(), // Новый метод для мгновенного скрытия
  inc: (amount?: number) => nprogress.inc(amount),
  set: (progress: number) => nprogress.set(progress),
  isStarted: () => nprogress.isStarted()
}
