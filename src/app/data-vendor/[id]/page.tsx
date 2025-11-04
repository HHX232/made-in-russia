import {getCurrentLocale} from '@/lib/locale-detection'

import {axiosClassic} from '@/api/api.interceptor'
import VendorPageComponent from '@/components/pages/VendorPage/VendorPage'
import {Product} from '@/services/products/product.types'
import {cookies} from 'next/headers'
import Catalog from '@/components/screens/Catalog/Catalog'
import Footer from '@/components/MainComponents/Footer/Footer'

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
    console.log(
      'vendorData after:',
      currentLang,
      vendorData.data.vendorDetails.productCategories,
      vendorData.data.vendorDetails.countries,
      vendorData.data
    )
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
  } catch {}
  console.log(
    'vendorData full',
    vendorData?.data,
    'newVendorData.vendorDetails.countries',
    vendorData?.data?.vendorDetails?.productCategories
  )

  return (
    <>
      <Catalog
        isShowFilters
        isPageForVendor={false}
        initialHasMore
        usePagesCatalog
        mathMinHeight
        initialProducts={[]}
        specialRoute={false ? '/me/products-summary' : `/vendor/${vendorData?.data?.id}/products-summary`}
      />
      <VendorPageComponent
        onlyShowDescr={vendorData?.data?.vendorDetails?.description}
        onlyShowPhones={vendorData?.data?.vendorDetails?.phoneNumbers}
        onlyShowWebsites={vendorData?.data?.vendorDetails?.sites}
        onlyShowEmail={vendorData?.data?.vendorDetails?.emails}
        onlyShowAddress={vendorData?.data?.vendorDetails?.address}
        vendorData={{
          ...vendorData?.data,
          phoneNumber: trimPhonePrefix(vendorData?.data.phoneNumber)
        }}
        initialProductsForView={initialProductsForView?.data.content}
        isPageForVendor={false}
      />
      <Catalog
        isShowFilters
        isPageForVendor={false}
        initialHasMore
        usePagesCatalog
        mathMinHeight
        initialProducts={[]}
        specialRoute={false ? '/me/products-summary' : `/vendor/${vendorData?.data?.id}/products-summary`}
      />
      <Catalog
        isPageForVendor={false}
        initialHasMore
        mathMinHeight
        initialProducts={[]}
        specialRoute={false ? '/me/products-summary' : `/vendor/${vendorData?.data?.id}/products-summary`}
      />
      <Catalog
        useNewvendorCaralog
        isPageForVendor={false}
        initialHasMore
        mathMinHeight
        initialProducts={[]}
        specialRoute={false ? '/me/products-summary' : `/vendor/${vendorData?.data?.id}/products-summary`}
      />

      <Footer />
    </>
  )
}
