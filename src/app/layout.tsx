import '@/fonts/fonts.scss'

import DefaultProvider from '@/providers/DefaultProvider'
import '@/scss/_variables.scss'
import '@/scss/main.scss'
import 'react-loading-skeleton/dist/skeleton.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import type {Metadata} from 'next'
import {Toaster} from 'sonner'

export const metadata: Metadata = {
  title: 'Made In Russia',
  description: 'Generated by create next app'
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html>
      <body>
        <DefaultProvider>
          {children}

          <Toaster theme={'dark'} position={'top-right'} duration={3500} />
        </DefaultProvider>
        <div id='modal_portal'></div>
      </body>
    </html>
  )
}
