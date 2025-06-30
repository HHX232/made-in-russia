import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{
    categoryName: string
    secondCategoryName: string
    thirdCategoryName: string
    thirdCAtegoryName: string
  }>
}) {
  const {thirdCategoryName, thirdCAtegoryName} = await params
  console.log('thirdCategoryName:', thirdCategoryName, 'thirdCAtegoryName', thirdCAtegoryName)
  let categories
  try {
    categories = await CategoriesService.getById('l3_' + (thirdCategoryName || thirdCAtegoryName))
  } catch {
    notFound()
  }
  console.log('categories third by slug:', categories)

  return (
    <CategoryPage
      idOfFilter={categories.id}
      categories={categories.children}
      categoryName={thirdCategoryName || thirdCAtegoryName}
      categoryTitleName={categories.name}
      level={3}
    />
  )
}
