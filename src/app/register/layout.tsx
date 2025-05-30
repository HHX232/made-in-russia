import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import {Metadata} from 'next'
import {ReactNode} from 'react'

export const metadata: Metadata = {
  title: 'Register',
  ...NO_INDEX_PAGE
}

export default function RegisterLayout({children}: {children: ReactNode}) {
  return <>{children}</>
}
