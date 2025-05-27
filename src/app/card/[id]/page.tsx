// app/card/[id]/page.tsx

import CardPage from '@/components/pages/CardPage/CardPage'
import cardService from '@/services/card/card.service'
import ICardFull from '@/services/card/card.types'

export default function CardPageRoute({params}: {params: {id: string}}) {
  return <CardPage params={params} />
}

export async function generateMetadata({params}: {params: {id: string}}) {
  try {
    const {data} = await cardService.getFullCardById(params.id)
    const product = data as ICardFull

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
        images: product.media ? [product.media[0].url] : []
      }
    }
  } catch (error) {
    console.error('Error fetching card data:', error)
    return {
      title: 'Product Not Found'
    }
  }
}
