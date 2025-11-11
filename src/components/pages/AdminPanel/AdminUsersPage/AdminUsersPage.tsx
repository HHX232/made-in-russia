/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useState, useRef, useEffect, useMemo} from 'react'
import styles from './AdminUsersPage.module.scss'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import Skeleton from 'react-loading-skeleton'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import instance from '@/api/api.interceptor'
import useUsers from './useUsers'
import UserRow from './components/UserRole'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {User} from '@/store/User/user.slice'
import MultiDropSelect from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'

const TIME_FILTER_OPTIONS = [
  {label: 'Без фильтров', value: undefined},
  {label: 'Сначала новые', value: 'desc'},
  {label: 'Сначала старые', value: 'asc'}
]

type CreateUserData = {
  login: string
  email: string
  password: string
  phoneNumber: string
  region: string
  role: User['role']
  inn?: string
  countries?: string[]
  productCategories?: string[]
}

export interface Category {
  id: number
  slug: string
  name: string
  imageUrl?: string
  children: Category[]
  okved?: string[] | null
  childrenCount?: number
  creationDate: string
  lastModificationDate: string
}

export type MultiSelectOption = {
  id?: number | string
  value: string
  label: string
  imageUrl?: string
  children?: MultiSelectOption[]
}

// Утилита для удаления дубликатов
function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr))
}

// Построение опций из категорий
function buildOptionsFromCategories(categories: Category[]): MultiSelectOption[] {
  const recur = (nodes: Category[]): MultiSelectOption[] =>
    nodes.map((c) => ({
      id: c.id,
      value: c.name,
      label: c.name,
      imageUrl: c.imageUrl,
      children: c.children ? recur(c.children) : undefined
    }))
  return recur(categories)
}

// Плоский список всех опций
function flattenOptions(options: MultiSelectOption[]): MultiSelectOption[] {
  const out: MultiSelectOption[] = []
  const walk = (nodes: MultiSelectOption[]) => {
    nodes.forEach((n) => {
      out.push(n)
      if (n.children?.length) walk(n.children)
    })
  }
  walk(options)
  return out
}

const LoadMoreTrigger: FC<{onLoadMore: () => void; hasMore: boolean}> = ({onLoadMore, hasMore}) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!hasMore) {
      setIsVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Intersection Observer: Элемент попал в зону видимости (500px от низа экрана)')
            onLoadMore()
          }
        })
      },
      {
        rootMargin: '0px 0px 500px 0px',
        threshold: 0.1
      }
    )

    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current)
      }
    }
  }, [onLoadMore, hasMore])

  if (!isVisible || !hasMore) return null

  return (
    <div ref={triggerRef} className={styles.load__more__trigger}>
      <div className={styles.load__more__content}>
        <p className={styles.load__more__text}>Подгружаем больше пользователей...</p>
        <button
          className={styles.load__more__button}
          onClick={() => {
            console.log('Ручной дозапрос пользователей')
            onLoadMore()
          }}
        >
          Сделать дозапрос
        </button>
      </div>
    </div>
  )
}

const AdminUsersPage: FC = () => {
  const allTitles = ['ID', 'Имя', 'Почта', 'Страна', 'Роль', 'Изменить']

  const {
    users,
    loading,
    error,
    filters,
    totalElements,
    hasNextPage,
    loadMoreUsers,
    setFilters,
    setSort,
    clearFilters,
    refreshUsers
  } = useUsers(instance, 10)

  const [searchValue, setSearchValue] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('Без фильтров')
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Без фильтров')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createData, setCreateData] = useState<CreateUserData>({
    login: '',
    email: '',
    password: '',
    phoneNumber: '',
    region: 'Russia',
    role: 'User',
    inn: '',
    countries: ['Russia'],
    productCategories: []
  })
  const [activeImages, setActiveImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['Russia'])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [timeFilter, setTimeFilter] = useState<'asc' | 'desc' | undefined>(undefined)

  // Построение опций для MultiDropSelect
  const options = useMemo(() => buildOptionsFromCategories(categories), [categories])
  const flatOptions = useMemo(() => flattenOptions(options), [options])

  // Выбранные опции для MultiDropSelect
  const selectedOptions: MultiSelectOption[] = useMemo(() => {
    return selectedCategories
      .map((name) => flatOptions.find((o) => o.label === name || o.value === name))
      .filter((o): o is MultiSelectOption => o !== undefined)
  }, [selectedCategories, flatOptions])

  useEffect(() => {
    const fetchCategories = async () => {
      if (createData.role === 'Vendor' && categories.length === 0) {
        try {
          const categoriesRussian = await CategoriesService.getAll('ru')
          setCategories(categoriesRussian)
        } catch (error) {
          console.error('Ошибка загрузки категорий:', error)
        }
      }
    }

    fetchCategories()
  }, [createData.role, categories.length])

  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (value.trim()) {
      setFilters({login: value.trim()})
    } else {
      setFilters({login: undefined})
    }
  }

  const handleRoleFilter = (filterValue: string) => {
    setSelectedRoleFilter(filterValue)

    switch (filterValue) {
      case 'Админы':
        setFilters({role: 'admin'})
        break
      case 'Покупатели':
        setFilters({role: 'user'})
        break
      case 'Продавцы':
        setFilters({role: 'vendor'})
        break
      default:
        setFilters({role: undefined})
        break
    }
  }

  const handleTimeFilter = (filterValue: string) => {
    setSelectedTimeFilter(filterValue)

    const selectedOption = TIME_FILTER_OPTIONS.find((option) => option.label === filterValue)
    const direction = selectedOption?.value

    setTimeFilter(direction as any)

    if (direction) {
      setSort('registrationDate', direction as any)
    } else {
      setSort('registrationDate', undefined)
    }
  }

  const handleUpdateUser = async (userId: number, updates: User) => {
    try {
      console.log(`Обновление пользователя ${userId}:`, updates)
      await instance.put(`/user/${userId}`, {
        email: updates.email,
        region: updates.region,
        login: updates.login,
        phoneNumber: updates.phoneNumber
      })
      await refreshUsers()
    } catch (err) {
      console.error('Ошибка обновления пользователя:', err)
    }
  }

  const handleUpdateRole = async (userId: number, newRole: User['role']) => {
    try {
      await instance.patch(`/user/${userId}/role`, {
        role: newRole
      })
      await refreshUsers()
    } catch {
      console.error('ошибка при изменении роли пользователя')
    }
  }

  const handleLoadMore = async () => {
    try {
      loadMoreUsers()
    } catch (err) {
      console.error('Ошибка дозагрузки пользователей:', err)
    }
  }

  const handleCreateUser = async () => {
    if (!createData.login.trim() || !createData.email.trim() || !createData.password.trim()) {
      alert('Заполните обязательные поля')
      return
    }

    try {
      setCreateLoading(true)

      if (createData.role === 'Vendor') {
        await instance.post('/auth/force-register-vendor', {
          email: createData.email,
          login: createData.login,
          password: createData.password,
          phoneNumber: createData.phoneNumber,
          inn: createData.inn,
          countries: selectedCountries || 'Russia',
          productCategories: selectedCategories
        })
      } else {
        await instance.post('/auth/force-register', {
          email: createData.email,
          login: createData.login,
          password: createData.password,
          region: createData.region,
          phoneNumber: createData.phoneNumber
        })
      }

      setCreateData({
        login: '',
        email: '',
        password: '',
        phoneNumber: '',
        region: '',
        role: 'User',
        inn: '',
        countries: ['Russia'],
        productCategories: []
      })
      setSelectedCountries(['Russia'])
      setSelectedCategories([])
      setActiveImages([])
      setIsCreateModalOpen(false)

      await refreshUsers()
    } catch (error) {
      console.error('Ошибка создания пользователя:', error)
      alert('Произошла ошибка при создании пользователя')
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    if (createData.role !== 'Vendor') {
      setSelectedCountries(['Russia'])
      setSelectedCategories([])
      setCreateData((prev) => ({
        ...prev,
        inn: '',
        countries: ['Russia'],
        productCategories: []
      }))
    }
  }, [createData.role])

  return (
    <div className={styles.admin__users__page}>
      <p className={styles.users__title}>Пользователи</p>

      <ModalWindowDefault
        extraClass={styles.create__modal}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <h3 className={styles.modal__title}>Создание пользователя</h3>

        <div className={styles.modal__avatar__section}>
          <CreateImagesInput
            onFilesChange={(files) => {
              console.log('Загружены файлы:', files)
            }}
            maxFiles={1}
            inputIdPrefix='create-user'
            activeImages={activeImages}
            onActiveImagesChange={setActiveImages}
          />
        </div>

        <div className={styles.modal__form}>
          <TextInputUI
            placeholder='Логин'
            currentValue={createData.login}
            onSetValue={(value) => setCreateData((prev) => ({...prev, login: value}))}
            theme='superWhite'
            extraClass={styles.form__input}
          />

          <TextInputUI
            placeholder='Email'
            currentValue={createData.email}
            onSetValue={(value) => setCreateData((prev) => ({...prev, email: value}))}
            theme='superWhite'
            extraClass={styles.form__input}
          />

          <TextInputUI
            placeholder='Пароль'
            currentValue={createData.password}
            onSetValue={(value) => setCreateData((prev) => ({...prev, password: value}))}
            theme='superWhite'
            extraClass={styles.form__input}
          />

          <TextInputUI
            placeholder='Номер телефона'
            currentValue={createData.phoneNumber}
            onSetValue={(value) => setCreateData((prev) => ({...prev, phoneNumber: value}))}
            theme='superWhite'
            extraClass={styles.form__input}
          />

          <div className={styles.modal__dropdowns}>
            <DropList
              direction='right'
              trigger='click'
              safeAreaEnabled
              positionIsAbsolute={true}
              title={createData.role}
              color='white'
              extraStyle={{
                backgroundColor:
                  createData.role.toLowerCase() === 'user'
                    ? '#1FC13A'
                    : createData.role.toLowerCase() === 'admin'
                      ? '#ECC414'
                      : '#C8313E'
              }}
              extraClass={`${styles.modal__dropdown} ${styles.modal__dropdown__list__extra__user}`}
              items={[
                <p onClick={() => setCreateData((prev) => ({...prev, role: 'User'}))} key={1}>
                  User
                </p>,
                <p onClick={() => setCreateData((prev) => ({...prev, role: 'Admin'}))} key={2}>
                  Admin
                </p>,
                <p onClick={() => setCreateData((prev) => ({...prev, role: 'Vendor'}))} key={3}>
                  Vendor
                </p>
              ]}
            />
          </div>

          {createData.role === 'Vendor' && (
            <>
              <TextInputUI
                placeholder='ИНН'
                currentValue={createData.inn || ''}
                onSetValue={(value) => setCreateData((prev) => ({...prev, inn: value}))}
                theme='superWhite'
                extraClass={styles.form__input}
              />

              {categories.length > 0 && (
                <div style={{zIndex: '100000'}} className={styles.multi__select__section}>
                  <h4>Категории товаров:</h4>
                  <MultiDropSelect
                    extraDropListClass={styles.extra_extraDropListClass}
                    showSearchInput
                    isOnlyShow={false}
                    extraClass={styles.profile__region__dropdown__extra}
                    options={options as any}
                    isCategories={true}
                    selectedValues={selectedOptions as any}
                    onChange={(values: MultiSelectOption[]) => {
                      const names = dedupe(values.map((v) => v.label || v.value).filter(Boolean))
                      setSelectedCategories(names)
                    }}
                    placeholder={'Выберите категории товаров'}
                    direction={'bottom'}
                  />
                </div>
              )}
            </>
          )}

          <div className={styles.modal__actions}>
            <div className={styles.modal__main__actions}>
              <button
                className={`${styles.modal__button} ${styles.cancel__button}`}
                onClick={() => setIsCreateModalOpen(false)}
                disabled={createLoading}
              >
                Отмена
              </button>

              <button
                className={`${styles.modal__button} ${styles.save__button}`}
                onClick={handleCreateUser}
                disabled={createLoading}
              >
                {createLoading ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      </ModalWindowDefault>

      {error && (
        <div className={styles.error__message}>
          Ошибка: {error}
          <button onClick={refreshUsers} className={styles.retry__button}>
            Повторить
          </button>
        </div>
      )}

      <div className={styles.users__actions}>
        <TextInputUI
          extraClass={styles.search__user}
          placeholder='Имя...'
          currentValue={searchValue}
          onSetValue={handleSearch}
          theme='superWhite'
        />
        <DropList
          direction='bottom'
          extraListClass={styles.extra__list__style}
          extraClass={styles.drop__list__extra}
          positionIsAbsolute
          title={selectedRoleFilter}
          items={['Без фильтров', 'Админы', 'Покупатели', 'Продавцы'].map((item) => (
            <p onClick={() => handleRoleFilter(item)} key={item}>
              {item}
            </p>
          ))}
        />

        <DropList
          direction='bottom'
          extraListClass={styles.extra__list__style}
          extraClass={styles.drop__list__extra}
          positionIsAbsolute
          title={selectedTimeFilter}
          items={TIME_FILTER_OPTIONS.map((option) => (
            <p onClick={() => handleTimeFilter(option.label)} key={option.label}>
              {option.label}
            </p>
          ))}
        />
        <div className={styles.users__actions__create} onClick={() => setIsCreateModalOpen(true)}>
          Создать
        </div>
        <div className={styles.users__count}>Найдено: {totalElements} пользователей</div>
      </div>

      <div className={styles.users__table}>
        <div className={styles.table__titles}>
          {allTitles.map((title) => (
            <div key={title}>{title}</div>
          ))}
        </div>
        <div className={styles.table__rows}>
          {!loading &&
            users.map((user) => (
              <UserRow
                user={user}
                instance={instance}
                key={user.id}
                onUpdateRole={handleUpdateRole}
                onUpdateUser={handleUpdateUser}
              />
            ))}

          {!loading && users.length === 0 && (
            <div className={styles.no__users}>
              <p>Пользователи не найдены</p>
              {Object.keys(filters).length > 0 && (
                <button onClick={clearFilters} className={styles.clear__filters__button}>
                  Очистить фильтры
                </button>
              )}
            </div>
          )}

          {loading &&
            [1, 2, 3, 4, 5].map((i) => {
              return <Skeleton className={styles.user__row__skeleton} key={i} width={'100%'} height={80} />
            })}

          {!loading && users.length > 0 && <LoadMoreTrigger onLoadMore={handleLoadMore} hasMore={hasNextPage} />}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
