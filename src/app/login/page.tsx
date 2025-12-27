import LoginPage from '@/components/pages/LoginPage/LoginPage'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import {getTranslations} from 'next-intl/server'

export default function Login() {
  return <LoginPage categories={[]} />
}

export async function generateMetadata() {
  const t = await getTranslations('metaTitles')
  return {
    title: t('login'),
    ...NO_INDEX_PAGE
  }
}
