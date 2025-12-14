import GoogleRecaptchaProviderComponent from '@/providers/GoogleRecaptchaProviderComponent'

import {ReactNode} from 'react'

export default function RegisterLayout({children}: {children: ReactNode}) {
  return <GoogleRecaptchaProviderComponent>{children}</GoogleRecaptchaProviderComponent>
}
