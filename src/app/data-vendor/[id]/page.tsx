import {axiosClassic} from '@/api/api.interceptor'
import VendorPageComponent from '@/components/pages/VendorPage/VendorPage'

export default async function VendorDataPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  let vendorData
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vendorData = await axiosClassic.get<any>(`/vendor/${id}`)
    console.log('vendorData:', vendorData.data)
  } catch {}

  // Функция для обрезки префиксов номера телефона
  const trimPhonePrefix = (phoneNumber: string | undefined): string | undefined => {
    if (!phoneNumber) return phoneNumber

    const prefixesToTrim = ['+375', '+7', '+8']

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
