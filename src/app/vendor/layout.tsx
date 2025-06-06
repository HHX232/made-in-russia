import {Metadata} from 'next'
import {ReactNode} from 'react'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'

export const metadata: Metadata = {
  title: 'Vendor',
  ...NO_INDEX_PAGE
}

export default function VendorLayout({children}: {children: ReactNode}) {
  return <>{children}</>
}
