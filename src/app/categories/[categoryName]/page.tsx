import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function CategoryPageSpecial({params}: {params: Promise<{categoryName: string}>}) {
  const {categoryName} = await params
  const categories = await CategoriesService.getAll()
  return (
    <CategoryPage
      idOfFilter={categories.filter((category) => category.slug === categoryName)[0].id}
      categories={categories.filter((category) => category.slug === categoryName)[0].children}
      categoryName={categoryName}
      categoryTitleName={categories.filter((category) => category.slug === categoryName)[0].name}
      level={1}
    />
  )
}
