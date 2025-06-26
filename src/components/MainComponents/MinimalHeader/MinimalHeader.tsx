'use client'
import Image from 'next/image'
import styles from './MinimalHeader.module.scss'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'
import CategoryesMenuDesktop from '@/components/UI-kit/elements/CategoryesMenuDesktop/CategoryesMenuDesktop'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'

const logoFavBig = '/logos/logoWithoutText.svg'
const MinimalHeader = ({categories}: {categories?: Category[]}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [linksItems, setLinksItems] = useState(['Категории', 'Отзывы', 'Доставка', 'О нас', 'Помощь'])
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [categoryListIsOpen, setCategoryListIsOpen] = useState<boolean>(false)
  const fullHeaderRef = useRef<HTMLDivElement>(null)
  const categoryListRefDesktop = useRef<HTMLDivElement>(null)
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories || [])

  useEffect(() => {
    async function rrrr() {
      const res = await CategoriesService.getAll()
      setCategoriesList(res)
    }
    rrrr()
  }, [])

  // Обработчик клика вне области меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryListIsOpen &&
        categoryListRefDesktop.current &&
        !categoryListRefDesktop.current.contains(event.target as Node)
      ) {
        setCategoryListIsOpen(false)
      }
    }

    // Добавляем слушатель события
    document.addEventListener('mousedown', handleClickOutside)

    // Удаляем слушатель при размонтировании компонента
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [categoryListIsOpen])

  return (
    <div ref={fullHeaderRef} className={`${styles.header__box} `}>
      <div className={`${styles.container__inner} container`}>
        <Link href={'/'} className={`${styles.logo__box}`}>
          <Image
            className={`${styles.bear__img}`}
            alt='Logo with Bear'
            src={logoFavBig}
            width={286}
            height={65}
            itemProp='logo'
          />{' '}
          {/* <Image src={logoText} width={172} height={41} alt='logo Made In Russia' /> */}
        </Link>
        <ul className={`${styles.header__list} ${styles.header__list__big}`}>
          {linksItems.map((el, i) => {
            return (
              <li
                onClick={() => {
                  if (i === 0) {
                    setCategoryListIsOpen((prev) => !prev)
                    // console.log(categoryListIsOpen)
                  }

                  // console.log('message')
                }}
                key={i}
                className={`${styles.header__list__item}`}
              >
                <Link href={'#'}>{el}</Link>
              </li>
            )
          })}
        </ul>
        <div className={`${styles.burger__menu} `}>
          <div
            onClick={() => {
              setMenuIsOpen((prev) => !prev)
            }}
            className={`${styles.burger}`}
          >
            <div className={`${styles.burger__item}`}></div>
            <div className={`${styles.burger__item}`}></div>
            <div className={`${styles.burger__item}`}></div>
          </div>
          <div className={`${styles.burger__menu__list} ${menuIsOpen ? styles.burger__menu__list__active : ''}`}>
            <ul className={`${styles.header__list} ${styles.header__list__mini}`}>
              {linksItems.map((el, i) => {
                return (
                  <li
                    onClick={() => {
                      if (i === 0) {
                        setCategoryListIsOpen((prev) => !prev)
                        setMenuIsOpen(false)
                        // console.log(categoryListIsOpen)
                      }

                      // console.log('message')
                    }}
                    key={i}
                    className={`${styles.header__list__item}`}
                  >
                    <Link href={'#'}>{el}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
      {categoryListIsOpen && (
        <div
          style={{
            position: 'absolute',
            width: '100vw',
            top: fullHeaderRef.current?.offsetHeight,
            minHeight: 'fit-content',
            // 100vh
            height: `calc(80vh - ${fullHeaderRef.current?.offsetHeight}px)`,
            background: '#FFF',

            left: '0',
            zIndex: '1000000'
          }}
          ref={categoryListRefDesktop}
          className={`${styles.category__list__bottom__desktop}`}
        >
          <div className='container'>
            {/* Строка с крестиком справа */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '10px',
                paddingBottom: '0'
              }}
            >
              <button
                onClick={() => setCategoryListIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  padding: '10px',
                  color: '#333',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                aria-label='Закрыть меню категорий'
              >
                ✕
              </button>
            </div>
            <CategoryesMenuDesktop setCategoryListIsOpen={setCategoryListIsOpen} categories={categoriesList} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MinimalHeader
