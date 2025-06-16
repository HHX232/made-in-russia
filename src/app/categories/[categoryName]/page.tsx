import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecial({params}: {params: Promise<{categoryName: string}>}) {
  const {categoryName} = await params
  let categories
  try {
    categories = await CategoriesService.getById('l1_' + categoryName)
  } catch {
    notFound()
  }
  console.log('categories first by slug:', categories)

  return (
    <CategoryPage
      idOfFilter={categories.id}
      categories={categories.children}
      categoryName={categoryName}
      categoryTitleName={categories.name}
      level={1}
    />
  )
}
