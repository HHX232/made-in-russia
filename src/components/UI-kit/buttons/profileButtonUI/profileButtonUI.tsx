'use client'
import {CSSProperties, FC, useEffect, useState, useMemo} from 'react'
import styles from './profileButtonUI.module.scss'
import Image from 'next/image'
import {getAccessToken, getRefreshToken, removeFromStorage, saveTokenStorage} from '@/services/auth/auth.helper'
import instance, {axiosClassic} from '@/api/api.interceptor'
import {useRouter} from 'next/navigation'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {useNProgress} from '@/hooks/useProgress'

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

interface User {
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
  avatar: string
}

interface IProfileProps {
  extraClass?: string
  extraStyles?: CSSProperties
}

const ProfileButtonUI: FC<IProfileProps> = ({extraClass, extraStyles}) => {
  const [userData, setUserData] = useState<User>()
  const [randomAvatar, setRandomAvatar] = useState<string>(ava)
  const [userName, setUserName] = useState<null | string>(null)
  const router = useRouter()
  const t = useTranslations('HomePage')
  const currentLang = useCurrentLanguage()
  const {start} = useNProgress()
  useEffect(() => {
    setRandomAvatar(avatarsArray[0])
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const getData = async () => {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        console.log('Нет  рефреш токена')
        return
      }
      if (!accessToken) {
        console.log('Нет  рефреш токена')
        return
      }

      try {
        // console.log('accessToken', accessToken, 'refreshToken', refreshToken)
        const response = await instance.get<User>('/me', {
          headers: {
            'Accept-Language': currentLang
          }
        })
        setUserData(response.data)
      } catch (error) {
        console.error('Failed to fetch user data:', error)

        if (!refreshToken) {
          removeFromStorage()
          return
        }

        try {
          const {data: tokenData} = await axiosClassic.patch<{
            accessToken: string
          }>(
            '/me/current-session/refresh',
            {refreshToken},
            {
              headers: {
                'Accept-Language': currentLang
              }
            }
          )

          // console.log('NEW tokenData', tokenData)
          saveTokenStorage({
            accessToken: tokenData.accessToken,
            refreshToken: refreshToken
          })

          const response = await instance.get<User>('/me', {
            headers: {
              'Accept-Language': currentLang
            }
          })
          setUserData(response.data)
          // console.log('мы сохранили новые токены')
        } catch (e) {
          console.error('Failed to refresh token:', e)
          // console.log('сейчас мы удалили токены')
          removeFromStorage()
        }
      }
    }

    getData()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!!userData?.login) {
      if (userData?.login?.length > 13) {
        const truncatedLogin = userData.login.substring(0, 12) + '...'
        setUserName(truncatedLogin)
      } else if (userData?.login) {
        setUserName(userData.login)
      }
    }
  }, [userData?.login])
  const imageSrc = useMemo(() => {
    return userData?.avatar?.trim() ? userData.avatar : randomAvatar
  }, [userData?.avatar, randomAvatar])

  return (
    <div
      id='cy-profile-button'
      onClick={() => {
        start()
        if (!userData?.login) {
          router.push('/login')
        } else {
          router.push('/profile')
        }
      }}
      style={{...extraStyles}}
      className={`${styles.profile_box} ${extraClass}`}
    >
      {userData?.login && (
        <>
          <Image className={styles.image} src={imageSrc} alt='Profile' width={28} height={28} priority />
          <p className={styles.profile_text}>{userName || 'User'}</p>
        </>
      )}
      {!userData?.login && (
        <>
          <Image className={styles.image} src={userLogin} alt='Please login' width={28} height={28} />
          <p className={styles.profile_text}>{t('login')}</p>
        </>
      )}
    </div>
  )
}

export default ProfileButtonUI
