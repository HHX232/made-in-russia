import {getCurrentLocale} from '@/lib/locale-detection'

import {axiosClassic} from '@/api/api.interceptor'
import VendorPageComponent from '@/components/pages/VendorPage/VendorPage'
import {Product} from '@/services/products/product.types'
import {cookies} from 'next/headers'

export default async function VendorDataPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  let vendorData
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value || ''
  const currentLang = await getCurrentLocale()

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
    console.log('vendorData after:', vendorData)
  } catch (e) {
    console.log('vendorData dy', e)
  }

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
        'Accept-Language': currentLang,
        'x-language': currentLang
      }
    })
    // console.log('initialProductsForView', initialProductsForView)
    // console.log('initialProductsForView:', initialProductsForView.data)
  } catch {}
  console.log(
    'vendorData full',
    vendorData?.data,
    'newVendorData.vendorDetails.countries',
    vendorData?.data?.vendorDetails?.countries
  )

  // vendorData full {
  //   id: 71,
  //   isEnabled: true,
  //   role: 'Vendor',
  //   email: 'seorum@ya.ru',
  //   login: 'Oil System',
  //   phoneNumber: null,
  //   avatarUrl: null,
  //   registrationDate: '2025-08-21T12:28:25.760626Z',
  //   lastModificationDate: '2025-08-21T12:28:25.760225Z',
  //   vendorDetails: {
  //     id: 20,
  //     inn: '123461770',
  //     description: '',
  //     phoneNumbers: [],
  //     emails: [],
  //     sites: [],
  //     countries: [ [Object] ],
  //     productCategories: [ [Object], [Object], [Object] ],
  //     faq: [],
  //     viewsCount: 0,
  //     creationDate: '2025-08-21T12:28:25.769275Z',
  //     lastModificationDate: '2025-08-21T12:28:25.769293Z'
  //   }

  return (
    <VendorPageComponent
      onlyShowDescr={vendorData?.data?.vendorDetails?.description}
      onlyShowPhones={vendorData?.data?.vendorDetails?.phoneNumbers}
      onlyShowWebsites={vendorData?.data?.vendorDetails?.sites}
      onlyShowEmail={vendorData?.data?.vendorDetails?.emails}
      vendorData={{
        ...vendorData?.data,
        phoneNumber: trimPhonePrefix(vendorData?.data.phoneNumber)
      }}
      initialProductsForView={initialProductsForView?.data.content}
      isPageForVendor={false}
    />
  )
}
