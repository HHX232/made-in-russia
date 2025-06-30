import {axiosClassic} from '@/api/api.interceptor'
import VendorPageComponent from '@/components/pages/VendorPage/VendorPage'
import {cookies} from 'next/headers'

export default async function VendorDataPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  let vendorData
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value || ''

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vendorData = await axiosClassic.get<any>(`/vendor/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
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

  return (
    <VendorPageComponent
      vendorData={{
        ...vendorData?.data,
        phoneNumber: trimPhonePrefix(vendorData?.data.phoneNumber)
      }}
      isPageForVendor={false}
    />
  )
}
