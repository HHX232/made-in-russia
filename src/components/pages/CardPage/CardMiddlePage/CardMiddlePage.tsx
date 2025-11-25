'use client'
import {FC} from 'react'
import styles from './CardMiddlePage.module.scss'
// import StringDescriptionGroup from '@/components/UI-kit/Texts/StringDescriptionGroup/StringDescriptionGroup'
// import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import ICardFull from '@/services/card/card.types'
import {useTranslations} from 'next-intl'
import ShowMarkdown from '@/components/UI-kit/Texts/ShowMarkdown/ShowMarkdown'
import MarkdownEditor from '@/components/UI-kit/MDEditor/MarkdownEditor'

const CardMiddlePage: FC<{isLoading: boolean; cardData: ICardFull}> = ({isLoading, cardData}) => {
  const t = useTranslations('CardMiddlePage')
  return (
    <div className={`${styles.card__middle__box}`}>
      <div className={`${styles.descr__box}`}>
        <div className={`${styles.mark__span__box}`}>
          <h3 id='description__title__id' style={{marginBottom: '15px'}} className={`${styles.card__middle__title}`}>
            {t('description')}
          </h3>
          {/* {!isLoading ? (
            <StringDescriptionGroup
              extraBoxClass={`${styles.extra__group__class}`}
              titleFontSize='16'
              listGap='20'
              items={cardData.characteristics.map((el) => ({title: el.name, value: el.value}))}
              titleMain={t('technicalCharacteristics')}
            />
          ) : (
            <></>
          )} */}
          {!isLoading ? (
            <>
              <MarkdownEditor
                extraPreviewClass={styles.extra__prev__md}
                readOnly
                initialValue={cardData.mainDescription}
                extraClass={styles.margin__bottom__mark}
              />
            </>
          ) : (
            <>
              {' '}
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton height={29} count={1} />
            </>
          )}
          {!isLoading ? <ShowMarkdown markValue={cardData.furtherDescription} /> : <></>}
        </div>
        <div className={styles.all__info__box}>
          <div className={styles.about__vendor}>
            <h3 className={styles.vendor__title}>{t('locationInfo')}</h3>
            <div className={styles.vendor__box__location}>
              <div className={styles.loc__box}>
                <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M15.9998 17.9067C18.2973 17.9067 20.1598 16.0442 20.1598 13.7467C20.1598 11.4492 18.2973 9.58667 15.9998 9.58667C13.7023 9.58667 11.8398 11.4492 11.8398 13.7467C11.8398 16.0442 13.7023 17.9067 15.9998 17.9067Z'
                    stroke='#0047BA'
                    strokeWidth='1.5'
                  />
                  <path
                    d='M4.8266 11.32C7.45327 -0.226643 24.5599 -0.21331 27.1733 11.3334C28.7066 18.1067 24.4933 23.84 20.7999 27.3867C18.1199 29.9734 13.8799 29.9734 11.1866 27.3867C7.5066 23.84 3.29327 18.0934 4.8266 11.32Z'
                    stroke='#0047BA'
                    strokeWidth='1.5'
                  />
                </svg>
                <p className={styles.location__text}>{cardData?.user?.vendorDetails?.address || t('emptyAddress')}</p>
              </div>
            </div>
          </div>

          {cardData?.deliveryMethodsDetails && cardData?.deliveryMethodsDetails?.length !== 0 && (
            <div className={styles.about__vendor}>
              <h3 className={styles.vendor__title}>{t('deliveryDescription')}</h3>
              <div className={styles.vendor__box__del__info}>
                <ul className={styles.del__list}>
                  {cardData.deliveryMethodsDetails?.map((el, i) => (
                    <li className={styles.del__list__item} key={i}>
                      <p>{el.name}</p>
                      <p>{el.value + ' ' + t('days', {count: el.value})}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardMiddlePage
