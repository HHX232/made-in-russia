import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
import {Suspense} from 'react'
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
    <Suspense>
      <RegisterPage />
    </Suspense>
    // {/* </HydrationBoundary> */}
  )
}
