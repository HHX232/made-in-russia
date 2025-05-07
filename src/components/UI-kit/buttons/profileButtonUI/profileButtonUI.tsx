'use client'
import {CSSProperties, FC, useState} from 'react'
import styles from './profileButtonUI.module.scss'
import Image from 'next/image'

const someAvatar = '/some_avatar.png'
const userLogin = '/man_login.svg'

interface IProfileProps {
  extraClass?: string
  extraStyles?: CSSProperties
}
const ProfileButtonUI: FC<IProfileProps> = ({extraClass, extraStyles}) => {
  const [userIsLogin, setUserIsLogin] = useState(false)

  return (
    <div
      style={{...extraStyles}}
      onClick={() => {
        setUserIsLogin(!userIsLogin)
      }}
      className={`${styles.profile_box} ${extraClass}`}
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
