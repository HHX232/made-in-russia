// components/IOSInputZoomDisabler.tsx
'use client'

import {useEffect} from 'react'

export default function IOSInputZoomDisabler() {
  useEffect(() => {
    // Проверяем iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (!isIOS) return

    const addMaximumScaleToMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]')

      if (el !== null) {
        let content = el.getAttribute('content') || ''
        const re = /maximum-scale=[0-9.]+/g

        if (re.test(content)) {
          content = content.replace(re, 'maximum-scale=1.0')
        } else {
          content = [content, 'maximum-scale=1.0'].join(', ')
        }

        el.setAttribute('content', content)
      }
    }

    const disableIosTextFieldZoom = addMaximumScaleToMetaViewport

    // Проверяем, является ли элемент текстовым полем
    const checkIsIosTextFieldElement = (element: EventTarget | null) => {
      return (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      )
    }

    const handleIosTextFieldFocus = (e: FocusEvent) => {
      if (checkIsIosTextFieldElement(e.target)) {
        disableIosTextFieldZoom()
      }
    }

    // Слушаем все фокусы
    document.addEventListener(
      'touchstart',
      (e) => {
        if (checkIsIosTextFieldElement(e.target)) {
          disableIosTextFieldZoom()
        }
      },
      true
    )

    document.addEventListener('focus', handleIosTextFieldFocus, true)

    return () => {
      document.removeEventListener('focus', handleIosTextFieldFocus, true)
    }
  }, [])

  return null
}
