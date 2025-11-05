// app/vendor/page.tsx
import {getCurrentLocale} from '@/lib/locale-detection'
import VendorPageClient from '@/components/pages/VendorPage/VendorPageClient/VendorPageClient'
import {getQueryClient} from '@/lib/get-query-client'
import {fetchUserDataOnServer} from '@/lib/server/userDataFetcher'
import {HydrationBoundary, dehydrate} from '@tanstack/react-query'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Vendor'
}

// Важно! Отключаем статический рендеринг
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function VendorPage({
  searchParams
}: {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}) {
  const search = await searchParams
  const lang = await getCurrentLocale()

  // Используем searchParams для инвалидации кэша
  const cacheKey = search.t || Date.now()

  console.log('Fetching user data with lang:', lang, 'cache key:', cacheKey)

  const {user, phoneNumberCode, error} = await fetchUserDataOnServer()

  const queryClient = getQueryClient()

  // Предзаполняем кэш с правильным ключом
  if (user) {
    queryClient.setQueryData(['user', lang], user)
  }

  if (error && !user) {
    console.error('Failed to fetch user data:', error)
  }

  const dehydratedState = dehydrate(queryClient)

  console.log('Full vendor user on server with lang', lang, user)

  return (
    <HydrationBoundary state={dehydratedState}>
      <VendorPageClient
        serverUser={user}
        phoneNumberCode={phoneNumberCode}
        serverError={error}
        initialLang={lang}
        cacheKey={cacheKey.toString()}
      />
    </HydrationBoundary>
  )
}
