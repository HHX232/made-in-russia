'use client'
import {useEffect, useState, useRef, useMemo} from 'react'
import Header from '@/components/MainComponents/Header/Header'
import styles from './CategoryPage.module.scss'
import Image from 'next/image'
import Catalog from '@/components/screens/Catalog/Catalog'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Category} from '@/services/categoryes/categoryes.service'

const CATEGORYESCONST = [
  {title: 'Однолетние культуры', value: 'Annual_crops', imageSrc: '/category/cat1.jpg'},
  {title: 'Многолетние культуры', value: 'Perennial_crops', imageSrc: '/category/cat2.jpg'},
  {title: 'Рассада', value: 'Seedlings', imageSrc: '/category/cat3.jpg'},
  {title: 'Животноводство', value: 'Livestock_farming', imageSrc: '/category/cat4.jpg'},
  {title: 'Смешанное сельское хозяйство', value: 'Mixed_farming', imageSrc: '/category/cat5.jpg'}
]
const CATEGORYES2CONST = [
  {
    title: 'Зерновые (кроме риса), зернобобовые культуры и семяна масличных культур',
    value: 'Cereals (except rice), legumes and oilseeds',
    imageSrc: ''
  },
  {title: 'Рис', value: 'Rice', imageSrc: ''},
  {
    title: 'Овощи, бахчевые, корнеплодные и клубнеплодные культуры, грибы и трюфеля',
    value: 'Vegetables, melons, root and tuber crops, mushrooms and truffles',
    imageSrc: ''
  },
  {title: 'Сахарный тростник', value: 'Sugar cane', imageSrc: ''},
  {title: 'Табак и махорка', value: 'Tobacco and makhorka', imageSrc: ''},
  {title: 'Волокнистые прядильные культуры', value: 'Fiber spinning crops', imageSrc: ''},
  {title: 'Прочие однолетние культуры', value: 'Other annual crops', imageSrc: ''},
  {title: 'Виноград', value: 'Grapes', imageSrc: ''},
  {title: 'Тропические и субтропические культуры', value: 'Tropical and subtropical crops', imageSrc: ''},
  {title: 'Цитрусовые культуры', value: 'Citrus crops', imageSrc: ''},
  {title: 'Семечковые и косточковые культуры', value: 'Pome and stone fruits', imageSrc: ''},
  {title: 'Прочие плодовые деревья, кустарники и орехи', value: 'Other fruit trees, shrubs and nuts', imageSrc: ''},
  {title: 'Плоды масличных культур', value: 'Oil fruit crops', imageSrc: ''},
  {title: 'Культуры для производства напитков', value: 'Beverage crops', imageSrc: ''},
  {
    title: 'Специи, пряно-ароматические, эфиромасличные и лекарственные культуры',
    value: 'Spices, aromatic, essential oil and medicinal crops',
    imageSrc: ''
  },
  {title: 'Прочие многолетние культуры', value: 'Other perennial crops', imageSrc: ''},
  {title: 'Молочный крупный рогатый скот, сырое молоко', value: 'Dairy cattle, raw milk', imageSrc: ''},
  {
    title: 'Прочие породы крупного рогатого скота и буйволов, производство спермы',
    value: 'Other cattle and buffalo breeds, semen production',
    imageSrc: ''
  },
  {
    title: 'Лошади и прочие животные семейства лошадиных отряда непарнокопытных',
    value: 'Horses and other equine animals of the order Perissodactyla',
    imageSrc: ''
  },
  {title: 'Верблюды и прочие животные семейства верблюжьих', value: 'Camels and other camelids', imageSrc: ''},
  {title: 'Овцы и козы', value: 'Sheep and goats', imageSrc: ''},
  {title: 'Свиньи', value: 'Pigs', imageSrc: ''},
  {title: 'Сельскохозяйственная птица', value: 'Poultry', imageSrc: ''},
  {title: 'Прочие животные', value: 'Other animals', imageSrc: ''},
  {title: 'Олени', value: 'Deer', imageSrc: ''}
]

const CategoryPage = ({
  categoryName,
  level = 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parentCategory,
  categories = []
}: {
  categoryName: string
  level?: number
  parentCategory?: string
  categories?: Category[]
}) => {
  const [sortedCategories, setSortedCategories] = useState<Category[]>(categories)
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const pathname = usePathname()

  // Мемоизируем строковое представление категорий для сравнения
  const categoriesKey = useMemo(() => {
    return JSON.stringify(categories.map((cat) => cat.id || cat.slug))
  }, [categories])

  useEffect(() => {
    if (level === 2 && listRef.current && categories.length > 0) {
      // Даем время для рендеринга элементов
      const timeoutId = setTimeout(() => {
        const measurements = itemRefs.current
          .filter((ref) => ref !== null)
          .map((ref, index) => {
            if (!ref || !categories[index]) return null
            const width = ref.getBoundingClientRect().width
            return {
              index,
              width,
              category: categories[index]
            }
          })
          .filter((item) => item !== null)

        // Сортируем от меньшей ширины к большей
        const sorted = measurements.sort((a, b) => {
          if (!a || !b) return 0
          return a.width - b.width
        })

        // Обновляем порядок категорий
        const newOrder = sorted.map((item) => item?.category).filter((cat): cat is Category => cat !== undefined)

        if (newOrder.length > 0) {
          setSortedCategories(newOrder)
        }
      }, 100)

      // Очищаем таймаут при размонтировании или изменении зависимостей
      return () => clearTimeout(timeoutId)
    } else {
      // Для level !== 2 или когда нет необходимости в сортировке
      setSortedCategories(categories)
    }
  }, [level, categoryName, categoriesKey]) // Используем categoriesKey вместо categories

  // Используем sortedCategories для отображения
  const categoriesToDisplay = sortedCategories

  // Функция для построения правильного href
  const buildHref = (category: Category) => {
    if (level === 1) {
      // Для первого уровня: /categories/{categoryName}/{slug}
      return `/categories/${categoryName}/${category.slug.toLowerCase()}`
    } else {
      // Для второго уровня используем текущий pathname и добавляем к нему новую категорию
      return `${pathname}/${category.slug.toLowerCase()}`
    }
  }

  return (
    <div>
      <Header />
      <div className='container'>
        <div className={styles.category__inner}>
          {level < 3 && (
            <h1 className={styles.category__title__main}>
              {categoryName.slice(0, 1).toUpperCase() + categoryName.slice(1).replace(/_/g, ' ').replace(/%20/g, ' ')}
            </h1>
          )}
          {level === 3 && (
            <h1 style={{marginBottom: '0'}} className={styles.category__title__main}>
              Каталог
            </h1>
          )}
          {level < 3 && categoriesToDisplay.length > 0 && (
            <ul
              ref={listRef}
              className={`${styles.category__list} ${level === 2 ? styles.category__list__second : ''}`}
            >
              {categoriesToDisplay.map((category, index) => (
                <Link key={category.id || category.slug} href={buildHref(category)}>
                  <li
                    ref={(el) => {
                      if (level === 2) {
                        itemRefs.current[index] = el
                      }
                    }}
                    className={`${styles.category__item} ${level === 2 ? styles.category__item__second : ''}`}
                  >
                    <p
                      className={`${styles.category__item__title} ${level === 2 ? styles.category__item__title__second : ''}`}
                    >
                      {category.name}
                    </p>
                    {category.image && (
                      <Image
                        className={styles.category__item__image}
                        src={category.image}
                        alt={category.name}
                        width={300}
                        height={150}
                      />
                    )}
                    {!category.image && level === 1 && CATEGORYESCONST[index] && (
                      <Image
                        className={styles.category__item__image}
                        src={CATEGORYESCONST[index].imageSrc}
                        alt={category.name}
                        width={300}
                        height={150}
                      />
                    )}
                  </li>
                </Link>
              ))}
            </ul>
          )}
          {level === 2 && categoriesToDisplay.length == 0 && (
            <ul
              ref={listRef}
              className={`${styles.category__list} ${level === 2 ? styles.category__list__second : ''}`}
            >
              {CATEGORYES2CONST.map((category, index) => (
                <Link
                  key={category.value}
                  href={buildHref({
                    children: [],
                    creationDate: '',
                    id: index,
                    lastModificationDate: '',
                    name: category.title,
                    slug: category.value
                  })}
                >
                  <li
                    ref={(el) => {
                      if (level === 2) {
                        itemRefs.current[index] = el
                      }
                    }}
                    className={`${styles.category__item} ${level === 2 ? styles.category__item__second : ''}`}
                  >
                    <p
                      className={`${styles.category__item__title} ${level === 2 ? styles.category__item__title__second : ''}`}
                    >
                      {category.title}
                    </p>
                    {category.imageSrc && (
                      <Image
                        className={styles.category__item__image}
                        src={category.imageSrc}
                        alt={category.title}
                        width={300}
                        height={150}
                      />
                    )}
                  </li>
                </Link>
              ))}
            </ul>
          )}
          <Catalog initialProducts={[]} initialHasMore={true} />
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
