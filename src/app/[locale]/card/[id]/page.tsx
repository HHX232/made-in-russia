import CardPage from '@/components/pages/CardPage/CardPage'
import cardService from '@/services/card/card.service'
import ICardFull from '@/services/card/card.types'
import {cookies} from 'next/headers'

export default async function CardPageRoute({params}: {params: Promise<{id: string}>}) {
  return <CardPage params={params} />
}

export async function generateMetadata({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  try {
    const {data} = await cardService.getFullCardById(id, locale)
    const product = data as ICardFull

    // console.log('full product', product)
    if (!product) {
      return {
        title: 'Product Not Found'
      }
    }

    return {
      title: product.title || 'Product',
      description: product.furtherDescription || 'Product description',
      openGraph: {
        title: product.title || 'Product',
        description: product.furtherDescription || 'Product description',
        images: product.media ? [product.media[0]] : []
      }
    }
  } catch (error) {
    console.error('Error fetching card data:', error)
    return {
      title: 'Product Not Found'
    }
  }
}
