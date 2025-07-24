import CreateCard from '@/components/pages/CreateCard/CreateCard'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import cardService from '@/services/card/card.service'
import {Metadata} from 'next'
// import {headers} from 'next/headers'
import {notFound} from 'next/navigation'

export const metadata: Metadata = {
  title: 'Create card',
  ...NO_INDEX_PAGE
}

export default async function CreateCardPageWithId({params}: {params: Promise<{id: string; locale: string}>}) {
  const {id, locale} = await params

  // if (!locale) {
  //   const headersList = await headers()

  //   locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

  //   if (!locale) {
  //     const referer = headersList.get('referer')
  //     if (referer) {
  //       const match = referer.match(/\/([a-z]{2})\//)
  //       if (match && ['en', 'ru', 'zh'].includes(match[1])) {
  //         locale = match[1]
  //       }
  //     }
  //   }
  // }

  let res
  let isSuccess = true
  try {
    res = await cardService.getFullCardById(id, locale, true)
    console.log('res full card with translates', res.data)
  } catch {
    isSuccess = false
    notFound()
  }
  if (!res.data) {
    notFound()
  }

  console.log('res.data', locale, res?.data)
  return <CreateCard initialData={(isSuccess && res?.data) || undefined} />
}
