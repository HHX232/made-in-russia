import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import {Metadata} from 'next'
import {ReactNode} from 'react'

export const metadata: Metadata = {
  title: 'Login',
  ...NO_INDEX_PAGE
}

export default function LoginLayout({children}: {children: ReactNode}) {
  return <>{children}</>
}
