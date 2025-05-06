'use client'
import {FC, useState} from 'react'
import styles from './profileButtonUI.module.scss'
import Image from 'next/image'

const someAvatar = '/some_avatar.png'
const userLogin = '/man_login.svg'
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
          <Image className={`${styles.image}`} src={someAvatar} alt='' width={28} height={28}></Image>
          <p className={`${styles.profile_text}`}>Genadiy </p>
        </>
      ) : (
        <>
          <Image className={`${styles.image}`} src={userLogin} alt='please login image' width={28} height={28} />
          <p className={`${styles.profile_text}`}>Войти </p>
        </>
      )}
    </div>
  )
}

export default ProfileButtonUI
