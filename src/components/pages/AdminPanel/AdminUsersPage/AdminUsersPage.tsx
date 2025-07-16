'use client'
import {FC, useState} from 'react'
import styles from './AdminUsersPage.module.scss'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import {User} from '@/services/users.types'
import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'

const trashImage = '/admin/trash.svg'
const editImage = '/admin/edit.svg'
const assets_avatar = '/avatars/avatar-v.svg'
const MOCK_USERS: User[] = [
  {
    id: 1,
    role: 'User',
    email: 'user@example.com',
    login: 'john_doe',
    phoneNumber: '+79123456789',
    region: 'Belarus',
    registrationDate: '2025-05-04T09:17:20.767615Z',
    lastModificationDate: '2025-05-04T09:17:20.767615Z',
    avatar: '/avatars/avatar-v.svg'
  },
  {
    id: 2,
    role: 'User',
    email: 'user@example.com',
    login: 'john_doe',
    phoneNumber: '+79123456789',
    region: 'Russia',
    registrationDate: '2025-05-04T09:17:20.767615Z',
    lastModificationDate: '2025-05-04T09:17:20.767615Z',
    avatar: '/avatars/avatar-v.svg'
  },
  {
    id: 3,
    role: 'User',
    email: 'user@example.com',
    login: 'john_doe',
    phoneNumber: '+79123456789',
    region: 'China',
    registrationDate: '2025-05-04T09:17:20.767615Z',
    lastModificationDate: '2025-05-04T09:17:20.767615Z',
    avatar: '/avatars/avatar-v.svg'
  }
]

const UserRow: FC<{user: User}> = ({user}) => {
  const [activeCountry, setActiveCountry] = useState(user.region)
  const [activeRole, setActiveRole] = useState(user.role)

  return (
    <div className={styles.user__row}>
      <div className={`${styles.id__text}`}>{user.id}</div>
      <div className={`${styles.login__box}`}>
        <div
          style={{backgroundImage: `url(${user.avatar ? user.avatar : assets_avatar})`}}
          className={`${styles.avatar}`}
        ></div>
        <div className={`${styles.login__text}`}>{user.login}</div>
      </div>
      <div className={`${styles.email__text}`}>{user.email}</div>

      {/* <div>{user.phoneNumber}</div> */}
      <DropList
        direction='bottom'
        trigger='hover'
        safeAreaEnabled
        positionIsAbsolute={false}
        title={activeCountry}
        extraClass={styles.drop__list__extra__country}
        items={[
          <p onClick={() => setActiveCountry('Belarus')} key={1}>
            Belarus
          </p>,
          <p onClick={() => setActiveCountry('Russia')} key={2}>
            Russia
          </p>,
          <p onClick={() => setActiveCountry('China')} key={3}>
            China
          </p>
        ]}
      />
      <DropList
        direction='bottom'
        trigger='hover'
        safeAreaEnabled
        positionIsAbsolute={false}
        title={activeRole}
        color='white'
        extraStyle={{
          backgroundColor: activeRole === 'User' ? '#2AD246' : activeRole === 'Admin' ? '#EFC81C' : '#C8313E'
        }}
        extraClass={styles.drop__list__extra__role}
        items={[
          <p className={styles.drop__list__extra__role__item} onClick={() => setActiveRole('User')} key={1}>
            User
          </p>,
          <p className={styles.drop__list__extra__role__item} onClick={() => setActiveRole('Admin')} key={2}>
            Admin
          </p>,
          <p className={styles.drop__list__extra__role__item} onClick={() => setActiveRole('Vendor')} key={3}>
            Vendor
          </p>
        ]}
      />
      <div className={styles.user__edits}>
        <div className={styles.deleat__button}>
          <Image src={trashImage} alt='trash' width={15} height={17} />
        </div>
        <div className={styles.edit__button}>
          <Image src={editImage} alt='edit' width={15} height={17} />
        </div>
      </div>
    </div>
  )
}
const AdminUsersPage: FC = () => {
  const allTitles = ['ID', 'Имя', 'Почта', 'Страна', 'Роль', 'Изменить']
  const [usersLoading, setUsersLoading] = useState(false)
  return (
    <div className={styles.admin__users__page}>
      <p className={styles.users__title}>Пользователи</p>
      <div className={styles.users__actions}>
        <TextInputUI
          extraClass={styles.search__user}
          placeholder='Имя...'
          currentValue=''
          onSetValue={() => {}}
          theme='superWhite'
        />
        <DropList
          direction='bottom'
          extraListClass={styles.extra__list__style}
          extraClass={styles.drop__list__extra}
          positionIsAbsolute
          title='Без фильтров'
          items={['Без фильтров', 'Админы', 'Покупатели', 'Продавцы']}
        />
        <div className={styles.users__actions__create}>Создать</div>
      </div>
      <div className={styles.users__table}>
        <div className={styles.table__titles}>
          {allTitles.map((title) => (
            <div key={title}>{title}</div>
          ))}
        </div>
        <div className={styles.table__rows}>
          {!usersLoading && MOCK_USERS.map((user) => <UserRow user={user} key={user.id} />)}
          {usersLoading &&
            [1, 2, 3, 4, 5].map((i) => {
              return <Skeleton className={styles.user__row__skeleton} key={i} width={'10vw'} height={80} />
            })}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
