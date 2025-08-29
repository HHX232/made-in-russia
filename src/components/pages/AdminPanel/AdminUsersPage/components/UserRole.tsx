// path: src/components/AdminUsersPage/UserRow.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import {FC, useEffect, useMemo, useState} from 'react'
import styles from '../AdminUsersPage.module.scss'
import Image from 'next/image'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'
import {User} from '@/store/User/user.slice'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import MultiDropSelect from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'

const REGION_OPTIONS = ['Belarus', 'Russia', 'China', 'Kazakhstan']
const trashImage = '/admin/trash.svg'
const editImage = '/admin/edit.svg'
const assets_avatar = '/avatars/avatar-v.svg'

type UserEditData = {
  login: string
  email: string
  phoneNumber: string
  region: string
  role: User['role']
  inn?: string
  description?: string
  countries?: string[]
  productCategories?: string[]
  sites?: string[]
  phoneNumbers?: string[]
  emails?: string[]
}

// ---- helpers (типо‑гвард, нормализация) ----
function notNull<T>(v: T | null | undefined): v is T {
  return v != null
}

// MultiSelectOption по структуре MultiDropSelect
export type MultiSelectOption = {
  id?: number | string
  value: string
  label: string
  imageUrl?: string
  children?: MultiSelectOption[]
}

function buildOptionsFromCategories(categories: Category[]): MultiSelectOption[] {
  const recur = (nodes: Category[]): MultiSelectOption[] =>
    nodes.map((c) => ({
      id: c.id,
      value: c.name, // работаем по name
      label: c.name,
      imageUrl: c.imageUrl,
      children: c.children ? recur(c.children) : undefined
    }))
  return recur(categories)
}

function flattenOptions(options: MultiSelectOption[]): MultiSelectOption[] {
  const out: MultiSelectOption[] = []
  const walk = (nodes: MultiSelectOption[]) => {
    nodes.forEach((n) => {
      out.push(n)
      if (n.children?.length) walk(n.children)
    })
  }
  walk(options)
  return out
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr))
}

// если внезапно в selectedCategories пришли строки‑числа (старые данные),
// попробуем сопоставить их с id→name из справочника категорий
function normalizeByDictionary(values: string[], idToName: Map<string, string>): string[] {
  return values.map((v) => idToName.get(v) ?? v)
}

const UserRow: FC<{
  user: User
  onUpdateUser?: (userId: number, updates: User) => void
  onUpdateRole?: (userId: number, newRole: User['role']) => void
  onDeleteUser?: (userId: number) => void
  onBanUser?: (userId: number) => void
  onUnbanUser?: (userId: number) => void
  instance?: any
}> = ({user, onUpdateUser, onUpdateRole, onDeleteUser, onBanUser, onUnbanUser, instance}) => {
  const [activeCountry, setActiveCountry] = useState(
    user.region || user.vendorDetails?.countries?.[0]?.name || user.vendorDetails?.countries?.[0]?.value || ''
  )
  const [activeRole, setActiveRole] = useState(user.role)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editData, setEditData] = useState<UserEditData>({
    login: '',
    email: '',
    phoneNumber: '',
    region: '',
    role: 'User',
    inn: '',
    description: '',
    countries: [],
    productCategories: [],
    sites: [],
    phoneNumbers: [],
    emails: []
  })
  const [activeImages, setActiveImages] = useState<string[]>([user?.avatarUrl])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  // ВАЖНО: здесь всегда имена категорий
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user.vendorDetails?.productCategories?.map((cat) => String(cat.name)).filter(Boolean) || []
  )

  // ---- derive options + быстрый поиск ----
  const options = useMemo(() => buildOptionsFromCategories(categories), [categories])
  const flatOptions = useMemo(() => flattenOptions(options), [options])
  const idToName = useMemo(() => {
    const m = new Map<string, string>()
    flatOptions.forEach((o) => {
      if (o.id != null) m.set(String(o.id), o.label)
    })
    return m
  }, [flatOptions])

  // нормализуем старые значения, если вдруг там id‑строки
  useEffect(() => {
    if (!selectedCategories.length || idToName.size === 0) return
    const withNames = normalizeByDictionary(selectedCategories, idToName)
    if (withNames.some((v, i) => v !== selectedCategories[i])) {
      setSelectedCategories(dedupe(withNames.filter(Boolean)))
    }
  }, [idToName])

  // Загрузка категорий при открытии редактирования вендора
  useEffect(() => {
    const fetchCategories = async () => {
      if (editData.role === 'Vendor' && categories.length === 0) {
        try {
          const categoriesRussian = await CategoriesService.getAll('ru')
          setCategories(categoriesRussian)
        } catch (error) {
          console.error('Ошибка загрузки категорий:', error)
        }
      }
    }
    fetchCategories()
  }, [editData.role, categories.length])

  const handleCountryChange = (newCountry: string) => {
    setActiveCountry(newCountry)
    onUpdateUser?.(user.id, {
      ...user,
      ...(editData.role !== 'Vendor' ? {region: newCountry} : {}) // фикс: сравнение по правильному регистру
    })
  }

  const handleRoleChange = (newRole: string) => {
    setActiveRole(newRole as User['role'])
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
      let userData
      if (user.role === 'Vendor') {
        const response = await instance.get(`/vendor/${user.id}`)
        userData = response.data
        const vendorDetails: {
          id: number
          inn: string
          description: string
          creationDate: string
          lastModificationDate: string
          viewsCount: number
          countries: Array<{id: number; name: string}>
          emails: string[]
          phoneNumbers: string[]
          sites: string[]
          productCategories: Array<{id: number; name: string}>
          faq: any[]
        } = userData.vendorDetails || ({} as any)

        const countries = vendorDetails.countries || []
        const productCategories = vendorDetails.productCategories || []

        setEditData({
          login: userData.login || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          region: '',
          role: 'Vendor',
          inn: vendorDetails.inn || '',
          description: vendorDetails.description || '',
          countries: countries.map((c) => c.name).filter(Boolean),
          productCategories: productCategories.map((c) => c.name).filter(Boolean),
          sites: vendorDetails.sites || [],
          phoneNumbers: vendorDetails.phoneNumbers || [],
          emails: vendorDetails.emails || []
        })

        // ключевой момент: храним только name
        setSelectedCountries(countries.map((c) => c.name).filter(Boolean))
        setSelectedCategories(productCategories.map((c) => c.name).filter(Boolean))
      } else {
        const response = await instance.get(`/user/${user.id}`)
        userData = response.data
        setEditData({
          login: userData.login || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          region: userData.region || '',
          role: userData.role || 'User',
          inn: '',
          description: '',
          countries: [],
          productCategories: [],
          sites: [],
          phoneNumbers: [],
          emails: []
        })
        setSelectedCountries([])
        setSelectedCategories([])
      }
      setIsEditModalOpen(true)
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error)
      alert('Произошла ошибка при загрузке данных пользователя')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!instance) return
    try {
      setIsLoading(true)
      if (editData.role === 'Vendor') {
        await instance.put(`/vendor/${user.id}`, {
          email: editData.email,
          login: editData.login,
          phoneNumber: editData.phoneNumber,
          inn: editData.inn,
          countries: selectedCountries, // массив имён стран
          productCategories: selectedCategories, // массив имён категорий
          description: editData.description,
          sites: editData.sites,
          phoneNumbers: editData.phoneNumbers,
          emails: editData.emails
        })
      } else {
        await instance.put(`/user/${user.id}`, {
          email: editData.email,
          region: editData.region,
          login: editData.login,
          phoneNumber: editData.phoneNumber
        })
      }

      const updatedUser: User = {
        ...user,
        login: editData.login,
        email: editData.email,
        phoneNumber: editData.phoneNumber,
        ...(editData.role !== 'Vendor' ? {region: editData.region} : {}),
        role: editData.role
      }

      onUpdateUser?.(user.id, updatedUser)
      setActiveCountry(editData.region)
      setActiveRole(editData.role)
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Ошибка при сохранении изменений:', error)
      alert('Произошла ошибка при сохранении изменений')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBanToggle = async () => {
    if (!instance) return
    try {
      setIsLoading(true)
      const isBanned = user.role === 'Banned'
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

  const toggleCountrySelection = (country: string) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  const handleAvatarUpload = async (files: File[]) => {
    if (!instance || files.length === 0) {
      try {
        instance?.delete?.(`/user/${user.id}/avatar`)
      } catch (e) {
        console.error('Ошибка при удалении аватара:', e)
      }
      return
    }
    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)
    try {
      setIsLoading(true)
      const response = await instance.put(`/user/${user.id}/avatar`, formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      const updatedUser: User = {...user, avatarUrl: response.data.avatarUrl || response.data.url}
      onUpdateUser?.(user.id, updatedUser)
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error)
      alert('Произошла ошибка при загрузке аватара')
    } finally {
      setIsLoading(false)
    }
  }

  // ---- ВЫЧИСЛЯЕМ selectedValues для MultiDropSelect ИСКЛЮЧИТЕЛЬНО ИЗ name ----
  const selectedOptions: MultiSelectOption[] = useMemo(() => {
    return selectedCategories
      .map((name) => flatOptions.find((o) => o.label === name || o.value === name) || null)
      .filter(notNull)
  }, [selectedCategories, flatOptions])

  const isBanned = !user.isEnabled

  return (
    <div className={styles.user__row}>
      <ModalWindowDefault
        extraClass={styles.edit__modal}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <h3 className={styles.modal__title}>Редактирование пользователя</h3>

        <div className={styles.modal__avatar__section}>
          <CreateImagesInput
            onFilesChange={handleAvatarUpload}
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

          {editData.role !== 'Vendor' && (
            <DropList
              direction='right'
              trigger='click'
              safeAreaEnabled
              positionIsAbsolute={true}
              title={editData.region || 'Выберите регион'}
              extraClass={`${styles.modal__dropdown} ${styles.extra__countries__list}`}
              items={REGION_OPTIONS.map((region) => (
                <p onClick={() => setEditData((prev) => ({...prev, region: region}))} key={region}>
                  {region}
                </p>
              ))}
            />
          )}

          {editData.role === 'Vendor' && (
            <>
              <TextInputUI
                placeholder='ИНН'
                currentValue={editData.inn || ''}
                onSetValue={(value) => setEditData((prev) => ({...prev, inn: value}))}
                theme='superWhite'
                extraClass={styles.form__input}
              />

              <TextAreaUI
                placeholder='Описание компании'
                currentValue={editData.description || ''}
                onSetValue={(value) => setEditData((prev) => ({...prev, description: value}))}
                autoResize
                maxRows={20}
                minRows={2}
                theme='superWhite'
              />

              {/* Сайты */}
              <div className={styles.array__field__section}>
                <h4>Сайты компании:</h4>
                {(editData.sites || []).map((site, index) => (
                  <div
                    style={{display: 'flex', alignItems: 'center', gap: '10px'}}
                    key={index}
                    className={styles.array__item}
                  >
                    <TextInputUI
                      placeholder={`Сайт ${index + 1}`}
                      currentValue={site}
                      onSetValue={(value) =>
                        setEditData((prev) => ({
                          ...prev,
                          sites: (prev.sites || []).map((s, i) => (i === index ? value : s))
                        }))
                      }
                      theme='superWhite'
                      extraClass={styles.form__input}
                    />
                    <button
                      style={{color: '#b02a36', fontSize: '22px'}}
                      type='button'
                      className={styles.remove__item__button}
                      onClick={() =>
                        setEditData((prev) => ({...prev, sites: (prev.sites || []).filter((_, i) => i !== index)}))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  className={styles.add__item__button}
                  onClick={() => setEditData((p) => ({...p, sites: [...(p.sites || []), '']}))}
                >
                  + Добавить сайт
                </button>
              </div>

              {/* Телефоны */}
              <div className={styles.array__field__section}>
                <h4>Дополнительные телефоны:</h4>
                {(editData.phoneNumbers || []).map((phone, index) => (
                  <div
                    style={{display: 'flex', alignItems: 'center', gap: '10px'}}
                    key={index}
                    className={styles.array__item}
                  >
                    <TextInputUI
                      placeholder={`Телефон ${index + 1}`}
                      currentValue={phone}
                      onSetValue={(value) =>
                        setEditData((prev) => ({
                          ...prev,
                          phoneNumbers: (prev.phoneNumbers || []).map((s, i) => (i === index ? value : s))
                        }))
                      }
                      theme='superWhite'
                      extraClass={styles.form__input}
                    />
                    <button
                      style={{color: '#b02a36', fontSize: '22px'}}
                      type='button'
                      className={styles.remove__item__button}
                      onClick={() =>
                        setEditData((prev) => ({
                          ...prev,
                          phoneNumbers: (prev.phoneNumbers || []).filter((_, i) => i !== index)
                        }))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  className={styles.add__item__button}
                  onClick={() => setEditData((p) => ({...p, phoneNumbers: [...(p.phoneNumbers || []), '']}))}
                >
                  + Добавить телефон
                </button>
              </div>

              {/* Emails */}
              <div className={styles.array__field__section}>
                <h4>Дополнительные Email&apos;ы:</h4>
                {(editData.emails || []).map((email, index) => (
                  <div
                    style={{display: 'flex', alignItems: 'center', gap: '10px'}}
                    key={index}
                    className={styles.array__item}
                  >
                    <TextInputUI
                      placeholder={`Email ${index + 1}`}
                      currentValue={email}
                      onSetValue={(value) =>
                        setEditData((prev) => ({
                          ...prev,
                          emails: (prev.emails || []).map((s, i) => (i === index ? value : s))
                        }))
                      }
                      theme='superWhite'
                      extraClass={styles.form__input}
                    />
                    <button
                      style={{color: '#b02a36', fontSize: '22px'}}
                      type='button'
                      className={styles.remove__item__button}
                      onClick={() =>
                        setEditData((prev) => ({...prev, emails: (prev.emails || []).filter((_, i) => i !== index)}))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  className={styles.add__item__button}
                  onClick={() => setEditData((p) => ({...p, emails: [...(p.emails || []), '']}))}
                >
                  + Добавить Email
                </button>
              </div>

              {/* Страны */}
              <div className={styles.multi__select__section}>
                <h4>Страны работы:</h4>
                <div className={styles.multi__select__grid}>
                  {REGION_OPTIONS.map((country) => (
                    <label key={country} className={styles.checkbox__item}>
                      <input
                        type='checkbox'
                        checked={selectedCountries.includes(country)}
                        onChange={() => toggleCountrySelection(country)}
                      />
                      <span>{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Категории по name */}
              {categories.length > 0 && (
                <div style={{zIndex: '100000'}} className={styles.multi__select__section}>
                  <h4>Категории товаров:</h4>
                  <MultiDropSelect
                    extraDropListClass={styles.extra_extraDropListClass}
                    showSearchInput
                    isOnlyShow={false}
                    extraClass={styles.profile__region__dropdown__extra}
                    options={options as any}
                    isCategories={true}
                    selectedValues={selectedOptions as any}
                    onChange={(values: MultiSelectOption[]) => {
                      const names = dedupe(values.map((v) => v.label || v.value).filter(Boolean))
                      setSelectedCategories(names)
                    }}
                    placeholder={'Выберите категории товаров'}
                    direction={'bottom'}
                  />
                </div>
              )}
            </>
          )}

          <div className={styles.modal__dropdowns}>
            <DropList
              direction='right'
              trigger='click'
              safeAreaEnabled
              positionIsAbsolute={true}
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
              extraClass={`${styles.modal__dropdown} ${styles.extra__role__list}`}
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
          </div>

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
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      </ModalWindowDefault>

      <div className={`${styles.id__text}`}>{user.id}</div>
      <div className={`${styles.login__box}`}>
        <div
          style={{backgroundImage: `url(${user.avatarUrl ? user.avatarUrl : assets_avatar})`}}
          className={`${styles.avatar}`}
        ></div>
        <div style={{color: isBanned ? '#C8313E' : '#000'}} className={`${styles.login__text}`}>
          {isBanned ? 'BAN' : ''} {user.login}
        </div>
      </div>
      <div className={`${styles.email__text}`}>{user.email}</div>

      <DropList
        direction='bottom'
        trigger='hover'
        safeAreaEnabled
        positionIsAbsolute={false}
        title={activeCountry}
        extraStyle={{minWidth: 'fit-content'}}
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
