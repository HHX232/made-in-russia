// import {getAbsoluteLanguage} from '@/api/api.helper'
// import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
// import CategoriesService from '@/services/categoryes/categoryes.service'

// export default async function Login() {
//   const locale = await getAbsoluteLanguage()
//   const categories = await CategoriesService.getAll(locale)
//   return <RegisterPage categories={categories} />
// }

// app/register/page.tsx
// import {getAbsoluteLanguage} from '@/api/api.helper'
import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
// import CategoriesService, {categoriesKeys} from '@/services/categoryes/categoryes.service'
// import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'

export default function Register() {
  // const locale = await getAbsoluteLanguage()
  // const queryClient = new QueryClient()

  // await queryClient.prefetchQuery({
  //   queryKey: categoriesKeys.list(locale),
  //   queryFn: () => CategoriesService.getAll(locale)
  // })

  // const dehydratedState = dehydrate(queryClient)

  return (
    // <HydrationBoundary state={dehydratedState}>
    <RegisterPage />
    // {/* </HydrationBoundary> */}
  )
}
