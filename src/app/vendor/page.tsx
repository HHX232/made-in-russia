import VendorPageComponent, {IVendorData} from '@/components/pages/VendorPage/VendorPage'
import instance from '@/api/api.interceptor'
import {cookies} from 'next/headers'

export default async function VendorPage() {
  let vendorData
  let numberCode
  // Правильный способ получения cookies в серверном компоненте
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value || ''

  try {
    console.log('accessToken:', accessToken)
    vendorData = await instance.get<IVendorData>('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
      }
    })
    console.log('vendorData:', vendorData?.data)
  } catch (e) {
    console.log('Error fetching vendor data:', e)
  }

  const trimPhonePrefix = (phoneNumber: string | undefined): string | undefined => {
    if (!phoneNumber) return phoneNumber

    const prefixesToTrim = ['+375', '+7', '+86', '+']

    for (const prefix of prefixesToTrim) {
      if (phoneNumber.startsWith(prefix)) {
        numberCode = prefix
        return phoneNumber.substring(prefix.length)
      }
    }

    return phoneNumber
  }

  console.log('Full vendor Data', vendorData)
  const newVendorData: IVendorData = {
    ...vendorData?.data,
    phoneNumber: trimPhonePrefix(vendorData?.data.phoneNumber) || '',
    id: vendorData?.data.id || 0,
    role: vendorData?.data.role || '',
    email: vendorData?.data.email || '',
    login: vendorData?.data.login || '',
    region: vendorData?.data.region || '',
    registrationDate: vendorData?.data.registrationDate || '',
    lastModificationDate: vendorData?.data.lastModificationDate || ''
  }
  console.log('newVendorData:', newVendorData, 'vendorDetails', newVendorData.vendorDetails)

  return <VendorPageComponent isPageForVendor={true} vendorData={newVendorData} numberCode={numberCode} />
}
