import {getAbsoluteLanguage} from '@/api/api.helper'
import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function Login() {
  const locale = await getAbsoluteLanguage()
  //TODO заменить   CategoriesService.getAll на кжшированную версию
  const categories = await CategoriesService.getAll(locale)
  return <RegisterPage categories={categories} />
}
