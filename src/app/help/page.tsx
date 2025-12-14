import HelpPageComponent from '@/components/pages/HelpPageComponent/HelpPageComponent'
import {getTranslations} from 'next-intl/server'

export default function HelpPage() {
  return <HelpPageComponent />
}

export async function generateMetadata() {
  const t = await getTranslations('metaTitles')
  return {
    title: t('help')
  }
}
