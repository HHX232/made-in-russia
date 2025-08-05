'use client'

import {ClientMDStyleLoader} from '@/components/ClientStyleLoader'
import {ReactNode} from 'react'

export default function CreateCardLayout({children}: {children: ReactNode}) {
  return (
    <>
      <ClientMDStyleLoader />
      {children}
    </>
  )
}
