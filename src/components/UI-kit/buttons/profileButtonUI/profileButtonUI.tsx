'use client'
import {CSSProperties, FC, useEffect, useState, useMemo, useCallback} from 'react'
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
const userLogin = '/man_login.svg'
const avatarsArray = [ava, ava1, ava2, ava3, ava4, ava5, ava6, ava7, ava8, ava9]

interface IProfileProps {
  extraClass?: string
  extraStyles?: CSSProperties
}

const ProfileButtonUI: FC<IProfileProps> = ({extraClass, extraStyles}) => {
  const {user, isAuthenticated} = useTypedSelector((state) => state.user)
  const {clearUser} = useActions()
  const {removeUserFromCache} = useUserCache()
  const accessToken = getAccessToken()
  const {isLoading, error, isError} = useUserQuery()

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

    if (accessFromQuery && refreshFromQuery) {
      saveTokenStorage({accessToken: accessFromQuery, refreshToken: refreshFromQuery})
      // можно сразу очистить query из адреса:
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    setRandomAvatar(avatarsArray[0])
    if (!accessToken) {
      removeUserFromCache()
      clearUser()
    }
  }, [accessToken, removeUserFromCache, clearUser])

  const userName = useMemo(() => {
    if (!user?.login) return null
    if (user.login.length > 13) {
      return user.login.substring(0, 12) + '...'
    }
    return user.login
  }, [user?.login])

  const handleClick = useCallback(() => {
    start()
    if (!isAuthenticated || !user?.login) {
      router.push('/login')
    } else {
      router.push('/profile')
    }
  }, [isAuthenticated, user?.login, router, start])

  if (isLoading) {
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
      {isAuthenticated && user?.login ? (
        <>
          <Image
            style={{borderRadius: '50%', aspectRatio: '1/1'}}
            className={styles.image}
            src={user?.avatarUrl || randomAvatar}
            alt='Profile'
            width={28}
            height={28}
            priority
          />
          <p className={styles.profile_text}>{userName || 'User'}</p>
        </>
      ) : (
        <>
          <Image className={styles.image} src={userLogin} alt='Please login' width={28} height={28} />
          <p className={styles.profile_text}>{t('login')}</p>
        </>
      )}
    </div>
  )
}

export default ProfileButtonUI
