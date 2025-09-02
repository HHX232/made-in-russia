// import {getAbsoluteLanguage} from '@/api/api.helper'
// import LoginPage from '@/components/pages/LoginPage/LoginPage'
// import CategoriesService from '@/services/categoryes/categoryes.service'

// export default async function Login() {
//   const locale = await getAbsoluteLanguage()

//   const categories = await CategoriesService.getAll(locale)
//   return <LoginPage categories={categories} />
// }

// import {getAbsoluteLanguage} from '@/api/api.helper'
import LoginPage from '@/components/pages/LoginPage/LoginPage'
// import CategoriesService, {categoriesKeys} from '@/services/categoryes/categoryes.service'
// import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'

export default function Login() {
  // const locale = await getAbsoluteLanguage()
  // const queryClient = new QueryClient()

  // await queryClient.prefetchQuery({
  //   queryKey: categoriesKeys.list(locale),
  //   queryFn: () => CategoriesService.getAll(locale)
  // })

  // const dehydratedState = dehydrate(queryClient)

  return <LoginPage categories={[]} />
}
