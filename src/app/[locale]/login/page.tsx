import LoginPage from '@/components/pages/LoginPage/LoginPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {cookies} from 'next/headers'

export default async function Login() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'

  const categories = await CategoriesService.getAll(locale)
  return <LoginPage categories={categories} />
}
