'use client'
import {FC, useEffect} from 'react'
import styles from './CardMiddlePage.module.scss'
import StringDescriptionGroup from '@/components/UI-kit/Texts/StringDescriptionGroup/StringDescriptionGroup'
// import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import ICardFull from '@/services/card/card.types'
import {useTranslations} from 'next-intl'
import ShowMarkdown from '@/components/UI-kit/Texts/ShowMarkdown/ShowMarkdown'

const CardMiddlePage: FC<{isLoading: boolean; cardData: ICardFull}> = ({isLoading, cardData}) => {
  useEffect(() => {
    // console.log('cardData in middle', cardData)
  }, [cardData])
  const t = useTranslations('CardPage.CardMiddlePage')
  return (
    <div className={`${styles.card__middle__box}`}>
      <h3 id='description__title__id' style={{marginBottom: '15px'}} className={`${styles.card__middle__title}`}>
        {t('description')}
      </h3>
      <div className={`${styles.descr__box}`}>
        <div className={`${styles.mark__span__box}`}>
          {!isLoading ? (
            <ShowMarkdown markValue={cardData.mainDescription} />
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
          {!isLoading ? (
            <StringDescriptionGroup
              extraBoxClass={`${styles.extra__group__class}`}
              titleFontSize='16'
              listGap='20'
              items={cardData.characteristics.map((el) => ({title: el.name, value: el.value}))}
              titleMain={t('technicalCharacteristics')}
            />
          ) : (
            <></>
          )}
          {!isLoading ? <ShowMarkdown markValue={cardData.furtherDescription} /> : <></>}
        </div>
        {/* <div className={`${styles.spec__description__box}`}>
          {!isLoading ? (
            <h3 className={`${styles.spec__description__title}`}>{t('companyDescription')}</h3>
          ) : (
            <Skeleton height={29} count={1} style={{marginBottom: '15px'}} />
          )}
          {!isLoading ? (
            <p className={`${styles.spec__description__text}`}>{cardData.aboutVendor?.mainDescription}</p>
          ) : (
            <Skeleton height={100} count={1} style={{marginBottom: '15px'}} />
          )}
          <ul className={`${styles.spec__description__images__box}`}>
            {cardData.aboutVendor?.media?.map((el, index) => (
              <li className={`${styles.spec__description__list_item}`} key={index}>
                {!isLoading ? (
                  el.url.includes('mov') || el.url.includes('mp4') ? (
                    <div className={styles.videoContainer}>
                      <video
                        src={el.url}
                        autoPlay
                        controls={false}
                        loop
                        muted
                        playsInline
                        preload='metadata'
                        className={`${styles.spec__description__list_item__image} ${styles.video}`}
                      />
                    </div>
                  ) : (
                    <Image
                      className={`${styles.spec__description__list_item__image}`}
                      src={el.url}
                      alt=''
                      width={170}
                      height={170}
                    />
                  )
                ) : (
                  <Skeleton style={{width: 100000, maxWidth: '170px', marginBottom: '10px'}} height={110} />
                )}
                {!isLoading ? (
                  <p className={`${styles.spec__description__list_item__image__text}`}>{el.altText} </p>
                ) : (
                  <Skeleton style={{width: 100000, maxWidth: '170px'}} height={20} />
                )}
              </li>
            ))}
          </ul>
          {!isLoading ? (
            <p className={`${styles.spec__description__text}`}>{cardData.aboutVendor?.furtherDescription}</p>
          ) : (
            <Skeleton height={20} count={5} />
          )}
        </div> */}
      </div>
    </div>
  )
}

export default CardMiddlePage
