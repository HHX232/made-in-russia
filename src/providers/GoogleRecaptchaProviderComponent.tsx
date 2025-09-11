'use client'

import React from 'react'
import {GoogleReCaptchaProvider} from 'react-google-recaptcha-v3'

export default function GoogleRecaptchaProviderComponent({children}: {children: React.ReactNode}) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY

  if (!reCaptchaKey || reCaptchaKey === 'UNKNOWN') {
    console.warn('reCAPTCHA key not found')
    return <>{children}</>
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head'
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}
