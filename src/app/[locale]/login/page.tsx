import LoginPage from '@/components/pages/LoginPage/LoginPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function Login() {
  const categories = await CategoriesService.getAll()
  return <LoginPage categories={categories} />
}
