'use client'

import {ReactNode} from 'react'

export default function CardLayout({children}: {children: ReactNode}) {
  return (
    <>
      {/* <ClientMDStyleLoader /> */}
      {children}
    </>
  )
}
