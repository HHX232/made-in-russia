import CreateCard from '@/components/pages/CreateCard/CreateCard'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Create card'
}

export default function CreateCardPage() {
  return <CreateCard />
}
