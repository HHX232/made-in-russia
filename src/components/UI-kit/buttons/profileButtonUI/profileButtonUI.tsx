'use client'
import {CSSProperties, FC, useEffect, useState, useMemo, useCallback, useRef} from 'react'
import styles from './profileButtonUI.module.scss'
import Image from 'next/image'
import {useRouter} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {useNProgress} from '@/hooks/useProgress'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useUserCache, useUserQuery} from '@/hooks/useUserApi'
import {getAccessToken} from '@/services/auth/auth.helper'
import {useActions} from '@/hooks/useActions'
import {saveTokenStorage} from '@/middleware'

const ava = '/avatars/avatar-v.svg'
const ava1 = '/avatars/avatar-v-1.svg'
const ava2 = '/avatars/avatar-v-2.svg'
const ava3 = '/avatars/avatar-v-3.svg'
const ava4 = '/avatars/avatar-v-4.svg'
const ava5 = '/avatars/avatar-v-5.svg'
const ava6 = '/avatars/avatar-v-6.svg'
const ava7 = '/avatars/avatar-v-7.svg'
const ava8 = '/avatars/avatar-v-8.svg'
const ava9 = '/avatars/avatar-v-9.svg'
const userLogin2 = '/iconsNew/userNew.svg'
const avatarsArray = [ava, ava1, ava2, ava3, ava4, ava5, ava6, ava7, ava8, ava9]

interface IProfileProps {
  extraClass?: string
  extraStyles?: CSSProperties
}

const ProfileButtonUI: FC<IProfileProps> = ({extraClass, extraStyles}) => {
  const {user, isAuthenticated} = useTypedSelector((state) => state.user)
  const {clearUser} = useActions()
  const {removeUserFromCache} = useUserCache()
  const {data: queryUser, isLoading, error, isError} = useUserQuery()
  const didRun = useRef(false)

  const [randomAvatar, setRandomAvatar] = useState<string>(ava)

  const router = useRouter()
  const t = useTranslations('HomePage')
  const {start} = useNProgress()

  // читаем токены из query при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const accessFromQuery = url.searchParams.get('accessToken')
    const refreshFromQuery = url.searchParams.get('refreshToken')

    if (!!accessFromQuery && !!refreshFromQuery) {
      console.log('найден access token в ProfileButtonUI')
      saveTokenStorage({accessToken: accessFromQuery, refreshToken: refreshFromQuery})
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    setRandomAvatar(avatarsArray[0])

    const accessToken = getAccessToken()
    if (!accessToken) {
      console.log('не найден access token в ProfileButtonUI')
      if (typeof window !== 'undefined') {
        console.log('удаляем юзера и токены')
        removeUserFromCache()
        clearUser()
      }
    }
  }, [removeUserFromCache, clearUser])

  // Используем данные из React Query если есть, иначе из Redux
  const currentUser = queryUser || user

  const userName = useMemo(() => {
    if (!currentUser?.login) return null
    if (currentUser.login.length > 13) {
      return currentUser.login.substring(0, 12) + '...'
    }
    return currentUser.login
  }, [currentUser?.login])

  // Проверяем актуальное состояние: есть ли токен И (загружаются данные ИЛИ есть данные пользователя)
  const accessToken = getAccessToken()
  const hasValidToken = !!accessToken

  // Пользователь залогинен если:
  // 1. Есть токен
  // 2. И (данные загружаются ИЛИ уже есть данные пользователя)
  const isUserLoggedIn = hasValidToken && (isLoading || (isAuthenticated && !!currentUser?.login))

  const handleClick = useCallback(() => {
    start()
    // Проверяем актуальное состояние токенов прямо сейчас
    const currentToken = getAccessToken()
    const hasUser = !!(user?.login || queryUser?.login)

    if (!currentToken || !hasUser) {
      router.push('/login')
    } else {
      router.push('/profile')
    }
  }, [user?.login, queryUser?.login, router, start])

  // Показываем loading state только если есть токен и идёт загрузка
  if (isLoading && hasValidToken) {
    return (
      <div className={`${styles.profile_box} ${extraClass}`} style={extraStyles}>
        <div className={styles.loading}>
          <div className={styles.skeleton_avatar} />
          <div className={styles.skeleton_text} />
        </div>
      </div>
    )
  }

  if (isError && error) {
    console.error('User data loading error:', error)
  }

  return (
    <div
      id='cy-profile-button'
      onClick={handleClick}
      style={extraStyles}
      className={`${styles.profile_box} ${extraClass}`}
    >
      {isUserLoggedIn ? (
        <>
          <Image
            style={{borderRadius: '50%', aspectRatio: '1/1'}}
            className={styles.image}
            src={currentUser?.avatarUrl || randomAvatar}
            alt='Profile'
            width={28}
            height={28}
            priority
          />
          <p className={styles.profile_text}>{userName || 'User'}</p>
        </>
      ) : (
        <>
          <Image
            className={`${styles.image} ${styles.back_transparent}`}
            src={userLogin2}
            alt='Please login'
            width={28}
            height={28}
          />
          <p dangerouslySetInnerHTML={{__html: t('login')}} className={styles.profile_text}></p>
        </>
      )}
    </div>
  )
}

export default ProfileButtonUI
