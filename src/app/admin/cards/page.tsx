/* eslint-disable @typescript-eslint/no-explicit-any */
import {axiosClassic} from '@/api/api.interceptor'
import {IPromoFromServer} from '@/app/page'
import AdminPanel from '@/components/pages/AdminPanel/AdminPanel'
import {getCurrentLocale} from '@/lib/locale-detection'
import {Product} from '@/services/products/product.types'

export const metadata = {
  title: 'Admin - users'
}
interface IGeneralResponse {
  products: {
    content: Product[]
    last: boolean
  }
  categories: any[]
  allCategories: any[]
  advertisements?: IPromoFromServer[]
}
async function getInitialData(locale: string) {
  const {data} = await axiosClassic.get<IGeneralResponse>('/general', {
    headers: {
      'Accept-Language': locale,
      'x-locale': locale
    }
  })

  // console.log('general data', data)
  return data
}

const AdminCardsPage = async () => {
  const locale = await getCurrentLocale()

  const {products} = await getInitialData(locale)

  return <AdminPanel initialProducts={products.content} hasMore={!products.last} />
}

export default AdminCardsPage
