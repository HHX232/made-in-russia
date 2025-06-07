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

interface PhoneInputSectionProps {
  telText: string
  isValidNumber: boolean
  selectedRegion: RegionType
  onChangeTelNumber: (value: string) => void
}
interface RegionType {
  imageSrc: string
  title: string
  altName: string
}

interface ProfileFormProps {
  isVendor?: boolean
  userData?: User
  regions: RegionType[]
  isLoading: boolean
  setNeedToSave: (value: boolean) => void
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
const PhoneInputSection: FC<PhoneInputSectionProps> = ({telText, isValidNumber, selectedRegion, onChangeTelNumber}) => {
  return (
    <div className={styles.phone__input__box}>
      <p className={styles.input__title}>Номер мобильного телефона</p>
      <TelephoneInputUI
        currentValue={telText}
        extraClass={styles.extra__phone__class}
        error={!isValidNumber ? 'error' : ''}
        onSetValue={onChangeTelNumber}
        numberStartWith={selectedRegion.altName as TNumberStart}
      />
    </div>
  )
}

// Обновленный ProfileForm с флагом пользовательского взаимодействия
// Обновленный ProfileForm с флагом пользовательского взаимодействия
// Обновленный ProfileForm с флагом пользовательского взаимодействия
const ProfileForm: FC<ProfileFormProps> = ({isVendor = false, userData, regions, isLoading, setNeedToSave}) => {
  const [password, setPassword] = useState('')
  const [telText, setTelText] = useState('')
  const [trueTelephoneNumber, setTrueTelephoneNumber] = useState('')
  const [isValidNumber, setIsValidNumber] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<RegionType>(() => {
    // Если есть userData с регионом, используем его, иначе берем первый из списка
    if (userData?.region) {
      const userRegion = regions.find((region) => region.altName === userData.region)
      return userRegion || regions[0]
    }
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
      // Сохраняем оригинальные данные
      setOriginalData({
        phoneNumber: userData.phoneNumber || '',
        region: userData.region || regions[0].altName
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
    console.log('ProfileForm - region setup:', {
      userDataRegion: userData?.region,
      userInteracted,
      regions
    })

    if (userData?.region && !userInteracted) {
      const userRegion = regions.find((region) => region.altName === userData.region)
      console.log('Found user region:', userRegion)
      if (userRegion) {
        setSelectedRegion(userRegion)
      }
    }
  }, [userData, regions, userInteracted])

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

  // Обновленный handleRegionSelect
  const handleRegionSelect = (region: RegionType) => {
    // Устанавливаем флаг взаимодействия при выборе региона
    setUserInteracted(true)
    setSelectedRegion(region)
    setListIsOpen(false)

    // При смене региона проверяем валидность текущего номера
    const cleanedNumber = telText.replace(/\D/g, '')
    const isValid = validatePhoneLength(cleanedNumber, region.altName as TNumberStart)
    setIsValidNumber(isValid)
  }

  // Обновленный onChangeTelNumber
  const onChangeTelNumber = (val: string) => {
    // Устанавливаем флаг взаимодействия при вводе номера
    if (!userInteracted) {
      setUserInteracted(true)
    }

    const cleanedNumber = val.replace(/\D/g, '')
    const countryForValidation = selectedRegion.altName as TNumberStart

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
      setModalIsOpen(true)
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
  }

  return (
    <div className={styles.create__box}>
      <ModalWindowDefault isOpen={modalIsOpen} onClose={closeModal}>
        <p className={`${styles.modal__text}`}>Change password?</p>
        <p className={`${styles.modal__text__mini}`}>Enter the code sent to your email</p>
        <div style={{width: '100%', marginBottom: '10px'}}>
          <InputOtp length={4} onComplete={closeModal} />
        </div>
      </ModalWindowDefault>
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
        title='Пароль'
        placeholder='Create new password?'
        onBlur={handlePasswordBlur}
        onFocus={handlePasswordFocus}
      />
      <div className={styles.region__box}>
        <p style={{cursor: 'pointer'}} onClick={() => setListIsOpen(!listIsOpen)} className={styles.input__title}>
          Страна/Регион
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
          <MultiDropSelect
            extraClass={styles.profile__region__dropdown__extra}
            options={countryOptions}
            selectedValues={selectedCountries}
            onChange={(values) => {
              setSelectedCountries(values)
              setUserInteracted(true)
            }}
            placeholder='Выберите страны...'
            direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'right'}
          />
        )}
      </div>

      <PhoneInputSection
        telText={telText}
        isValidNumber={isValidNumber}
        selectedRegion={selectedRegion}
        onChangeTelNumber={onChangeTelNumber}
      />
      {isVendor && (
        <div className={styles.region__box}>
          <p style={{cursor: 'pointer'}} onClick={() => setListIsOpen(!listIsOpen)} className={styles.input__title}>
            Категории товаров
          </p>
          <MultiDropSelect
            extraClass={styles.profile__region__dropdown__extra}
            options={countryOptions}
            selectedValues={categories}
            onChange={(values) => {
              setCategories(values)
              setUserInteracted(true)
            }}
            placeholder='Выберите категории товаров...'
            direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'right'}
          />
        </div>
      )}
      {isVendor && (
        <div style={{margin: '5px 0 0px 0'}} className={styles.inn__box}>
          <TextInputUI
            extraClass={`${styles.extra__input} ${styles.extra__input__inn}`}
            theme='light'
            currentValue={inn}
            onSetValue={(value) => {
              setInn(value)
              setUserInteracted(true)
            }}
            title='ИНН'
            placeholder='Введите ИНН'
          />
        </div>
      )}
    </div>
  )
}
export default ProfileForm
