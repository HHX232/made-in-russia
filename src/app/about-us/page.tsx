import AboutUs from '@/components/pages/AboutUs/AboutUs'

export default function AboutUsPage() {
  return <AboutUs />
}

export async function generateMetadata() {
  try {
    return {
      icons: {
        icon: '/mstile-c-144x144.png',
        shortcut: '/favicon-c-32x32.png',
        apple: [
          {url: '/apple-touch-icon-cpec-144x144.png', sizes: '144x144', type: 'image/png'},
          {url: '/apple-touch-icon-c-152x152.png', sizes: '152x152', type: 'image/png'}
        ],
        other: [
          {
            rel: 'apple-touch-icon-precomposed',
            url: '/apple-touch-icon-c-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {rel: 'msapplication-TileImage', url: '/mstile-c-144x144.png'},
          {rel: 'msapplication-TileImage', url: '/mstile-c-150x150.png', sizes: '150x150'},
          {rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon-16x16.png'},
          {rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-c-32x32.png'}
        ]
      }
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return {title: 'Exporteru'}
  }
}
