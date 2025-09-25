import {getCurrentLocale} from '@/lib/locale-detection'

import instance from '@/api/api.interceptor'
import ProfilePage from '@/components/pages/ProfilePage/ProfilePage'
import {User} from '@/services/users.types'
import {cookies} from 'next/headers'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Profile'
}

export default async function ProfilePageMain() {
  let userData

  // Правильный способ получения cookies в серверном компоненте
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value || ''

  const locale = await getCurrentLocale()

  try {
    // console.log('accessToken:', accessToken)
    userData = await instance.get<User>('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
        'Accept-Language': locale,
        'x-language': locale
      }
    })
    // console.log('userData:', userData?.data)
  } catch (e) {
    console.log('Error fetching userData:', e)
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

  const initialUserData = {
    ...userData?.data,
    phoneNumber: trimPhonePrefix(userData?.data.phoneNumber) || '',
    id: userData?.data.id || 0,
    role: userData?.data.role || '',
    email: userData?.data.email || '',
    login: userData?.data.login || '',
    region: userData?.data.region || '',
    registrationDate: userData?.data.registrationDate || '',
    lastModificationDate: userData?.data.lastModificationDate || '',
    avatarUrl: userData?.data.avatarUrl || '',
    vendorDetails: userData?.data.vendorDetails || undefined
  }
  // console.log('initialUserData:', initialUserData)
  return <ProfilePage firstUserData={initialUserData} />
}
