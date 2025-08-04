'use client'
import {FC, useState, useRef, useEffect} from 'react'
import styles from './AdminUsersPage.module.scss'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import {User} from '@/services/users.types'
import Skeleton from 'react-loading-skeleton'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import instance from '@/api/api.interceptor'
import useUsers from './useUsers'
import UserRow from './components/UserRole'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import CategoriesService from '@/services/categoryes/categoryes.service'

const REGION_OPTIONS = ['Belarus', 'Russia', 'China', 'Kazakhstan']

type CreateUserData = {
  login: string
  email: string
  password: string
  phoneNumber: string
  region: string
  role: User['role']
  // Дополнительные поля для вендора
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
  creationDate: string
  lastModificationDate: string
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
        rootMargin: '0px 0px 500px 0px', // 500px от низа экрана
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

  // Используем наш хук для управления пользователями
  const {
    users,
    loading,
    error,
    filters,
    totalElements,
    hasNextPage,
    loadMoreUsers,
    setFilters,
    clearFilters,
    refreshUsers
  } = useUsers(instance, 10)

  // Локальные состояния для поиска и фильтров
  const [searchValue, setSearchValue] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('Без фильтров')

  // Состояния для создания пользователя
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createData, setCreateData] = useState<CreateUserData>({
    login: '',
    email: '',
    password: '',
    phoneNumber: '',
    region: '',
    role: 'User',
    inn: '',
    countries: [],
    productCategories: []
  })
  const [activeImages, setActiveImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Загрузка категорий при открытии модалки для вендора
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

  // Обработка поиска
  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (value.trim()) {
      setFilters({login: value.trim()})
    } else {
      setFilters({login: undefined})
    }
  }

  // Обработка фильтра по роли
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

  // Обработка обновления пользователя
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

  // Обработка дозагрузки пользователей
  const handleLoadMore = async () => {
    try {
      await loadMoreUsers()
    } catch (err) {
      console.error('Ошибка дозагрузки пользователей:', err)
    }
  }

  // Обработка создания пользователя
  const handleCreateUser = async () => {
    if (!createData.login.trim() || !createData.email.trim() || !createData.password.trim()) {
      alert('Заполните обязательные поля')
      return
    }

    try {
      setCreateLoading(true)

      if (createData.role === 'Vendor') {
        // Создание вендора
        await instance.post('/auth/force-register-vendor', {
          email: createData.email,
          login: createData.login,
          password: createData.password,
          phoneNumber: createData.phoneNumber,
          inn: createData.inn,
          countries: selectedCountries,
          productCategories: selectedCategories
        })
      } else {
        // Создание обычного пользователя
        await instance.post('/auth/force-register', {
          email: createData.email,
          login: createData.login,
          password: createData.password,
          region: createData.region,
          phoneNumber: createData.phoneNumber
        })
      }

      // Сброс формы
      setCreateData({
        login: '',
        email: '',
        password: '',
        phoneNumber: '',
        region: '',
        role: 'User',
        inn: '',
        countries: [],
        productCategories: []
      })
      setSelectedCountries([])
      setSelectedCategories([])
      setActiveImages([])
      setIsCreateModalOpen(false)

      // Обновляем список пользователей
      await refreshUsers()
    } catch (error) {
      console.error('Ошибка создания пользователя:', error)
      alert('Произошла ошибка при создании пользователя')
    } finally {
      setCreateLoading(false)
    }
  }

  // Сброс данных формы при изменении роли
  useEffect(() => {
    if (createData.role !== 'Vendor') {
      setSelectedCountries([])
      setSelectedCategories([])
      setCreateData((prev) => ({
        ...prev,
        inn: '',
        countries: [],
        productCategories: []
      }))
    }
  }, [createData.role])

  const toggleCountrySelection = (country: string) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    )
  }

  return (
    <div className={styles.admin__users__page}>
      <p className={styles.users__title}>Пользователи</p>

      {/* Модальное окно создания пользователя */}
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

          {/* Выбор роли */}
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

          {/* Поля для обычных пользователей */}
          {createData.role !== 'Vendor' && (
            <DropList
              direction='right'
              extraStyle={{
                maxWidth: 'fit-content'
              }}
              trigger='click'
              safeAreaEnabled
              positionIsAbsolute={false}
              extraListClass={styles.modal__dropdown__list__extra}
              title={createData.region || 'Выберите регион'}
              extraClass={styles.modal__dropdown}
              items={REGION_OPTIONS.map((region) => (
                <p onClick={() => setCreateData((prev) => ({...prev, region}))} key={region}>
                  {region}
                </p>
              ))}
            />
          )}

          {/* Дополнительные поля для вендора */}
          {createData.role === 'Vendor' && (
            <>
              <TextInputUI
                placeholder='ИНН'
                currentValue={createData.inn || ''}
                onSetValue={(value) => setCreateData((prev) => ({...prev, inn: value}))}
                theme='superWhite'
                extraClass={styles.form__input}
              />

              {/* Выбор стран */}
              <div className={styles.multi__select__section}>
                <h4>Страны работы:</h4>
                <div className={styles.multi__select__grid}>
                  {REGION_OPTIONS.map((country) => (
                    <label key={country} className={styles.checkbox__item}>
                      <input
                        type='checkbox'
                        checked={selectedCountries.includes(country)}
                        onChange={() => toggleCountrySelection(country)}
                      />
                      <span>{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Выбор категорий */}
              {categories.length > 0 && (
                <div className={styles.multi__select__section}>
                  <h4>Категории товаров:</h4>
                  <div className={styles.multi__select__grid}>
                    {categories.map((category) => (
                      <label key={category.id} className={styles.checkbox__item}>
                        <input
                          type='checkbox'
                          checked={selectedCategories.includes(category.id.toString())}
                          onChange={() => toggleCategorySelection(category.id.toString())}
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
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

      {/* Показываем ошибку если есть */}
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
        <div className={styles.users__actions__create} onClick={() => setIsCreateModalOpen(true)}>
          Создать
        </div>

        {/* Информация о количестве пользователей */}
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

          {/* Intersection Observer триггер */}
          {!loading && users.length > 0 && <LoadMoreTrigger onLoadMore={handleLoadMore} hasMore={hasNextPage} />}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
