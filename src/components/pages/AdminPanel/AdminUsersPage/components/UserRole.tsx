import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import {User} from '@/services/users.types'
import {FC, useState} from 'react'
import styles from '../AdminUsersPage.module.scss'
import Image from 'next/image'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'

const REGION_OPTIONS = ['Belarus', 'Russia', 'China', 'USA', 'Germany', 'France']
const trashImage = '/admin/trash.svg'
const editImage = '/admin/edit.svg'
const assets_avatar = '/avatars/avatar-v.svg'

type UserEditData = {
  login: string
  email: string
  phoneNumber: string
  region: string
  role: User['role']
}

const UserRow: FC<{
  user: User
  onUpdateUser?: (userId: number, updates: User) => void
  onUpdateRole?: (userId: number, newRole: User['role']) => void
  onDeleteUser?: (userId: number) => void
  onBanUser?: (userId: number) => void
  onUnbanUser?: (userId: number) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance?: any // API instance для запросов
}> = ({user, onUpdateUser, onUpdateRole, onDeleteUser, onBanUser, onUnbanUser, instance}) => {
  const [activeCountry, setActiveCountry] = useState(user.region)
  const [activeRole, setActiveRole] = useState(user.role)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editData, setEditData] = useState<UserEditData>({
    login: '',
    email: '',
    phoneNumber: '',
    region: '',
    role: 'User'
  })
  const [activeImages, setActiveImages] = useState<string[]>([])

  const handleCountryChange = (newCountry: string) => {
    setActiveCountry(newCountry)
    onUpdateUser?.(user.id, {...user, region: newCountry})
  }

  const handleRoleChange = (newRole: string) => {
    setActiveRole(newRole)
    console.log('новая роль', newRole)
    onUpdateRole?.(user.id, newRole as User['role'])
  }

  const handleDeleteUser = async () => {
    if (!instance) return

    const confirmDelete = window.confirm('Вы уверены, что хотите удалить этого пользователя?')
    if (!confirmDelete) return

    try {
      setIsLoading(true)
      await instance.delete(`/user/${user.id}`)
      onDeleteUser?.(user.id)
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error)
      alert('Произошла ошибка при удалении пользователя')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!instance) return

    try {
      setIsLoading(true)
      const response = await instance.get(`/user/${user.id}`)
      const userData = response.data

      setEditData({
        login: userData.login || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        region: userData.region || '',
        role: userData.role || 'User'
      })
      setIsEditModalOpen(true)
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error)
      alert('Произошла ошибка при загрузке данных пользователя')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = () => {
    const updatedUser: User = {
      ...user,
      login: editData.login,
      email: editData.email,
      phoneNumber: editData.phoneNumber,
      region: editData.region,
      role: editData.role
    }

    onUpdateUser?.(user.id, updatedUser)
    setActiveCountry(editData.region)
    setActiveRole(editData.role)
    setIsEditModalOpen(false)
  }

  const handleBanToggle = async () => {
    if (!instance) return

    try {
      setIsLoading(true)
      const isBanned = user.role === 'Banned' // предполагаем что забаненные имеют статус 'Banned'

      if (isBanned) {
        await instance.patch(`/user/${user.id}/unban`)
        onUnbanUser?.(user.id)
      } else {
        await instance.patch(`/user/${user.id}/ban`)
        onBanUser?.(user.id)
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса бана:', error)
      alert('Произошла ошибка при изменении статуса пользователя')
    } finally {
      setIsLoading(false)
    }
  }

  const isBanned = !user.isEnabled

  return (
    <div className={styles.user__row}>
      <ModalWindowDefault
        extraClass={styles.edit__modal}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        {/* <div className={styles.modal__content}> */}
        <h3 className={styles.modal__title}>Редактирование пользователя</h3>

        <div className={styles.modal__avatar__section}>
          <CreateImagesInput
            onFilesChange={(files) => {
              // Обработка загрузки аватара
              console.log('Загружены файлы:', files)
            }}
            maxFiles={1}
            inputIdPrefix={`user-${user.id}`}
            activeImages={activeImages}
            onActiveImagesChange={setActiveImages}
          />
        </div>

        <div className={styles.modal__form}>
          <TextInputUI
            placeholder='Логин'
            currentValue={editData.login}
            onSetValue={(value) => setEditData((prev) => ({...prev, login: value}))}
            theme='superWhite'
            extraClass={styles.form__input}
          />

          <TextInputUI
            placeholder='Email'
            currentValue={editData.email}
            onSetValue={(value) => setEditData((prev) => ({...prev, email: value}))}
            theme='superWhite'
            extraClass={styles.form__input}
          />

          <TextInputUI
            placeholder='Номер телефона'
            currentValue={editData.phoneNumber}
            onSetValue={(value) => setEditData((prev) => ({...prev, phoneNumber: value}))}
            theme='superWhite'
            extraClass={styles.form__input}
          />

          {/* <div className={styles.modal__dropdowns}>
              <DropList
                direction='bottom'
                trigger='hover'
                safeAreaEnabled
                positionIsAbsolute={false}
                title={editData.region}
                extraClass={styles.modal__dropdown}
                items={REGION_OPTIONS.map((region) => (
                  <p onClick={() => setEditData((prev) => ({...prev, region}))} key={region}>
                    {region}
                  </p>
                ))}
              />

              <DropList
                direction='bottom'
                trigger='hover'
                safeAreaEnabled
                positionIsAbsolute={false}
                title={editData.role}
                color='white'
                extraStyle={{
                  backgroundColor:
                    editData.role.toLowerCase() === 'user'
                      ? '#1FC13A'
                      : editData.role.toLowerCase() === 'admin'
                        ? '#ECC414'
                        : '#C8313E'
                }}
                extraClass={styles.modal__dropdown}
                items={[
                  <p onClick={() => setEditData((prev) => ({...prev, role: 'User'}))} key={1}>
                    User
                  </p>,
                  <p onClick={() => setEditData((prev) => ({...prev, role: 'Admin'}))} key={2}>
                    Admin
                  </p>,
                  <p onClick={() => setEditData((prev) => ({...prev, role: 'Vendor'}))} key={3}>
                    Vendor
                  </p>
                ]}
              />
            </div> */}

          <div className={styles.modal__actions}>
            <button
              className={`${styles.modal__button} ${styles.ban__button} ${isBanned ? styles.unban : styles.ban}`}
              onClick={handleBanToggle}
              disabled={isLoading}
            >
              {isBanned ? 'Разбанить' : 'Забанить'}
            </button>

            <div className={styles.modal__main__actions}>
              <button
                className={`${styles.modal__button} ${styles.cancel__button}`}
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
              >
                Отмена
              </button>

              <button
                className={`${styles.modal__button} ${styles.save__button}`}
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
        {/* </div> */}
      </ModalWindowDefault>

      <div className={`${styles.id__text}`}>{user.id}</div>
      <div className={`${styles.login__box}`}>
        <div
          style={{backgroundImage: `url(${user.avatar ? user.avatar : assets_avatar})`}}
          className={`${styles.avatar}`}
        ></div>
        <div className={`${styles.login__text}`}>{user.login}</div>
      </div>
      <div className={`${styles.email__text}`}>{user.email}</div>

      <DropList
        direction='bottom'
        trigger='hover'
        safeAreaEnabled
        positionIsAbsolute={false}
        title={activeCountry}
        extraClass={styles.drop__list__extra__country}
        items={REGION_OPTIONS.map((region) => (
          <p onClick={() => handleCountryChange(region)} key={region}>
            {region}
          </p>
        ))}
      />
      <DropList
        direction='bottom'
        trigger='hover'
        safeAreaEnabled
        positionIsAbsolute={false}
        title={activeRole}
        color='white'
        extraStyle={{
          backgroundColor:
            activeRole.toLowerCase() === 'user'
              ? '#1FC13A'
              : activeRole.toLowerCase() === 'admin'
                ? '#ECC414'
                : activeRole.toLowerCase() === 'banned'
                  ? '#666666'
                  : '#C8313E'
        }}
        extraClass={styles.drop__list__extra__role}
        items={[
          <p className={styles.drop__list__extra__role__item} onClick={() => handleRoleChange('User')} key={1}>
            User
          </p>,
          <p className={styles.drop__list__extra__role__item} onClick={() => handleRoleChange('Admin')} key={2}>
            Admin
          </p>,
          <p className={styles.drop__list__extra__role__item} onClick={() => handleRoleChange('Vendor')} key={3}>
            Vendor
          </p>
        ]}
      />
      <div className={styles.user__edits}>
        <div className={`${styles.deleat__button} ${isLoading ? styles.loading : ''}`} onClick={handleDeleteUser}>
          <Image src={trashImage} alt='trash' width={15} height={17} />
        </div>
        <div className={`${styles.edit__button} ${isLoading ? styles.loading : ''}`} onClick={handleEditUser}>
          <Image src={editImage} alt='edit' width={15} height={17} />
        </div>
      </div>
    </div>
  )
}

export default UserRow
