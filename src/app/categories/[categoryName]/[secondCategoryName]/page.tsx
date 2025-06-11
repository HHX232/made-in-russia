import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  const {secondCategoryName, categoryName} = await params
  const categories = await CategoriesService.getAll()
  console.log('START CAT2:', categories[0].children, 'END CAT2')
  console.log(
    'find second child ',
    categories
      .filter((category) => category.slug.toLocaleLowerCase() === categoryName.toLocaleLowerCase())[0]
      .children.filter((category) => category.slug.toLocaleLowerCase() === secondCategoryName.toLocaleLowerCase())[0]
      .children
  )

  return (
    <CategoryPage
      categories={
        categories
          .filter((category) => category.slug.toLocaleLowerCase() === categoryName.toLocaleLowerCase())[0]
          .children.filter(
            (category) => category.slug.toLocaleLowerCase() === secondCategoryName.toLocaleLowerCase()
          )[0].children
      }
      categoryName={secondCategoryName}
      level={2}
    />
  )
}
