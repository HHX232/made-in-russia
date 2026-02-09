'use client'

import {Suspense, useEffect, useState} from 'react'
import {YMInitializer} from 'react-yandex-metrika'
import {YM_COUNTER_ID} from '@/constants/yandex'

export default function YandexMetrika() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <YMInitializer accounts={[YM_COUNTER_ID]} options={{webvisor: true}} version='2' />
    </Suspense>
  )
}
