import React, {useState, useRef} from 'react'
import Image from 'next/image'
import styles from './Avatar.module.scss'
import {getAccessToken} from '@/services/auth/auth.helper'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'

interface AvatarProps {
  avatarUrl?: string
  onAvatarChange?: (newAvatarUrl: string | null) => void
}

const Avatar: React.FC<AvatarProps> = ({avatarUrl, onAvatarChange}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localAvatar, setLocalAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('ProfilePage')
  const defaultAvatar = '/avatars/avatar-v-2.svg'
  const displayAvatar = localAvatar || avatarUrl || defaultAvatar
  const hasAvatar = Boolean(localAvatar || avatarUrl)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Валидация типа файла
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert('Поддерживаются только JPEG и PNG файлы')
      return
    }

    // Валидация размера файла (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB')
      return
    }

    // Создаем локальный URL для предварительного просмотра
    const localUrl = URL.createObjectURL(file)
    setLocalAvatar(localUrl)

    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/me/avatar`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: formData
      })

      if (response.ok) {
        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('congratulations')}</strong>
            <span>{t('createAvatarSuccess')}</span>
          </div>,
          {
            style: {
              background: '#2E7D32'
            }
          }
        )
        const data = await response.json()
        // Предполагаем, что сервер возвращает URL нового аватара
        const newAvatarUrl = data.avatarUrl || data.avatar

        // Освобождаем локальный URL
        if (localAvatar) {
          URL.revokeObjectURL(localAvatar)
        }

        setLocalAvatar(null)
        onAvatarChange?.(newAvatarUrl)
      } else {
        toast.error(
          <div style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>{t('dataErrorChange')}</strong>
            <span>{t('createAvatarError')}</span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
        throw new Error('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      // Убираем локальный аватар при ошибке
      if (localAvatar) {
        URL.revokeObjectURL(localAvatar)
        setLocalAvatar(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAvatar = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/me/avatar`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      })

      if (response.ok) {
        setLocalAvatar(null)
        onAvatarChange?.(null)
        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('congratulations')}</strong>
            <span>{t('deleteAvatarSuccess')}</span>
          </div>,
          {
            style: {
              background: '#2E7D32'
            }
          }
        )
      } else {
        throw new Error('Failed to delete avatar')
      }
    } catch (error) {
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('dataErrorChange')}</strong>
          <span>{t('deleteAvatarError')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      console.error('Error deleting avatar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (isLoading) return

    if (hasAvatar) {
      deleteAvatar()
    } else {
      fileInputRef.current?.click()
    }
  }

  return (
    <div
      className={styles.avatar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Image width={60} height={60} src={displayAvatar} alt='avatar' className={styles.avatar__image} />

      {(isHovered || isLoading) && (
        <div className={styles.avatar__overlay}>
          {isLoading ? (
            <div className={styles.avatar__spinner} />
          ) : (
            <div className={styles.avatar__icon}>{hasAvatar ? '−' : '+'}</div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/jpg,image/png'
        onChange={handleFileSelect}
        className={styles.avatar__input}
      />
    </div>
  )
}

export default Avatar
