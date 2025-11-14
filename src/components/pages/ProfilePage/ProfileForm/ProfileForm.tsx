/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {shallowEqual} from 'react-redux'

const belarusSvg = '/countries/belarus.svg'
const kazakhstanSvg = '/countries/kazakhstan.svg'
const chinaSvg = '/countries/china.svg'
const russiaSvg = '/countries/russia.svg'

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
  onlyShowAddress?: string
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
      return cleanedPhone.length === 9

    case 'China':
      return cleanedPhone.length === 11

    case 'Russia':
      return cleanedPhone.length === 10

    case 'Kazakhstan':
      return cleanedPhone.length === 10

    case 'other':
    default:
      return cleanedPhone.length >= 7
  }
}

// Функция для безопасного преобразования altName в TNumberStart
const getSafeNumberStart = (regionAltName: string): TNumberStart => {
  const validTypes: TNumberStart[] = ['China', 'Belarus', 'Russia', 'Kazakhstan', 'other']

  if (validTypes.includes(regionAltName as TNumberStart)) {
    return regionAltName as TNumberStart
  }

  const normalizedAltName = regionAltName.charAt(0).toUpperCase() + regionAltName.slice(1).toLowerCase()
  if (validTypes.includes(normalizedAltName as TNumberStart)) {
    return normalizedAltName as TNumberStart
  }

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
        // numberStartWith={numberStartWith}
      />
    </div>
  )
}

const ProfileForm: FC<ProfileFormProps> = ({
  isVendor = false,
  onlyShowAddress,
  isShowForOwner = true,
  userData,
  regions,
  isLoading,
  setNeedToSave,
  onUserDataChange,
  onVendorDataChange
}) => {
  const [password, setPassword] = useState('')
  const [showPasswordSaveButton, setShowPasswordSaveButton] = useState(false)
  const [telText, setTelText] = useState('')
  const [isValidNumber, setIsValidNumber] = useState(true)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const currentLang = useCurrentLanguage()
  const t = useTranslations('ProfilePage.ProfileForm')
  const {updateVendorDetails: updateVendorDetailsAction, updateUserProfile, updateVendorAddress} = useActions()
  const vendorDetails = useTypedSelector((s) => s.user.user?.vendorDetails, shallowEqual)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await CategoriesService.getAll(currentLang)
        setAllCategories(categories)
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

  const detectRegionFromPhone = (phoneNumber: string): string => {
    if (!phoneNumber) return 'other'

    const cleaned = phoneNumber.replace(/\D/g, '')

    if (cleaned.startsWith('375')) return 'Belarus'
    if (cleaned.startsWith('86')) return 'China'
    if (cleaned.startsWith('7')) {
      return 'Russia'
    }

    return 'other'
  }

  const getOtherRegion = (regions: RegionType[]): RegionType => {
    return (
      regions.find((r) => r.altName === 'other') || {
        imageSrc: '',
        title: 'other',
        altName: 'other'
      }
    )
  }

  const [selectedRegion, setSelectedRegion] = useState<RegionType>(() => {
    if (isVendor && userData?.vendorDetails?.countries) {
      const countries = userData.vendorDetails.countries

      if (countries.length > 1) {
        return getOtherRegion(regions)
      }

      if (countries.length === 1) {
        const firstCountryName = countries[0].name
        const vendorRegion = regions.find(
          (region) => region.altName === firstCountryName || region.title === firstCountryName
        )
        if (vendorRegion) {
          return vendorRegion
        }
      }
    }

    if (userData?.region) {
      const userRegion = regions.find((region) => region.altName === userData.region)
      if (userRegion) {
        return userRegion
      }
    }

    if (userData?.phoneNumber) {
      const detectedRegionName = detectRegionFromPhone(userData.phoneNumber)
      const detectedRegion = regions.find((r) => r.altName === detectedRegionName)
      if (detectedRegion) {
        console.log('Detected region from phone:', detectedRegion.altName)
        return detectedRegion
      }
    }

    return getOtherRegion(regions)
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

  const [userInteracted, setUserInteracted] = useState(false)

  const [originalData, setOriginalData] = useState<{
    phoneNumber: string
    region: string
    address: string
    inn: string
  } | null>(null)

  useEffect(() => {
    if (!userInteracted) return

    const baseData: UpdatedUserData = {
      phoneNumber: telText && !['+7', '+375', '+86', '7', '375', '86'].includes(telText.trim()) ? telText : '',
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

  useEffect(() => {
    if (userData?.vendorDetails?.inn) {
      setInn(userData?.vendorDetails?.inn)
    }

    if (userData?.vendorDetails?.countries) {
      const countryOptions = userData?.vendorDetails?.countries.map((country) => ({
        id: country.id,
        label: country.name,
        value: country.value,
        icon:
          country.value.toLowerCase() === 'belarus'
            ? belarusSvg
            : country.value.toLowerCase() === 'china'
              ? chinaSvg
              : country.value.toLowerCase() === 'russia'
                ? russiaSvg
                : country.value.toLowerCase() === 'kazakhstan'
                  ? kazakhstanSvg
                  : ''
      }))
      setSelectedCountries(countryOptions)
    }

    if (userData?.vendorDetails?.productCategories) {
      const categoryOptions = userData?.vendorDetails?.productCategories.map((category) => ({
        id: category.id,
        label: category.name,
        value: category.name,
        icon: ''
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

  const safeSetNeedToSave = useCallback(
    (value: boolean) => {
      if (isPhoneInitialized && userInteracted) {
        setNeedToSave(value)
      }
    },
    [isPhoneInitialized, userInteracted, setNeedToSave]
  )

  useEffect(() => {
    if (userData && !isPhoneInitialized) {
      let originalRegion = userData.region

      if (!originalRegion || !regions.find((r) => r.altName === originalRegion)) {
        originalRegion = detectRegionFromPhone(userData.phoneNumber || '')
      }

      console.log(
        'userData.vendorDetails?.address',
        (userData as any)?.vendorDetails?.address,
        'userData.vendorDetaild',
        (userData as any)?.vendorDetails
      )
      setOriginalData({
        phoneNumber: userData.phoneNumber || '',
        region: originalRegion,
        address: (userData as any)?.vendorDetails?.address || '',
        inn: userData.vendorDetails?.inn || ''
      })

      setTelText(userData.phoneNumber || '')
      setIsPhoneInitialized(true)
    }
  }, [userData, isPhoneInitialized, regions])

  useEffect(() => {
    if (!isPhoneInitialized || !userData || !originalData || !userInteracted) return

    const currentNational = getNationalNumber(telText, selectedRegion.altName)
    const originalNational = getNationalNumber(originalData.phoneNumber, originalData.region)

    const isRegionChanged = selectedRegion.altName !== originalData.region
    const isPhoneChanged = currentNational !== originalNational

    const currentAddress = vendorDetails?.address || ''
    const isAddressChanged = currentAddress !== originalData.address
    const isInnChange = vendorDetails?.inn !== originalData.inn

    safeSetNeedToSave(isRegionChanged || isPhoneChanged || isAddressChanged || isInnChange)
  }, [
    telText,
    selectedRegion,
    userData,
    isPhoneInitialized,
    userInteracted,
    originalData,
    safeSetNeedToSave,
    vendorDetails?.address,
    inn
  ])

  useEffect(() => {
    if (userData && !userInteracted) {
      let regionToSet: RegionType | undefined

      if (isVendor && userData?.vendorDetails && userData.vendorDetails?.countries?.length > 0) {
        const firstCountryName = userData.vendorDetails.countries[0].name
        regionToSet = regions.find((region) => region.altName === firstCountryName || region.title === firstCountryName)
        if (regionToSet) {
          console.log('Setting vendor region from countries:', regionToSet.altName)
        }
      }

      if (!regionToSet && userData.region) {
        regionToSet = regions.find((region) => region.altName === userData.region)
      }

      if (!regionToSet && userData.phoneNumber) {
        const detectedRegionName = detectRegionFromPhone(userData.phoneNumber)
        regionToSet = regions.find((r) => r.altName === detectedRegionName)
        if (regionToSet) {
          console.log('Setting region from phone detection:', regionToSet.altName)
        }
      }

      if (!regionToSet) {
        regionToSet = regions.find((r) => r.altName === 'other')
      }

      if (regionToSet) {
        setSelectedRegion(regionToSet)
      }
    }
  }, [userData, regions, userInteracted, isVendor])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleRegionSelect = (region: RegionType) => {
    setUserInteracted(true)
    setSelectedRegion(region)
    setListIsOpen(false)

    const cleanedNumber = telText.replace(/\D/g, '')
    const isValid = validatePhoneLength(cleanedNumber, getSafeNumberStart(region.altName))
    setIsValidNumber(isValid)
  }

  const onChangeTelNumber = (val: string) => {
    if (!userInteracted) {
      setUserInteracted(true)
    }

    const cleanedNumber = val.replace(/\D/g, '')
    const countryForValidation = getSafeNumberStart(selectedRegion.altName)

    const isValid = validatePhoneLength(cleanedNumber, countryForValidation)

    updateUserProfile({phoneNumber: cleanedNumber})
    setTelText(cleanedNumber)
    setIsValidNumber(isValid)

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
  }

  const handleSavePassword = async () => {
    if (password.length <= 3) return

    try {
      const res = await axiosClassic.post<{accessToken: string; refreshToken: string}>(
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

      toast.success(t('codeInEmail') + ' ' + userData?.email)
      setModalIsOpen(true)
    } catch {
      toast.error(t('errorUpdatePassword'))
      setModalIsOpen(false)
    }
  }

  const closeModal = () => {
    setModalIsOpen(false)
    setPassword('')
    setShowPasswordSaveButton(false)
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
      setShowPasswordSaveButton(false)
    } catch {
      toast.error(t('dontChangePassword'))
    }
  }

  const countryOptions: MultiSelectOption[] = [
    {id: 'belarus', label: t('belarus'), value: 'Belarus', icon: belarusSvg},
    {id: 'kazakhstan', label: t('kazakhstan'), value: 'Kazakhstan', icon: kazakhstanSvg},
    {id: 'china', label: t('china'), value: 'China', icon: chinaSvg},
    {id: 'russia', label: t('russia'), value: 'Russia', icon: russiaSvg}
  ]

  const determineSelectedRegion = (selectedCountries: MultiSelectOption[], regions: RegionType[]): RegionType => {
    if (selectedCountries.length !== 1) {
      return getOtherRegion(regions)
    }

    const countryValue = selectedCountries[0].value
    const region = regions.find(
      (r) =>
        r.altName.toLowerCase() === countryValue.toLowerCase() || r.title.toLowerCase() === countryValue.toLowerCase()
    )

    return region || getOtherRegion(regions)
  }

  useEffect(() => {
    if (isVendor && userInteracted) {
      const newSelectedRegion = determineSelectedRegion(selectedCountries, regions)

      if (newSelectedRegion.altName !== selectedRegion.altName) {
        setSelectedRegion(newSelectedRegion)

        if (telText) {
          const cleanedNumber = telText.replace(/\D/g, '')
          const isValid = validatePhoneLength(cleanedNumber, getSafeNumberStart(newSelectedRegion.altName))
          setIsValidNumber(isValid)
        }
      }
    }
  }, [selectedCountries, isVendor, userInteracted, regions, selectedRegion.altName, telText])

  return (
    <div className={styles.account_form}>
      <ModalWindowDefault isOpen={modalIsOpen} onClose={closeModal}>
        <p className={`${styles.modal__text}`}>{t('wannaChangePassword')}</p>
        <p className={`${styles.modal__text__mini}`}>{t('enterCodeFromEmail')}</p>
        <div style={{width: '100%', marginBottom: '10px'}}>
          <InputOtp length={4} onComplete={closeModalOtp} />
        </div>
      </ModalWindowDefault>

      {/* <div className={styles.form_row}> */}
      {isShowForOwner && (
        <div className={styles.form_col_half}>
          <div className={styles.editable}>
            <span className={styles.editable_text}>{t('password')}</span>
            <div className={styles.editable_wrap}>
              <TextInputUI
                extraClass={styles.editable_input}
                theme='newWhite'
                currentValue={password}
                onSetValue={(value) => {
                  setPassword(value)
                  if (value.length > 3) {
                    setShowPasswordSaveButton(true)
                    setUserInteracted(true)
                  } else {
                    setShowPasswordSaveButton(false)
                  }
                }}
                isSecret={true}
                placeholder={t('createNewPassword')}
              />
              {showPasswordSaveButton && (
                <button
                  onClick={handleSavePassword}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#2E7D32',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {t('savePassword') || 'Сохранить пароль'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!isVendor && (
        <div className={styles.form_col_half}>
          <div className={styles.editable}>
            <span className={styles.editable_text}>{t('regions')}</span>
            <div className={styles.editable_wrap}>
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
                  isOnlyShow={!isShowForOwner}
                  extraDropListClass={styles.extra_none_transform}
                  extraClass={styles.profile__region__dropdown__extra}
                  options={countryOptions}
                  selectedValues={selectedCountries}
                  onChange={(values) => {
                    console.log('selected countries before change', selectedCountries)
                    setSelectedCountries(values)
                    setUserInteracted(true)
                    console.log('country values', values)
                    console.log('selected countries after change', selectedCountries)
                    updateVendorDetailsAction({
                      ...vendorDetails,
                      countries: values.map((el) => {
                        return {name: el.label, value: el.value}
                      })
                    })
                  }}
                  placeholder={t('selectRegions')}
                  direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'bottom'}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {/* </div> */}

      {isVendor && (
        <div className={styles.form_row}>
          <div className={styles.form_col_full}>
            <div className={styles.editable}>
              <span className={styles.editable_text}>{t('address')}</span>
              <div className={styles.editable_wrap}>
                {isShowForOwner && (
                  <TextInputUI
                    disabled={!isShowForOwner}
                    extraClass={styles.editable_input}
                    theme='newWhite'
                    readOnly={!!onlyShowAddress}
                    currentValue={!isShowForOwner ? onlyShowAddress || '' : vendorDetails?.address || ''}
                    onSetValue={(value) => {
                      updateVendorAddress(value)
                      updateVendorDetailsAction({...vendorDetails, address: value})
                      console.log('value on set adress', value, 'vendorDetails after setter', vendorDetails)
                      if (value.length > 0) {
                        setUserInteracted(true)
                      }
                    }}
                    placeholder={t('addressPlaceholder')}
                  />
                )}
                {!isShowForOwner && (
                  <div className={styles.address__span}>
                    {!isShowForOwner ? onlyShowAddress || '' : vendorDetails?.address || ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.form_row} ${styles.form_row_grid}`}>
        <div className={styles.form_col_half}>
          <div className={styles.editable}>
            <span className={styles.editable_text}>{t('phoneNumber')}</span>
            <div className={styles.editable_wrap}>
              <TelephoneInputUI
                isOnlyShow={!isShowForOwner}
                currentValue={telText}
                extraClass={styles.extra__phone__class}
                error={!isValidNumber ? 'error' : ''}
                onSetValue={onChangeTelNumber}
                // numberStartWith={getSafeNumberStart(selectedRegion.altName)}
              />
            </div>
          </div>
        </div>
        {isVendor && isShowForOwner && (
          <div className={styles.form_row}>
            <div className={styles.form_col_full}>
              <div className={styles.editable}>
                <span className={styles.editable_text}>{t('inn')}</span>
                <div className={styles.editable_wrap}>
                  <TextInputUI
                    disabled={!isShowForOwner}
                    extraClass={styles.editable_input}
                    theme='newWhite'
                    currentValue={inn}
                    onFocus={() => {
                      setUserInteracted(true)
                    }}
                    onSetValue={(value) => {
                      setInn(value)
                      setUserInteracted(true)
                      updateVendorDetailsAction({...vendorDetails, inn: value})
                      if (value.length > 0) {
                        setUserInteracted(true)
                      }
                    }}
                    placeholder={t('innPlaceholder')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isVendor && !isShowForOwner && (
        <div className={styles.form_row}>
          <div className={styles.form_col_full}>
            <div className={styles.editable}>
              <span className={styles.editable_text}>{t('inn')}</span>
              <div className={styles.editable_wrap}>
                <TextInputUI
                  disabled={!isShowForOwner}
                  extraClass={styles.editable_input}
                  theme='newWhite'
                  currentValue={inn}
                  onFocus={() => {
                    setUserInteracted(true)
                  }}
                  onSetValue={(value) => {
                    setInn(value)
                    setUserInteracted(true)
                    updateVendorDetailsAction({...vendorDetails, inn: value})
                    if (value.length > 0) {
                      setUserInteracted(true)
                    }
                  }}
                  placeholder={t('innPlaceholder')}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {isVendor && (
        <div className={styles.form_col_half}>
          <div className={styles.editable}>
            <span className={styles.editable_text}>{t('categoryes')}</span>
            <div className={styles.editable_wrap}>
              <MultiDropSelect
                extraDropListClass={styles.extra_extraDropListClass}
                showSearchInput
                isOnlyShow={!isShowForOwner}
                extraClass={styles.profile__region__dropdown__extra}
                options={allCategories.map((category) => ({
                  id: category.id,
                  label: category.name,
                  value: category.name,
                  imageUrl: category?.imageUrl,
                  children: category.children?.map((child) => ({
                    id: child.id,
                    label: child.name,
                    value: child.name,
                    imageUrl: child.imageUrl,
                    children: child.children?.map((grandChild) => ({
                      id: grandChild?.id,
                      label: grandChild?.name,
                      value: grandChild?.name,
                      imageUrl: grandChild?.imageUrl,
                      children: grandChild?.children?.map((greatGrandChild) => ({
                        id: greatGrandChild?.id,
                        label: greatGrandChild?.name,
                        value: greatGrandChild?.name,
                        imageUrl: greatGrandChild?.imageUrl
                      }))
                    }))
                  }))
                }))}
                isCategories={true}
                selectedValues={categories}
                onChange={(values) => {
                  setCategories(values)
                  setUserInteracted(true)
                  updateVendorDetailsAction({
                    ...vendorDetails,
                    productCategories: values.map((el) => {
                      return {id: el?.id.toString(), name: el?.value, icon: el?.icon}
                    })
                  })
                }}
                placeholder={t('selectCategoryes')}
                direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'bottom'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileForm
