import {getAbsoluteLanguage} from '@/api/api.helper'
import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  const {secondCategoryName} = await params
  let categories
  const locale = await getAbsoluteLanguage()

  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    console.log('Category:', `/companies/l2_${secondCategoryName}`)
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l2_${secondCategoryName}`,
      {
        headers: {
          'Accept-Language': locale || 'en',
          'x-language': locale || 'en'
        }
      }
    )

    // console.log('data companyes:', data)
    companyes = data
  } catch {
    companyes = []
  }
  // console.log('companyes:', companyes)

  try {
    categories = await CategoriesService.getById('l2_' + secondCategoryName, locale)
  } catch {
    notFound()
  }
  // console.log('categories second by slug:', categories)

  return (
    <CategoryPage
      companyes={companyes || []}
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
