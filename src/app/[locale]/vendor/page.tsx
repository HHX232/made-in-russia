// app/vendor/page.tsx
import {getAbsoluteLanguage} from '@/api/api.helper'
import VendorPageClient from '@/components/pages/VendorPage/VendorPageClient/VendorPageClient'
import {getQueryClient} from '@/lib/get-query-client'
import {fetchUserDataOnServer} from '@/lib/server/userDataFetcher'
import {HydrationBoundary, dehydrate} from '@tanstack/react-query'

export default async function VendorPage() {
  // Получаем данные пользователя на сервере
  const lang = await getAbsoluteLanguage()
  const {user, phoneNumberCode, error} = await fetchUserDataOnServer()

  // Создаем клиент для предзаполнения кэша
  const queryClient = getQueryClient()

  // Если есть данные пользователя, предзаполняем кэш
  if (user) {
    queryClient.setQueryData(['user', lang], user)
  }

  // Если ошибка или нет данных, можно вернуть страницу с ошибкой или редирект
  if (error && !user) {
    // Можно редиректить на страницу логина или показать ошибку
    console.error('Failed to fetch user data:', error)
  }

  // Дегидрируем состояние для передачи на клиент
  const dehydratedState = dehydrate(queryClient)

  console.log('full vendor user on server', user)
  return (
    <HydrationBoundary state={dehydratedState}>
      <VendorPageClient serverUser={user} phoneNumberCode={phoneNumberCode} serverError={error} />
    </HydrationBoundary>
  )
}
