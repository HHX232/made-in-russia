// import {getCurrentLocale} from '@/lib/locale-detection'

// import LoginPage from '@/components/pages/LoginPage/LoginPage'
// import CategoriesService from '@/services/categoryes/categoryes.service'

// export default async function Login() {
//   const locale = await getCurrentLocale()

//   const categories = await CategoriesService.getAll(locale)
//   return <LoginPage categories={categories} />
// }

// import {getCurrentLocale} from '@/lib/locale-detection'

import LoginPage from '@/components/pages/LoginPage/LoginPage'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import {getTranslations} from 'next-intl/server'
// import CategoriesService, {categoriesKeys} from '@/services/categoryes/categoryes.service'
// import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'

export default function Login() {
  // const locale = await getCurrentLocale()

  // const queryClient = new QueryClient()

  // await queryClient.prefetchQuery({
  //   queryKey: categoriesKeys.list(locale),
  //   queryFn: () => CategoriesService.getAll(locale)
  // })

  // const dehydratedState = dehydrate(queryClient)

  return <LoginPage categories={[]} />
}

export async function generateMetadata() {
  const t = await getTranslations('metaTitles')
  return {
    title: t('login'),
    ...NO_INDEX_PAGE
  }
}
