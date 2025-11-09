import CreateCard from '@/components/pages/CreateCard/CreateCard'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('metaTitles')
  return {
    title: t('create')
  }
}

export default function CreateCardPage() {
  return <CreateCard />
}
