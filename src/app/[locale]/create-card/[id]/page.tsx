import CreateCard from '@/components/pages/CreateCard/CreateCard'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import cardService from '@/services/card/card.service'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'

export const metadata: Metadata = {
  title: 'Create card',
  ...NO_INDEX_PAGE
}

export default async function CreateCardPageWithId({params}: {params: Promise<{id: string}>}) {
  const {id} = await params

  let res
  let isSuccess = true
  try {
    res = await cardService.getFullCardById(id)
  } catch {
    isSuccess = false
    notFound()
  }
  if (!res.data) {
    notFound()
  }
  return <CreateCard initialData={(isSuccess && res?.data) || undefined} />
}
