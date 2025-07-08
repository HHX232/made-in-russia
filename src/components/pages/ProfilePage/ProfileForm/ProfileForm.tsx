/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {TelephoneInputUI, TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {FC, useState, useRef, useEffect, useCallback} from 'react'
import {RegionDropList} from '../../RegisterPage/RegisterUser/RegisterUserFirst'
import styles from './ProfileForm.module.scss'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import InputOtp from '@/components/UI-kit/inputs/inputOTP/inputOTP'
import {User} from '@/services/users.types'
import MultiDropSelect, {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import useWindowWidth from '@/hooks/useWindoWidth'
import {axiosClassic} from '@/api/api.interceptor'
import {saveTokenStorage} from '@/middleware'
import {toast} from 'sonner'
import {IVendorData} from '../../VendorPage/VendorPage'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
const belarusSvg = '/belarus.svg'

const countryOptions: MultiSelectOption[] = [
  {id: 'belarus', label: 'Беларусь', value: 'Belarus', icon: belarusSvg},
  {id: 'kazakhstan', label: 'Казахстан', value: 'Kazakhstan', icon: belarusSvg},
  {id: 'china', label: 'Китай', value: 'China', icon: belarusSvg},
  {id: 'russia', label: 'Россия', value: 'Russia', icon: belarusSvg},
  {id: 'usa', label: 'США', value: 'USA', icon: belarusSvg},
  {id: 'germany', label: 'Германия', value: 'Germany', icon: belarusSvg},
  {id: 'poland', label: 'Польша', value: 'Poland', icon: belarusSvg},
  {id: 'ukraine', label: 'Украина', value: 'Ukraine', icon: belarusSvg}
]
const categoryOptions: MultiSelectOption[] = [
  {id: 'lumber', label: 'Пиломатериалы', value: 'Lumber', icon: belarusSvg},
  {id: 'drywall', label: 'Гипсокартон', value: 'Drywall', icon: belarusSvg},
  {id: 'insulation', label: 'Утеплители', value: 'Insulation', icon: belarusSvg},
  {id: 'roofing', label: 'Кровельные материалы', value: 'Roofing', icon: belarusSvg},
  {id: 'paints', label: 'Лакокрасочные материалы', value: 'Paints', icon: belarusSvg},
  {id: 'tiles', label: 'Плитка и керамика', value: 'Tiles', icon: belarusSvg},
  {id: 'plumbing', label: 'Сантехника', value: 'Plumbing', icon: belarusSvg},
  {id: 'hardware', label: 'Крепеж и метизы', value: 'Hardware', icon: belarusSvg},
  {id: 'windows', label: 'Окна и двери', value: 'Windows', icon: belarusSvg},
  {id: 'flooring', label: 'Напольные покрытия', value: 'Flooring', icon: belarusSvg},
  {id: 'cement', label: 'Цемент и смеси', value: 'Cement', icon: belarusSvg},
  {id: 'metal', label: 'Металлопрокат', value: 'Metal', icon: belarusSvg},
  {id: 'tools', label: 'Инструменты', value: 'Tools', icon: belarusSvg},
  {id: 'electrical', label: 'Электротовары', value: 'Electrical', icon: belarusSvg},
  {id: 'decor', label: 'Отделочные материалы', value: 'Decor', icon: belarusSvg}
]
interface PhoneInputSectionProps {
  telText: string
  isValidNumber: boolean
  selectedRegion: RegionType
  onChangeTelNumber: (value: string) => void
  isShowForVendor?: boolean
}
interface RegionType {
  imageSrc: string
  title: string
  altName: string
}

// Типы для обновленных данных
interface UpdatedUserData {
  phoneNumber: string
  region: string
  password?: string
}

interface UpdatedVendorData extends UpdatedUserData {
  countries: MultiSelectOption[]
  inn: string
  productCategories: MultiSelectOption[]
}

interface ProfileFormProps {
  isVendor?: boolean
  userData?: User | IVendorData
  regions: RegionType[]
  isLoading: boolean
  isShowForOwner?: boolean
  setNeedToSave: (value: boolean) => void
  // Новые пропсы для возврата данных
  onUserDataChange?: (data: UpdatedUserData) => void
  onVendorDataChange?: (data: UpdatedVendorData) => void
}

const validatePhoneLength = (phone: string, country: TNumberStart): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '')
  switch (country) {
    case 'Belarus':
      return cleanedPhone.length === 9 // Пример: 291234567 (без +375)

    case 'China':
      return cleanedPhone.length === 11 // Пример: 13800138000 (без +86)

    case 'Russia':
      return cleanedPhone.length === 10 // Пример: 9123456789 (без +7)

    case 'Kazakhstan':
      return cleanedPhone.length === 10 // Пример: 7012345678 (без +7)

    case 'other':
    default:
      return cleanedPhone.length >= 7
  }
}

// Функция для безопасного преобразования altName в TNumberStart
const getSafeNumberStart = (regionAltName: string): TNumberStart => {
  console.log('getSafeNumberStart called with:', regionAltName)

  const validTypes: TNumberStart[] = ['China', 'Belarus', 'Russia', 'Kazakhstan', 'other']

  // Проверяем точное соответствие
  if (validTypes.includes(regionAltName as TNumberStart)) {
    console.log('Found exact match:', regionAltName)
    return regionAltName as TNumberStart
  }

  // Проверяем с учетом регистра
  const normalizedAltName = regionAltName.charAt(0).toUpperCase() + regionAltName.slice(1).toLowerCase()
  if (validTypes.includes(normalizedAltName as TNumberStart)) {
    console.log('Found normalized match:', normalizedAltName)
    return normalizedAltName as TNumberStart
  }

  // Если altName не соответствует TNumberStart, возвращаем 'other'
  console.log('No match found, returning other')
  return 'other'
}

const PhoneInputSection: FC<PhoneInputSectionProps> = ({
  telText,
  isShowForVendor,
  isValidNumber,
  selectedRegion,
  onChangeTelNumber
}) => {
  const numberStartWith = getSafeNumberStart(selectedRegion.altName)
  // console.log('PhoneInputSection:', {
  //   selectedRegion: selectedRegion.altName,
  //   numberStartWith: numberStartWith
  // })
  const t = useTranslations('ProfilePage.ProfileForm')
  return (
    <div className={styles.phone__input__box}>
      <p className={styles.input__title}>{t('phoneNumber')}</p>
      <TelephoneInputUI
        isOnlyShow={!isShowForVendor}
        currentValue={telText}
        extraClass={styles.extra__phone__class}
        error={!isValidNumber ? 'error' : ''}
        onSetValue={onChangeTelNumber}
        numberStartWith={numberStartWith}
      />
    </div>
  )
}

const ProfileForm: FC<ProfileFormProps> = ({
  isVendor = false,
  isShowForOwner = true,
  userData,
  regions,
  isLoading,
  setNeedToSave,
  onUserDataChange,
  onVendorDataChange
}) => {
  const [password, setPassword] = useState('')
  const [telText, setTelText] = useState('')
  const [trueTelephoneNumber, setTrueTelephoneNumber] = useState('')
  const [isValidNumber, setIsValidNumber] = useState(true)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [categoriesMultiSelect, setCategoriesMultiSelect] = useState<MultiSelectOption[]>([])
  const currentLang = useCurrentLanguage()
  const t = useTranslations('ProfilePage.ProfileForm')
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await CategoriesService.getAll(currentLang)
        setAllCategories(categories)
        setCategoriesMultiSelect(
          categories.map((category) => ({
            id: category.id,
            label: category.name,
            value: category.name,
            icon: belarusSvg
          }))
        )
        setError(null)
      } catch (err) {
        setError(t('errorLoadingCAtegoryes'))
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [])

  const flattenCategories = (categories: Category[], level = 0): Array<Category & {level: number}> => {
    const result: Array<Category & {level: number}> = []

    categories.forEach((category) => {
      result.push({...category, level})
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, level + 1))
      }
    })

    return result
  }

  const flattenedCategories = flattenCategories(allCategories)

  // Функция для определения региона по номеру телефона
  const detectRegionFromPhone = (phoneNumber: string): string => {
    if (!phoneNumber) return 'other'

    const cleaned = phoneNumber.replace(/\D/g, '')
    console.log('detectRegionFromPhone - cleaned number:', cleaned)

    // Проверяем известные коды стран
    if (cleaned.startsWith('375')) return 'Belarus'
    if (cleaned.startsWith('86')) return 'China'
    if (cleaned.startsWith('7')) {
      console.log('Detected Russia/Kazakhstan from phone starting with 7')
      return 'Russia' // или Kazakhstan
    }

    // Если номер не начинается с известного кода - это "other"
    return 'other'
  }

  const [selectedRegion, setSelectedRegion] = useState<RegionType>(() => {
    // Для вендора пытаемся взять первую страну из vendorDetails
    if (isVendor && userData?.vendorDetails && userData?.vendorDetails?.countries?.length > 0) {
      const firstCountryName = userData.vendorDetails.countries[0].name
      const vendorRegion = regions.find(
        (region) => region.altName === firstCountryName || region.title === firstCountryName
      )
      if (vendorRegion) {
        console.log('Found vendor region from countries:', vendorRegion.altName)
        return vendorRegion
      }
    }

    // Приоритет 1: Проверяем сохраненный регион пользователя (для обычных пользователей)
    if (userData?.region) {
      const userRegion = regions.find((region) => region.altName === userData.region)
      if (userRegion) {
        return userRegion
      }
    }

    // Приоритет 2: Если регион не найден, пытаемся определить по номеру телефона
    if (userData?.phoneNumber) {
      const detectedRegionName = detectRegionFromPhone(userData.phoneNumber)
      const detectedRegion = regions.find((r) => r.altName === detectedRegionName)
      if (detectedRegion) {
        console.log('Detected region from phone:', detectedRegion.altName)
        return detectedRegion
      }
    }

    // Приоритет 3: Ищем регион "other" как значение по умолчанию
    const otherRegion = regions.find((r) => r.altName === 'other')
    if (otherRegion) {
      return otherRegion
    }

    // Последний вариант: берем первый из списка
    return regions[0]
  })

  const [listIsOpen, setListIsOpen] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const windowWidth = useWindowWidth()
  const [isPhoneInitialized, setIsPhoneInitialized] = useState(false)
  const normalizePhone = (phone: string) => phone.replace(/\D/g, '')
  const [selectedCountries, setSelectedCountries] = useState<MultiSelectOption[]>([])
  const [inn, setInn] = useState('')
  const [categories, setCategories] = useState<MultiSelectOption[]>([])

  // Новый флаг для отслеживания взаимодействия пользователя
  const [userInteracted, setUserInteracted] = useState(false)

  // Сохраняем оригинальные данные для сравнения
  const [originalData, setOriginalData] = useState<{
    phoneNumber: string
    region: string
  } | null>(null)

  // Функция для вызова колбэков с обновленными данными
  useEffect(() => {
    if (!userInteracted) return

    const baseData: UpdatedUserData = {
      phoneNumber: telText,
      region: selectedRegion.altName,
      ...(password && {password})
    }

    if (isVendor && onVendorDataChange) {
      const vendorData: UpdatedVendorData = {
        ...baseData,
        countries: selectedCountries,
        inn,
        productCategories: categories
      }
      onVendorDataChange(vendorData)
    } else if (!isVendor && onUserDataChange) {
      onUserDataChange(baseData)
    }
  }, [telText, selectedRegion.altName, password, isVendor, selectedCountries, inn, categories, userInteracted])

  // Инициализация vendor данных
  useEffect(() => {
    if (userData?.vendorDetails?.inn) {
      setInn(userData?.vendorDetails?.inn)
    }
    if (userData?.vendorDetails?.countries) {
      const countryOptions = userData?.vendorDetails?.countries.map((country) => ({
        id: country.id,
        label: country.name,
        value: country.name,
        icon: belarusSvg
      }))
      setSelectedCountries(countryOptions)
    }
    if (userData?.vendorDetails?.productCategories) {
      const categoryOptions = userData?.vendorDetails?.productCategories.map((category) => ({
        id: category.id,
        label: category.name,
        value: category.name,
        icon: belarusSvg
      }))
      setCategories(categoryOptions)
    }
  }, [userData])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getNationalNumber = (fullNumber: string, region: string) => {
    const cleaned = normalizePhone(fullNumber)
    switch (region) {
      case 'Belarus':
        return cleaned.startsWith('375') ? cleaned.slice(3) : cleaned
      case 'China':
        return cleaned.startsWith('86') ? cleaned.slice(2) : cleaned
      case 'Russia':
      case 'Kazakhstan':
        return cleaned.startsWith('7') ? cleaned.slice(1) : cleaned
      default:
        return cleaned
    }
  }

  // Обновленная функция safeSetNeedToSave
  const safeSetNeedToSave = useCallback(
    (value: boolean) => {
      // Устанавливаем needToSave только если:
      // 1. Инициализация завершена
      // 2. Пользователь взаимодействовал с формой
      if (isPhoneInitialized && userInteracted) {
        setNeedToSave(value)
      }
    },
    [isPhoneInitialized, userInteracted, setNeedToSave]
  )

  // Инициализация данных пользователя
  useEffect(() => {
    if (userData && !isPhoneInitialized) {
      // Определяем правильный регион для оригинальных данных
      let originalRegion = userData.region

      if (!originalRegion || !regions.find((r) => r.altName === originalRegion)) {
        // Если регион не указан или не найден в списке,
        // определяем его по номеру телефона
        originalRegion = detectRegionFromPhone(userData.phoneNumber || '')
      }

      setOriginalData({
        phoneNumber: userData.phoneNumber || '',
        region: originalRegion
      })

      // Устанавливаем текущие значения
      setTelText(userData.phoneNumber || '')
      setIsPhoneInitialized(true)
    }
  }, [userData, isPhoneInitialized, regions])

  // Проверка изменений
  useEffect(() => {
    if (!isPhoneInitialized || !userData || !originalData || !userInteracted) return

    // Получаем национальные номера для текущего ввода и оригинальных данных
    const currentNational = getNationalNumber(telText, selectedRegion.altName)
    const originalNational = getNationalNumber(originalData.phoneNumber, originalData.region)

    // Сравниваем регион
    const isRegionChanged = selectedRegion.altName !== originalData.region

    // Сравниваем национальные номера
    const isPhoneChanged = currentNational !== originalNational

    safeSetNeedToSave(isRegionChanged || isPhoneChanged)
  }, [telText, selectedRegion, userData, isPhoneInitialized, userInteracted, originalData, safeSetNeedToSave])

  // Установка региона из userData
  useEffect(() => {
    if (userData && !userInteracted) {
      let regionToSet: RegionType | undefined

      // Для вендора сначала проверяем countries
      if (isVendor && userData?.vendorDetails && userData.vendorDetails?.countries?.length > 0) {
        const firstCountryName = userData.vendorDetails.countries[0].name
        regionToSet = regions.find((region) => region.altName === firstCountryName || region.title === firstCountryName)
        if (regionToSet) {
          console.log('Setting vendor region from countries:', regionToSet.altName)
        }
      }

      // Если не нашли для вендора или это обычный пользователь
      if (!regionToSet && userData.region) {
        regionToSet = regions.find((region) => region.altName === userData.region)
      }

      // Если не нашли - определяем по номеру телефона
      if (!regionToSet && userData.phoneNumber) {
        const detectedRegionName = detectRegionFromPhone(userData.phoneNumber)
        regionToSet = regions.find((r) => r.altName === detectedRegionName)
        if (regionToSet) {
          console.log('Setting region from phone detection:', regionToSet.altName)
        }
      }

      // Если все еще не нашли - используем "other"
      if (!regionToSet) {
        regionToSet = regions.find((r) => r.altName === 'other')
      }

      if (regionToSet) {
        setSelectedRegion(regionToSet)
      }
    }
  }, [userData, regions, userInteracted, isVendor])

  // Вычисление национального номера
  useEffect(() => {
    const cleanedNumber = telText.replace(/\D/g, '')
    let nationalNumber = cleanedNumber

    switch (selectedRegion.altName) {
      case 'Belarus':
        if (cleanedNumber.startsWith('375')) {
          nationalNumber = cleanedNumber.slice(3)
        }
        break
      case 'China':
        if (cleanedNumber.startsWith('86')) {
          nationalNumber = cleanedNumber.slice(2)
        }
        break
      case 'Russia':
      case 'Kazakhstan':
        if (cleanedNumber.startsWith('7')) {
          nationalNumber = cleanedNumber.slice(1)
        }
        break
    }

    setTrueTelephoneNumber(nationalNumber)
  }, [telText, selectedRegion.altName])

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Для отладки
  useEffect(() => {
    console.log('ProfileForm Debug:', {
      userData_phoneNumber: userData?.phoneNumber,
      userData_region: userData?.region,
      detected_region: userData?.phoneNumber ? detectRegionFromPhone(userData.phoneNumber) : 'N/A',
      selected_region: selectedRegion.altName,
      regions_available: regions.map((r) => r.altName)
    })
  }, [userData, selectedRegion, regions])

  // Обновленный handleRegionSelect
  const handleRegionSelect = (region: RegionType) => {
    // Устанавливаем флаг взаимодействия при выборе региона
    setUserInteracted(true)
    setSelectedRegion(region)
    setListIsOpen(false)

    // При смене региона проверяем валидность текущего номера
    const cleanedNumber = telText.replace(/\D/g, '')
    const isValid = validatePhoneLength(cleanedNumber, getSafeNumberStart(region.altName))
    setIsValidNumber(isValid)
  }

  // Обновленный onChangeTelNumber
  const onChangeTelNumber = (val: string) => {
    // Устанавливаем флаг взаимодействия при вводе номера
    if (!userInteracted) {
      setUserInteracted(true)
    }

    const cleanedNumber = val.replace(/\D/g, '')
    const countryForValidation = getSafeNumberStart(selectedRegion.altName)

    // Валидация должна происходить на очищенном номере БЕЗ форматирования
    const isValid = validatePhoneLength(cleanedNumber, countryForValidation)

    setTelText(cleanedNumber) // Сохраняем только цифры
    setIsValidNumber(isValid)

    // Вычисляем национальный номер для других целей
    let nationalNumber = cleanedNumber
    switch (countryForValidation) {
      case 'Belarus':
        if (cleanedNumber.startsWith('375')) {
          nationalNumber = cleanedNumber.slice(3)
        }
        break
      case 'China':
        if (cleanedNumber.startsWith('86')) {
          nationalNumber = cleanedNumber.slice(2)
        }
        break
      case 'Russia':
      case 'Kazakhstan':
        if (cleanedNumber.startsWith('7')) {
          nationalNumber = cleanedNumber.slice(1)
        }
        break
    }

    setTrueTelephoneNumber(nationalNumber)
  }

  const handlePasswordBlur = () => {
    if (password.length <= 0) return

    timerRef.current = setTimeout(() => {
      console.log('Таймер сработал: прошло 2 секунды после потери фокуса инпута пароля')
      try {
        const res = axiosClassic.post<{accessToken: string; refreshToken: string}>(
          '/auth/recover-password',
          {
            email: userData?.email,
            newPassword: password
          },
          {
            headers: {
              'Accept-Language': currentLang
            }
          }
        )

        toast.success(t('codeInEmail') + userData?.email)
        setModalIsOpen(true)
      } catch {
        toast.error(t('errorUpdatePassword'))
        setModalIsOpen(false)
      }
    }, 2000)
  }

  const handlePasswordFocus = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      console.log('Таймер отменен: инпут снова получил фокус')
    }
  }

  const closeModal = () => {
    setModalIsOpen(false)
    setPassword('')
  }

  const closeModalOtp = async (code: string) => {
    try {
      const res = await axiosClassic.post<{accessToken: string; refreshToken: string}>(
        '/auth/verify-recover-password',
        {
          email: userData?.email,
          recoverCode: code
        },
        {
          headers: {
            'Accept-Language': currentLang
          }
        }
      )
      saveTokenStorage(res.data)

      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('congratulations')}</strong>
          <span>{t('passwordChangeSuccess')}</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
      setTimeout(() => {
        setModalIsOpen(false)
      }, 1000)
      setPassword('')
    } catch {
      toast.error(t('dontChangePassword'))
    }
  }

  return (
    <div className={styles.create__box}>
      <ModalWindowDefault isOpen={modalIsOpen} onClose={closeModal}>
        <p className={`${styles.modal__text}`}>{t('wannaChangePassword')}</p>
        <p className={`${styles.modal__text__mini}`}>{t('enterCodeFromEmail')}</p>
        <div style={{width: '100%', marginBottom: '10px'}}>
          <InputOtp length={4} onComplete={closeModalOtp} />
        </div>
      </ModalWindowDefault>
      {isShowForOwner && (
        <TextInputUI
          extraClass={styles.extra__input}
          theme='light'
          currentValue={password}
          onSetValue={(value) => {
            setPassword(value)
            if (value.length > 0) {
              setUserInteracted(true)
            }
          }}
          isSecret={true}
          title={t('password')}
          placeholder={t('createNewPassword')}
          onBlur={handlePasswordBlur}
          onFocus={handlePasswordFocus}
        />
      )}
      <div className={styles.region__box}>
        <p style={{cursor: 'pointer'}} onClick={() => setListIsOpen(!listIsOpen)} className={styles.input__title}>
          {t('regions')}
        </p>
        {!isVendor ? (
          <div className={styles.region__box__input}>
            <RegionDropList
              regions={regions}
              selectedRegion={selectedRegion}
              listIsOpen={listIsOpen}
              setListIsOpen={setListIsOpen}
              handleRegionSelect={handleRegionSelect}
              extraClass={styles.profile__region__dropdown}
            />
          </div>
        ) : (
          <span>
            <MultiDropSelect
              isOnlyShow={!isShowForOwner}
              extraClass={styles.profile__region__dropdown__extra}
              options={countryOptions}
              selectedValues={selectedCountries}
              onChange={(values) => {
                setSelectedCountries(values)
                setUserInteracted(true)
              }}
              placeholder={t('selectRegions')}
              direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'right'}
            />
          </span>
        )}
      </div>

      <PhoneInputSection
        telText={telText}
        isShowForVendor={isShowForOwner}
        isValidNumber={isValidNumber}
        selectedRegion={selectedRegion}
        onChangeTelNumber={onChangeTelNumber}
      />
      {isVendor && (
        <div className={`${styles.region__box} ${styles.region__box__second}`}>
          <p style={{cursor: 'pointer'}} onClick={() => setListIsOpen(!listIsOpen)} className={styles.input__title}>
            {t('categoryes')}
          </p>
          <MultiDropSelect
            showSearchInput
            isOnlyShow={!isShowForOwner}
            extraClass={styles.profile__region__dropdown__extra}
            options={flattenedCategories.map((category) => ({
              id: category.id,
              label: category.name,
              value: category.name,
              icon: ''
            }))}
            selectedValues={categories}
            onChange={(values) => {
              setCategories(values)
              setUserInteracted(true)
            }}
            placeholder={t('selectCategoryes')}
            direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'right'}
          />
        </div>
      )}
      {isVendor && (
        <div style={{margin: '5px 0 0px 0'}} className={styles.inn__box}>
          <TextInputUI
            disabled={!isShowForOwner}
            extraClass={`${styles.extra__input} ${styles.extra__input__inn}`}
            theme='light'
            currentValue={inn}
            onSetValue={(value) => {
              setInn(value)
              setUserInteracted(true)
            }}
            title={t('inn')}
            placeholder={t('innPlaceholder')}
          />
        </div>
      )}
    </div>
  )
}

export default ProfileForm
