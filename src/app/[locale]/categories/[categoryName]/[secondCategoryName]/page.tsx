import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {cookies} from 'next/headers'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  const {secondCategoryName} = await params
  let categories
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  try {
    categories = await CategoriesService.getById('l2_' + secondCategoryName, locale)
  } catch {
    notFound()
  }
  console.log('categories second by slug:', categories)

  return (
    <CategoryPage
      idOfFilter={categories.id}
      categories={
        categories.children
        // .filter((category) => category.slug.toLocaleLowerCase() === categoryName.toLocaleLowerCase())[0]
        // .children.filter(
        //   (category) => category.slug.toLocaleLowerCase() === secondCategoryName.toLocaleLowerCase()
        // )[0].children
      }
      categoryName={secondCategoryName}
      categoryTitleName={categories.name}
      level={2}
    />
  )
}
