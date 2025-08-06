'use client'

import {useEffect} from 'react'

export default function ClientStyleLoader() {
  useEffect(() => {
    // Загружаем некритичные стили после загрузки страницы
    const loadStyles = async () => {
      // Динамически импортируем стили
      await Promise.all([
        import('react-loading-skeleton/dist/skeleton.css'),
        import('@/components/UI-kit/loaders/nprogress-provider.scss')
      ])
    }

    // Загружаем стили после того, как страница полностью загрузилась
    if (document.readyState === 'complete') {
      loadStyles()
    } else {
      window.addEventListener('load', loadStyles)
      return () => window.removeEventListener('load', loadStyles)
    }
  }, [])

  return null
}

export function ClientMDStyleLoader() {
  useEffect(() => {
    // Загружаем некритичные стили после загрузки страницы
    const loadStyles = async () => {
      // Динамически импортируем стили
      await Promise.all([import('md-editor-rt/lib/style.css')])
    }

    // Загружаем стили после того, как страница полностью загрузилась
    if (document.readyState === 'complete') {
      loadStyles()
    } else {
      window.addEventListener('load', loadStyles)
      return () => window.removeEventListener('load', loadStyles)
    }
  }, [])

  return null
}
