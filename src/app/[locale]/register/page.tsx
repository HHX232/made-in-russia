import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function Login() {
  const categories = await CategoriesService.getAll()
  return <RegisterPage categories={categories} />
}
