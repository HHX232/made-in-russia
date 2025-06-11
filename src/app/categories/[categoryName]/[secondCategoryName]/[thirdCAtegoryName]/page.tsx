import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  const {secondCategoryName} = await params

  return <CategoryPage categoryName={secondCategoryName} level={3} />
}
