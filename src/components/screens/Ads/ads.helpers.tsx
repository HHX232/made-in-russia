import {IPromoFromServer} from '@/app/page'

export const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

// Генерация основной схемы промо-секции
export const generateMainPromoSchema = (ads: IPromoFromServer[], organizationName: string, baseUrl: string) => {
  const bigAds = ads.filter((ad) => ad.isBig)
  const smallAds = ads.filter((ad) => !ad.isBig)

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPageElement',
    '@id': `${baseUrl}#promo-section`,
    name: 'Promotional Section',
    description: 'Featured promotional content and offers',
    isPartOf: {
      '@type': 'WebPage',
      '@id': baseUrl
    },
    ...(bigAds.length > 0 && {
      mainEntity: bigAds.map((ad) => ({
        '@type': 'PromotionalOffer',
        '@id': `${baseUrl}#promo-${ad.id}`,
        name: stripHtml(ad.title),
        description: stripHtml(ad.subtitle + (ad.thirdText ? ' ' + ad.thirdText : '')),
        image: {
          '@type': 'ImageObject',
          url: ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseUrl}${ad.imageUrl}`,
          width: 800,
          height: 600
        },
        url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`,
        validFrom: new Date().toISOString(),
        priceSpecification: {
          '@type': 'PriceSpecification',
          eligibleQuantity: {
            '@type': 'QuantitativeValue',
            value: 1
          }
        }
      }))
    }),
    ...(smallAds.length > 0 && {
      hasPart: smallAds.map((ad) => ({
        '@type': 'CreativeWork',
        '@id': `${baseUrl}#content-${ad.id}`,
        name: stripHtml(ad.title),
        description: stripHtml(ad.subtitle),
        image: {
          '@type': 'ImageObject',
          url: ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseUrl}${ad.imageUrl}`,
          width: 400,
          height: 300
        },
        url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`,
        datePublished: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: organizationName
        }
      }))
    })
  }
}

// Генерация схемы ItemList для e-commerce
export const generateItemListSchema = (ads: IPromoFromServer[], baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${baseUrl}#promo-list`,
    name: 'Featured Promotions',
    description: 'Current promotional offers and featured content',
    numberOfItems: ads.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: ads.map((ad, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': ad.isBig ? 'Product' : 'Article',
        '@id': `${baseUrl}#item-${ad.id}`,
        name: stripHtml(ad.title),
        description: stripHtml(ad.subtitle),
        image: {
          '@type': 'ImageObject',
          url: ad.imageUrl.startsWith('http') ? ad.imageUrl : `${baseUrl}${ad.imageUrl}`,
          width: ad.isBig ? 800 : 400,
          height: ad.isBig ? 600 : 300
        },
        url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`,
        ...(ad.isBig && {
          offers: {
            '@type': 'Offer',
            '@id': `${baseUrl}#offer-${ad.id}`,
            availability: 'https://schema.org/InStock',
            url: ad.link.startsWith('http') ? ad.link : `${baseUrl}${ad.link}`
          }
        }),
        ...(!ad.isBig && {
          datePublished: new Date().toISOString(),
          articleSection: 'Promotions'
        })
      }
    }))
  }
}

// Генерация схемы организации
export const generateOrganizationSchema = (organizationName: string, baseUrl: string, logoUrl?: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: organizationName,
    url: baseUrl,
    ...(logoUrl && {
      logo: {
        '@type': 'ImageObject',
        url: logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`
      }
    }),
    sameAs: [
      // TODO Добавьте ссылки на социальные сети
      // 'https://facebook.com/yourpage',
      // 'https://twitter.com/yourhandle'
    ]
  }
}

// Генерация схемы BreadcrumbList (если нужно)
export const generateBreadcrumbSchema = (baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${baseUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Promotions',
        item: `${baseUrl}#promo-section`
      }
    ]
  }
}

// Генерация схемы WebSite
export const generateWebSiteSchema = (baseUrl: string, siteTitle: string, organizationName: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    url: baseUrl,
    name: siteTitle,
    description: `Official website of ${organizationName}`,
    publisher: {
      '@id': `${baseUrl}#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}
