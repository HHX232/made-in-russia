import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function CategoryPageSpecial({params}: {params: Promise<{categoryName: string}>}) {
  const {categoryName} = await params
  const categories = await CategoriesService.getAll()
  console.log('categoryName:', categoryName, 'categories:', categories[0].children)
  return (
    <CategoryPage
      categories={categories.filter((category) => category.slug === categoryName)[0].children}
      categoryName={categoryName}
      level={1}
    />
  )
}
