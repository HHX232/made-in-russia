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

// Опции для фильтров
// const ROLE_OPTIONS = [
//   {value: '', label: 'Все роли'},
//   {value: 'user', label: 'Покупатели'},
//   {value: 'admin', label: 'Админы'},
//   {value: 'vendor', label: 'Продавцы'}
// ]

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSort,
    refreshUsers
  } = useUsers(instance, 10)

  // Локальные состояния для поиска и фильтров
  const [searchValue, setSearchValue] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('Без фильтров')

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

  return (
    <div className={styles.admin__users__page}>
      <p className={styles.users__title}>Пользователи</p>

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
        <div className={styles.users__actions__create}>Создать</div>

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
