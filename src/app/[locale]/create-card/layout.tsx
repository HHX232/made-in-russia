'use client'

import dynamic from 'next/dynamic'
import {ReactNode} from 'react'

const ClientMDStyleLoader = dynamic(
  () => import('@/components/ClientStyleLoader').then((mod) => mod.ClientMDStyleLoader),
  {ssr: false}
)
export default function CreateCardLayout({children}: {children: ReactNode}) {
  return (
    <>
      <ClientMDStyleLoader />
      {children}
    </>
  )
}
