'use client'
import {DeliveryMethod, Product} from '@/services/products/product.types'
import {memo, useId, useState} from 'react'
import Image, {StaticImageData} from 'next/image'
import styles from './card.module.scss'
// import {createPriceWithDot} from '@/utils/createPriceWithDot'
// import BasketButtonUI from '../../buttons/BasketButtonUI/BasketButtonUI'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
// import ToggleFavoritesButtonUI from '../../buttons/toggleFavoritesButtonUI/toggleFavoritesButtonUI'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import instance from '@/api/api.interceptor'
import {toast} from 'sonner'
import DropList from '../../Texts/DropList/DropList'
import {useNProgress} from '@/hooks/useProgress'

const t1 = '/tree.jpg'
const t2 = '/tree2.jpg'

type ApproveStatus = 'APPROVED' | 'PENDING' | 'REJECTED'

export interface ICardProps {
  approveStatus?: ApproveStatus
  id: number
  extraButtonsBoxClass?: string
  deliveryMethod: Omit<DeliveryMethod, 'creationDate' | 'lastModificationDate'>
  title: string
  price: number
  discount: number
  previewImageUrl: string | StaticImageData
  discountedPrice: number
  fullProduct?: Product
  isLoading?: boolean
  onClickFunction?: (e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => void
  canUpdateProduct?: boolean
  onPreventCardClick?: (item: Product) => void
  isShowButton?: boolean
  specialButtonText?: string
  isForAdmin?: boolean
}

const Card = memo<ICardProps>(
  ({
    id,
    extraButtonsBoxClass,
    // deliveryMethod = 'Доставка',
    title = 'default Title',
    price = '10000',
    discount = '0',
    previewImageUrl = t1,
    discountedPrice = '10000',
    fullProduct = {} as Product,
    isLoading = false,
    // onClickFunction,
    canUpdateProduct = false,
    onPreventCardClick,
    specialButtonText,
    isShowButton = true,
    approveStatus,
    isForAdmin = false
  }) => {
    const idFromHook = useId()
    const {toggleToFavorites} = useActions()
    const {productInFavorites} = useTypedSelector((state) => state.favorites)
    const t = useTranslations('CardComponent')
    const {hide} = useNProgress()
    const [status, setStatus] = useState(approveStatus)
    // Функция для смены статуса продукта
    const changeProductStatus = async (productId: number, newStatus: ApproveStatus) => {
      const loadingToast = toast.loading('Обновление статуса...')

      try {
        const res = await instance.post(`/moderation/product/${productId}`, {
          status: newStatus
        })

        console.log(res)
        toast.dismiss(loadingToast)

        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('success')}</strong>
            {/* Статус продукта изменен на */}
            <span>
              {t('successUpdateStatus')}
              {newStatus}
            </span>
          </div>,
          {
            style: {
              background: '#2E7D32'
            }
          }
        )
      } catch (e) {
        console.log(e)
        toast.dismiss(loadingToast)

        toast.error(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('error')}</strong>
            {/* Ошибка при изменении статуса */}
            <span>{t('errorUpdateStatus')}</span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
      }
    }

    // Функции для конкретных статусов
    const approveProduct = (productId: number) => {
      changeProductStatus(productId, 'APPROVED')
      setStatus('APPROVED')
    }

    const rejectProduct = (productId: number) => {
      changeProductStatus(productId, 'REJECTED')
      setStatus('REJECTED')
    }

    const setPendingProduct = (productId: number) => {
      changeProductStatus(productId, 'PENDING')
      setStatus('PENDING')
    }

    const generateStructuredData = () => {
      const baseUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL : 'https://exporteru.com'
      const hasDiscount = discount !== 0 && price !== discountedPrice && discountedPrice !== null

      return {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: title,
        image:
          typeof previewImageUrl === 'string'
            ? previewImageUrl.startsWith('http')
              ? previewImageUrl
              : `${baseUrl}${previewImageUrl}`
            : `${baseUrl}${t1}`,
        sku: `product-${id}`,
        identifier: {
          '@type': 'PropertyValue',
          name: 'Product ID',
          value: id.toString()
        },
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/card/${id}`,
          priceCurrency: fullProduct?.priceCurrency || 'RUB',
          price: hasDiscount ? discountedPrice : price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          ...(hasDiscount && {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: discountedPrice,
              priceCurrency: fullProduct?.priceCurrency || 'RUB',
              referencePrice: {
                '@type': 'UnitPriceSpecification',
                price: price,
                priceCurrency: fullProduct?.priceCurrency || 'RUB'
              }
            }
          })
        },
        ...(hasDiscount && {
          additionalProperty: {
            '@type': 'PropertyValue',
            name: 'Discount',
            value: `${discount}%`
          }
        })
      }
    }

    const deleteProduct = async (id: string) => {
      const loadingToast = toast.loading('processing...')
      try {
        const res = await instance.delete(`/products/${id}`)
        console.log(res)
        toast.dismiss(loadingToast)
        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('success')}</strong>
            <span>{t('successDel')}</span>
          </div>,
          {
            style: {
              background: '#2E7D32'
            }
          }
        )
      } catch (e) {
        console.log(e)
        toast.dismiss(loadingToast)
        toast.error(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('error')}</strong>
            <span>{t('errorDel')}</span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
      }
    }

    if (isLoading) {
      return (
        <div className={`${styles.card__box}`}>
          <div>
            <div className={`${styles.image__box}`}>
              <Skeleton className={`${styles.card__image__skeleton}`} count={1} />
              <Skeleton
                style={{
                  width: '20px',
                  height: '20px',
                  maxWidth: '20px',
                  marginLeft: 'auto',
                  borderRadius: '10px',
                  position: 'absolute',
                  content: '',
                  top: '10px',
                  right: '10px'
                }}
              />
            </div>
            <Skeleton count={2} style={{marginBottom: '7px', borderRadius: '6px'}} />
            <div className={`${styles.price__box}`}>
              <Skeleton style={{maxWidth: '140px', borderRadius: '6px'}} />
            </div>
          </div>
          <span style={{backgroundColor: 'transparent', border: 'none'}} className={`${styles.button__span}`}>
            <Skeleton style={{margin: '25px auto 0 auto', maxWidth: '250px', height: '32px', borderRadius: '20px'}} />
          </span>
        </div>
      )
    }

    const vendorLogin = fullProduct.user.login
    const vendorAddress = fullProduct.user.vendorDetails?.address
    const priceCurrency = fullProduct?.priceCurrency || 'RUB'
    const isInFavorite = productInFavorites.some((product) => product.id === (fullProduct.id ? fullProduct.id : {}))

    console.log(isInFavorite)

    return (
      <>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData())
          }}
        />
        {!onPreventCardClick && (
          <Link
            href={`/card/${id}`}
            className={`${styles.product_card} ${status === 'PENDING' ? styles.pending : ''}`}
            key={id + idFromHook}
            itemScope
            itemType='https://schema.org/Product'
          >
            <div className={`${styles.product_card__header}`}>
              <Image
                className={`${styles.product_card__image}`}
                src={previewImageUrl || t2}
                alt={`${t('cardImageAlt')} ${title}`}
                width={300}
                height={200}
                itemProp='image'
              />

              {+discount > 0 && <div className={`${styles.product_card__discount}`}>-{discount}%</div>}

              {!isForAdmin && status === 'PENDING' && <p className={styles.approveStatus__text}>{t(status)}</p>}

              {isForAdmin && (
                <div
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    hide()
                  }}
                  className={`${styles.approveStatus__drop} ${status === 'APPROVED' ? styles.approve__text : status === 'REJECTED' ? styles.reject__text : status === 'PENDING' ? styles.pending__text : ''}`}
                >
                  <DropList
                    color='#ffffff'
                    title={t(`${status || 'PENDING'}`) || t('PENDING')}
                    items={[
                      <div style={{color: '#000'}} onClick={() => approveProduct(id)} key='APPROVED'>
                        {t('APPROVED')}
                      </div>,
                      <div style={{color: '#000'}} onClick={() => rejectProduct(id)} key='REJECTED'>
                        {t('REJECTED')}
                      </div>,
                      <div style={{color: '#000'}} onClick={() => setPendingProduct(id)} key='PENDING'>
                        {t('PENDING')}
                      </div>
                    ]}
                  />
                </div>
              )}
            </div>

            <div className={`${styles.product_card__body}`}>
              <div className={`${styles.product_card__box}`}>
                <div className={`${styles.product_card__location}`}>
                  <svg className={`${styles.icon} ${styles.icon__location_f}`}>
                    <use href='/iconsNew/symbol/sprite.svg#location-f'></use>
                  </svg>
                  <span>
                    {vendorAddress} <span className={`${styles.sm_block}`}>“{vendorLogin}”</span>
                  </span>
                </div>
                <h3 className={`${styles.product_card__title}`} itemProp='name'>
                  {title}
                </h3>
              </div>

              <div className={`${styles.product_card__group}`}>
                <div className={`${styles.product_card__price}`} itemScope itemType='https://schema.org/Offer'>
                  <meta itemProp='priceCurrency' content={fullProduct?.priceCurrency || 'RUB'} />
                  <meta itemProp='availability' content='https://schema.org/InStock' />
                  <meta itemProp='url' content={`/card/${id}`} />

                  {+discount > 0 && (
                    <span className={`${styles.product_card__price_old}`}>
                      от{' '}
                      <s>
                        {price} {priceCurrency}
                      </s>
                    </span>
                  )}
                  <span className={`${styles.product_card__price_real}`}>
                    {discountedPrice} {priceCurrency}
                  </span>
                </div>

                {+discount > 0 && <div className={`${styles.product_card__discount}`}>-{discount}%</div>}

                <div data-likeID={fullProduct.id} className={`${styles.product_card__like}`}>
                  <button
                    className={`${styles.product_card__like} ${isInFavorite ? styles.active : ''}`}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      e.preventDefault()
                      toggleToFavorites(fullProduct as Product)
                    }}
                  >
                    <svg className={`${styles.icon} ${styles.icon__star_e}`}>
                      <use href='/iconsNew/symbol/sprite.svg#star-e'></use>
                    </svg>
                  </button>
                </div>

                {!isLoading && isShowButton && canUpdateProduct && (
                  <div className={`${styles.update__buttons__box} ${extraButtonsBoxClass}`}>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteProduct(id.toString())
                      }}
                      className={styles.deleate__button}
                    >
                      <svg width='17' height='19' viewBox='0 0 17 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                          d='M5.96204 2.75C6.32239 1.73046 7.29475 1 8.43767 1C9.5806 1 10.553 1.73046 10.9133 2.75'
                          stroke='#F4F7FF'
                          strokeWidth='1.3'
                          strokeLinecap='round'
                        />
                        <path d='M15.8751 4.5H1' stroke='#F4F7FF' strokeWidth='1.3' strokeLinecap='round' />
                        <path
                          d='M14.4166 6.6875L14.0141 12.7242C13.8592 15.0472 13.7818 16.2088 13.0249 16.9169C12.2681 17.625 11.104 17.625 8.77575 17.625H8.09911C5.77087 17.625 4.60677 17.625 3.84989 16.9169C3.09301 16.2088 3.01557 15.0472 2.8607 12.7242L2.45825 6.6875'
                          stroke='#F4F7FF'
                          strokeWidth='1.3'
                          strokeLinecap='round'
                        />
                        <path d='M6.25 8.875L6.6875 13.25' stroke='#F4F7FF' strokeWidth='1.3' strokeLinecap='round' />
                        <path
                          d='M10.625 8.875L10.1875 13.25'
                          stroke='#F4F7FF'
                          strokeWidth='1.3'
                          strokeLinecap='round'
                        />
                      </svg>
                    </button>

                    <Link href={`/create-card/${id}`} className={`${styles.button__span}`}>
                      {specialButtonText || t('edit')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}
      </>
    )
  }
)
Card.displayName = 'CardMemo'

export default Card
