import RegisterPage from '@/components/pages/RegisterPage/RegisterPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {cookies} from 'next/headers'

export default async function Login() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  const categories = await CategoriesService.getAll(locale)
  return <RegisterPage categories={categories} />
}
