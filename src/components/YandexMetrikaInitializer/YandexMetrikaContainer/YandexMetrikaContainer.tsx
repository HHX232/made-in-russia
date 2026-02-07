'use client'

import {YM_COUNTER_ID} from '@/constants/yandex'
import {usePathname, useSearchParams} from 'next/navigation'
import React, {useEffect} from 'react'
import useYandexMetrika from '../useYandexMetrika'
import YandexMetrikaInitializer from '../YandexMetrikaInitializer'

type Props = {
  enabled: boolean
}

const YandexMetrikaContainer: React.FC<Props> = ({enabled}) => {
  const pathname = usePathname()
  const search = useSearchParams()
  const {hit} = useYandexMetrika(YM_COUNTER_ID)

  useEffect(() => {
    hit(`${pathname}${search.size ? `?${search}` : ''}${window.location.hash}`)
  }, [hit, pathname, search])

  if (!enabled) return null

  return <YandexMetrikaInitializer id={YM_COUNTER_ID} initParameters={{webvisor: true, defer: true}} />
}

export default YandexMetrikaContainer
