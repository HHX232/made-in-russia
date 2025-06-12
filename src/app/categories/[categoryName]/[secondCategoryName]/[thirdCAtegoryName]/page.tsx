import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string; thirdCategoryName: string}>
}) {
  const {thirdCategoryName} = await params
  console.log('thirdCategoryName:', thirdCategoryName)
  const categories = await CategoriesService.getById('l3_' + thirdCategoryName)
  console.log('categories third by slug:', categories)

  return (
    <CategoryPage
      idOfFilter={categories.id}
      categories={categories.children}
      categoryName={thirdCategoryName}
      categoryTitleName={categories.name}
      level={3}
    />
  )
}
