import React, {useState, useRef} from 'react'
import Image from 'next/image'
import styles from './Avatar.module.scss'
import {getAccessToken} from '@/services/auth/auth.helper'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'
import {useUserCache, useUserQuery} from '@/hooks/useUserApi'

interface AvatarProps {
  avatarUrl?: string
  isOnlyShow?: boolean
  onAvatarChange?: (newAvatarUrl: string | null) => void
}

const Avatar: React.FC<AvatarProps> = ({avatarUrl, onAvatarChange, isOnlyShow = false}) => {
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

  const {invalidateUser} = useUserCache()
  const {refetch} = useUserQuery()
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
        // Сервер возвращает только 200, поэтому оставляем локальный аватар
        // Локальный URL остается в localAvatar для отображения
        // При перезагрузке страницы аватар будет загружен с сервера через avatarUrl prop

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

        // Уведомляем родительский компонент, что аватар был загружен
        // Передаем специальный флаг или текущий localAvatar
        onAvatarChange?.(localAvatar)
        await invalidateUser()
        await refetch()
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
      // Очищаем input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
        // Освобождаем локальный URL если он есть
        if (localAvatar) {
          URL.revokeObjectURL(localAvatar)
        }

        // Очищаем все состояние аватара
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

  // Очистка URL при размонтировании компонента
  React.useEffect(() => {
    return () => {
      if (localAvatar) {
        URL.revokeObjectURL(localAvatar)
      }
    }
  }, [localAvatar])

  return (
    <div
      className={styles.avatar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{pointerEvents: isOnlyShow ? 'none' : 'auto'}}
    >
      <Image
        width={60}
        height={60}
        src={displayAvatar}
        alt='avatar'
        className={styles.avatar__image}
        // Добавляем key для принудительного обновления изображения
        key={displayAvatar}
      />

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
