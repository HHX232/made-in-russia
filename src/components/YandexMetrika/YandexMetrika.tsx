'use client'

import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

const PRIVATE_ROUTES = ['/vendor', '/profile']
const YM_ID = 106611450

export default function YandexMetrika() {
  const pathname = usePathname()

  const isPrivate = PRIVATE_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))

  useEffect(() => {
    if (isPrivate) return

    // Загружаем скрипт
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {
          if (document.scripts[j].src === r) { return; }
        }
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],
        k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}', 'ym');

      ym(${YM_ID}, 'init', {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        accurateTrackBounce: true,
        trackLinks: true
      });
    `
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [isPrivate])

  if (isPrivate) return null

  return (
    <noscript>
      <div>
        <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{position: 'absolute', left: '-9999px'}} alt='' />
      </div>
    </noscript>
  )
}
