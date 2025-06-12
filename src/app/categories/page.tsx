'use client'

import {useRouter} from 'next/navigation'

// export const metadata: Metadata = {
// TODO перепроверить чтовложенные роуты индексируются
//   ...NO_INDEX_PAGE
// }

export default function CategoriesPage() {
  const router = useRouter()
  router.replace('/')
}
