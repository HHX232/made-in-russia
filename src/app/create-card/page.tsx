import CreateCard from '@/components/pages/CreateCard/CreateCard'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Create card',
  ...NO_INDEX_PAGE
}

export default function CreateCardPage() {
  return <CreateCard />
}
