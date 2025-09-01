import {getAbsoluteLanguage} from '@/api/api.helper'
import LoginPage from '@/components/pages/LoginPage/LoginPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function Login() {
  const locale = await getAbsoluteLanguage()

  const categories = await CategoriesService.getAll(locale)
  return <LoginPage categories={categories} />
}
