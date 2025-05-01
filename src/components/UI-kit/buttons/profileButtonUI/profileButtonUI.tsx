'use client'
import {FC, useState} from 'react'
import styles from './profileButtonUI.module.scss'
import user_login from '@/assets/images/man_login.svg'
import some_avatar from '@/assets/images/some_avatar.png'
// import no_avatar from '@/assets/images/not_have_avatar.svg'
import Image from 'next/image'

const ProfileButtonUI: FC = () => {
  const [userIsLogin, setUserIsLogin] = useState(false)

  return (
    <div
      onClick={() => {
        setUserIsLogin(!userIsLogin)
      }}
      className={`${styles.profile_box}`}
    >
      {userIsLogin ? (
        <>
          <Image className={`${styles.image}`} src={some_avatar} alt='' width={28} height={28}></Image>
          <p className={`${styles.profile_text}`}>Genadiy </p>
        </>
      ) : (
        <>
          <Image className={`${styles.image}`} src={user_login} alt='please login image' width={28} height={28} />
          <p className={`${styles.profile_text}`}>Войти </p>
        </>
      )}
    </div>
  )
}

export default ProfileButtonUI
