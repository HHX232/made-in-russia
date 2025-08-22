import {getAbsoluteLanguage} from '@/api/api.helper'
import {axiosClassic} from '@/api/api.interceptor'
import VendorPageComponent from '@/components/pages/VendorPage/VendorPage'
import {Product} from '@/services/products/product.types'
import {cookies} from 'next/headers'

export default async function VendorDataPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  let vendorData
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value || ''
  const currentLang = await getAbsoluteLanguage()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vendorData = await axiosClassic.get<any>(`/vendor/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
        'Accept-Language': currentLang,
        'x-language': currentLang
      }
    })
    // console.log('vendorData:', vendorData.data)
  } catch {}

  const trimPhonePrefix = (phoneNumber: string | undefined): string | undefined => {
    if (!phoneNumber) return phoneNumber

    const prefixesToTrim = ['+375', '+7', '+86']

    for (const prefix of prefixesToTrim) {
      if (phoneNumber.startsWith(prefix)) {
        return phoneNumber.substring(prefix.length)
      }
    }

    return phoneNumber
  }
  let initialProductsForView
  try {
    console.log('start try')
    initialProductsForView = await axiosClassic.get<{content: Product[]}>(`/vendor/${id}/products-summary`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
        'Accept-Language': currentLang
      }
    })
    console.log('initialProductsForView', initialProductsForView)
    console.log('initialProductsForView:', initialProductsForView.data)
  } catch {}
  console.log(
    'vendorData full',
    vendorData,
    'newVendorData.vendorDetails.countries',
    vendorData?.data?.vendorDetails?.countries
  )

  return (
    <VendorPageComponent
      vendorData={{
        ...vendorData?.data,
        phoneNumber: trimPhonePrefix(vendorData?.data.phoneNumber)
      }}
      initialProductsForView={initialProductsForView?.data.content}
      isPageForVendor={false}
    />
  )
}
