// import {getCurrentLocale} from '@/lib/locale-detection'

// import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
// import CategoriesService from '@/services/categoryes/categoryes.service'

// export default async function Login() {
//   const locale = await getCurrentLocale()

//   const categories = await CategoriesService.getAll(locale)
//   return <RegisterPage categories={categories} />
// }

// app/register/page.tsx
// import {getCurrentLocale} from '@/lib/locale-detection'

import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
// import CategoriesService, {categoriesKeys} from '@/services/categoryes/categoryes.service'
// import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'

export default function Register() {
  // const locale = await getCurrentLocale()

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
