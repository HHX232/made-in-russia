'use client'
import {FC, useState} from 'react'
import {useKeenSlider} from 'keen-slider/react'
import styles from './AdvantagesSection.module.scss'

interface Advantage {
  id: number
  count: string
  text: string
  imageUrl: string
}

const advantages: Advantage[] = [
  {
    id: 1,
    count: '01',
    text: 'Прямые контракты с проверенными производителями',
    imageUrl: '/imagesNew/main/main-3-1.webp'
  },
  {
    id: 2,
    count: '02',
    text: 'Доступ к широкому каталогу товаров из России',
    imageUrl: '/imagesNew/main/main-3-2.webp'
  },
  {
    id: 3,
    count: '03',
    text: 'Единый канал для закупки из разных отраслей и регионов России',
    imageUrl: '/imagesNew/main/main-3-3.webp'
  },
  {
    id: 4,
    count: '04',
    text: 'Эксклюзивные условия и квоты от производителей для партнёров',
    imageUrl: '/imagesNew/main/main-3-4.webp'
  },
  {
    id: 5,
    count: '05',
    text: 'Снижение затрат на закупки и валютные риски',
    imageUrl: '/imagesNew/main/main-3-5.webp'
  }
]

const AdvantagesSection: FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 1.5,
      spacing: 20
    },
    loop: false,
    mode: 'snap',
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    breakpoints: {
      '(min-width: 768px)': {
        slides: {
          perView: 2,
          spacing: 20
        }
      },
      '(min-width: 450px)': {
        slides: {
          perView: 1.5,
          spacing: 20
        }
      },
      '(min-width: 1024px)': {
        slides: {
          perView: 3,
          spacing: 20
        }
      }
    }
  })

  const isBeginning = currentSlide === 0
  const isEnd = instanceRef.current ? currentSlide >= instanceRef.current.track.details.maxIdx : false

  return (
    <section className={`section ${styles.advantages}`}>
      <h2 className={styles['visually-hidden']}>Преимущества работы с нами</h2>
      <div className='container'>
        <div className={styles.advantages__grid}>
          {/* Первый блок - заголовок и описание */}
          <div className={styles['advantages__grid-item']}>
            <div className={styles.advantages__flex}>
              <div className={styles.advantages__title}>Преимущества работы с нами</div>
              <p className={styles.advantages__description}>
                Почему выбирают нас? <br className='desktop-vs' />
                Потому что мы делаем <br className='desktop-vs' />
                сложное - простым,
                <br className='desktop-vs' />а надежное - доступным!
              </p>
            </div>
          </div>

          {/* Второй блок - слайдер с карточками */}
          <div className={styles['advantages__grid-item']}>
            {/* Навигация */}
            <div className={styles.advantages__navigation}>
              <div className={styles['advantages__navigation-wrap']}>
                <div
                  className={`${styles.arrow} ${styles.arrow__left} ${isBeginning && styles.arrow_disabled}`}
                  onClick={() => instanceRef.current?.prev()}
                />
                <div
                  className={`${styles.arrow} ${styles.arrow__right} ${isEnd && styles.arrow_disabled}`}
                  onClick={() => instanceRef.current?.next()}
                />
              </div>
            </div>

            {/* Слайдер */}
            <div ref={sliderRef} className={`keen-slider ${styles[`keen-slider__slide__spec`]}`}>
              {advantages.map((advantage) => (
                <div key={advantage.id} className='keen-slider__slide '>
                  <div className={styles['advantages-card']}>
                    <div className={styles['advantages-card__count']}>{advantage.count}</div>
                    <div className={styles['advantages-card__group']}>
                      <p className={styles['advantages-card__text']}>{advantage.text}</p>
                      <div className={styles['advantages-card__image']}>
                        <img src={advantage.imageUrl} alt={advantage.text} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdvantagesSection
