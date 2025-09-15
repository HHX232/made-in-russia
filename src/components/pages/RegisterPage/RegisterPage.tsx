'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import styles from './RegisterPage.module.scss'
import MinimalHeader from '@/components/MainComponents/MinimalHeader/MinimalHeader'
import {useEffect, useState} from 'react'
import {TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import {useActions} from '@/hooks/useActions'
import Link from 'next/link'
import {axiosClassic} from '@/api/api.interceptor'
import {saveTokenStorage} from '@/services/auth/auth.helper'
import {useRouter, useSearchParams} from 'next/navigation'
import {toast} from 'sonner'
import RegisterUserFirst from './RegisterUser/RegisterUserFirst'
import RegisterUserSecond from './RegisterUser/RegisterUserSecond'
import RegisterUserThird from './RegisterUser/RegisterUserThird'
import RegisterCompany from './RegisterCompany/RegisterCompany'
import {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import Footer from '@/components/MainComponents/Footer/Footer'
import {Category} from '@/services/categoryes/categoryes.service'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {useUserQuery} from '@/hooks/useUserApi'

// const decorImage = '/login__image.jpg'
const belarusSvg = '/countries/belarus.svg'
const kazakhstanSvg = '/countries/kazakhstan.svg'
const chinaSvg = '/countries/china.svg'
const russiaSvg = '/countries/russia.svg'

interface AuthResponse {
  accessToken: string
  refreshToken: string
}

const RegisterPage = ({categories}: {categories?: Category[]}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('RegisterUserPage')

  // Новое состояние для выбора типа пользователя
  const [userTypeSelected, setUserTypeSelected] = useState(false)

  // Form steps state
  const [showNextStep, setShowNextStep] = useState(false)
  const [showFinalStep, setShowFinalStep] = useState(false)

  // User/Company toggle
  const [isUser, setIsUser] = useState(true)

  // Common form fields state
  const [email, setEmailStore] = useState('')
  const [name, setNameState] = useState('')
  const [password, setPasswordState] = useState('')
  const [telText, setTelText] = useState('')
  const [trueTelephoneNumber, setTrueTelephoneNumber] = useState('')
  const [otpValue, setOtpValue] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const currentLang = useCurrentLanguage()

  // User-specific state
  const [listIsOpen, setListIsOpen] = useState(false)
  const [errorInName, setErrorInName] = useState<null | string>(null)
  const [isValidNumber, setIsValidNumber] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState({
    imageSrc: russiaSvg,
    title: t('Russia'),
    altName: 'Russia'
  })

  // Company-specific state
  const [inn, setInn] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<MultiSelectOption[]>([])
  const [selectedCategories, setSelectedCategories] = useState<MultiSelectOption[]>([])
  const [adress, setAdress] = useState('')
  // Redux hooks
  const {setRegion, setPassword, setNumber, setName} = useActions()

  // Effects
  useEffect(() => {
    const cleanedNumber = telText.replace(/\D/g, '')
    setTrueTelephoneNumber(cleanedNumber)
  }, [telText])

  // Обработка параметров из URL (Google OAuth, Telegram и токенов)
  useEffect(() => {
    const emailFromUrl = searchParams?.get('email')
    const pictureFromUrl = searchParams?.get('picture')
    const accessToken = searchParams?.get('accessToken')
    const refreshToken = searchParams?.get('refreshToken')
    const telegramId = searchParams?.get('telegram_id')
    const username = searchParams?.get('username')
    const firstName = searchParams?.get('first_name')
    const lastName = searchParams?.get('last_name')

    // Сохраняем токены если они пришли в URL
    if (accessToken && refreshToken) {
      saveTokenStorage({accessToken, refreshToken})
      router.replace('/') // Перенаправляем на главную после успешной авторизации
      return
    }

    const fetchToTg = async () => {
      try {
        console.log('start fetch to tg')
        if (!telegramId && !firstName) {
          return
        }
        const res = await axiosClassic.post('oauth2/telegram/callback', {
          id: telegramId || '',
          lastName: lastName || '',
          firstName: firstName || '',
          photoUrl: pictureFromUrl || '',
          authDate: '',
          hash: ''
        })
        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('successTitleTG')}</strong>
            <span>{t('successBodyTG')}</span>
          </div>,
          {
            style: {background: '#2E7D32'}
          }
        )
      } catch {
        toast.error(
          <div style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>{t('errorTitleTG')}</strong>
            <span>{t('errorPrefixTG')}</span>
          </div>,
          {
            style: {background: '#AC2525'}
          }
        )
      }
    }
    fetchToTg()

    if (emailFromUrl) {
      const decodedEmail = decodeURIComponent(emailFromUrl)
      setEmailStore(decodedEmail)
    }

    if (pictureFromUrl) {
      const decodedPicture = decodeURIComponent(pictureFromUrl)
      setAvatarUrl(decodedPicture)
    }

    // Обрабатываем данные из Telegram
    if (username) {
      const decodedUsername = decodeURIComponent(username)
      setNameState(decodedUsername) // Устанавливаем username как имя
    }

    // Можно также использовать имя и фамилию из Telegram если username нет
    if (!username && (firstName || lastName)) {
      const decodedFirstName = firstName ? decodeURIComponent(firstName) : ''
      const decodedLastName = lastName ? decodeURIComponent(lastName) : ''
      const fullName = `${decodedFirstName} ${decodedLastName}`.trim()
      if (fullName) {
        setNameState(fullName)
      }
    }
  }, [searchParams, router])

  // Reset form when switching between user and company
  useEffect(() => {
    setShowNextStep(false)
    setShowFinalStep(false)
    // Не сбрасываем email, avatarUrl, name если они пришли из OAuth (Google/Telegram)
    const emailFromUrl = searchParams?.get('email')
    const pictureFromUrl = searchParams?.get('picture')
    const usernameFromUrl = searchParams?.get('username')
    const firstNameFromUrl = searchParams?.get('first_name')
    const lastNameFromUrl = searchParams?.get('last_name')

    if (!emailFromUrl) {
      setEmailStore('')
    }
    if (!pictureFromUrl) {
      setAvatarUrl('')
    }
    // Не сбрасываем имя если оно пришло из Telegram
    if (!usernameFromUrl && !firstNameFromUrl && !lastNameFromUrl) {
      setNameState('')
    }
    setPasswordState('')
    setTelText('')
    setSelectedOption('')
    setInn('')
    setSelectedCountries([])
    setSelectedCategories([])
  }, [isUser, searchParams])

  // Handlers
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption((prevSelected) => (prevSelected === e.target.value ? '' : e.target.value))
  }

  const handleOtpComplete = (value: string) => {
    setOtpValue(value)
  }

  const onChangeTelNumber = (val: string) => {
    const cleanedNumber = val.replace(/\D/g, '')
    let countryForValidation: TNumberStart = 'Russia'

    if (isUser) {
      countryForValidation = selectedRegion.altName as TNumberStart
    } else if (selectedCountries.length > 0) {
      if (selectedCountries.length === 1) {
        countryForValidation = selectedCountries[0].value as TNumberStart
      } else {
        countryForValidation = 'other' as TNumberStart
      }
    }

    const isValid = validatePhoneLength(cleanedNumber, countryForValidation)
    console.log('isValid', isValid, 'countryForValidation', countryForValidation)
    setTelText(val)
    setIsValidNumber(isValid)
    setTrueTelephoneNumber(cleanedNumber)
  }

  const handleNameChange = (value: string) => {
    setErrorInName(null)
    setNameState(value)
  }

  // Helper function to get country code
  const getCountryCode = (country: string): string => {
    switch (country) {
      case 'Belarus':
        return '+375'
      case 'China':
        return '+86'
      case 'Russia':
      case 'Kazakhstan':
        return '+7'
      default:
        return '+'
    }
  }

  // Новые обработчики для выбора типа пользователя
  const handleUserTypeSelect = (type: 'user' | 'company') => {
    setIsUser(type === 'user')
    setUserTypeSelected(true)
  }

  const handleBackToUserTypeSelection = () => {
    setUserTypeSelected(false)
    setShowNextStep(false)
    setShowFinalStep(false)
  }

  // Step 1 submit
  const onSubmitFirstStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isUser) {
      if (name.length < 3 || !isValidNumber || password.length < 6) {
        // Validation error
      } else {
        setPassword(password)
        setNumber(trueTelephoneNumber)
        setName(name)
        setRegion(selectedRegion.altName)
        setShowNextStep(true)
      }
    } else {
      // Company validation - пароль теперь на втором шаге
      if (inn.length < 9 || name.length < 3 || !isValidNumber || selectedCountries.length === 0) {
        // Validation error
      } else {
        setNumber(trueTelephoneNumber)
        setName(name)
        // Сохраняем страны в Redux если нужно
        setShowNextStep(true)
      }
    }
  }

  // Step 2 submit
  const onSubmitSecondStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Сохраняем пароль для компании на втором шаге
    if (!isUser) {
      setPassword(password)
    }

    try {
      // Формируем полный номер телефона с кодом страны
      let fullPhoneNumber = trueTelephoneNumber

      if (isUser) {
        const countryCode = getCountryCode(selectedRegion.altName)
        fullPhoneNumber = countryCode + trueTelephoneNumber
      } else if (selectedCountries.length > 0) {
        const countryCode = getCountryCode(selectedCountries[0].value)
        fullPhoneNumber = countryCode + trueTelephoneNumber
      }

      const registrationData = isUser
        ? {
            email,
            login: name,
            password,
            region: selectedRegion.altName,
            phoneNumber: fullPhoneNumber?.length <= 4 ? '' : fullPhoneNumber,
            avatarUrl: avatarUrl
            // type: 'user'
          }
        : {
            email,
            login: name,
            inn,
            address: adress || '',
            password,
            countries: selectedCountries.map((c) => c.value),
            productCategories: selectedCategories.map((c) => c.value),
            phoneNumber: fullPhoneNumber?.length <= 4 ? '' : fullPhoneNumber,
            avatarUrl: avatarUrl
            // type: 'company'
          }

      const response = axiosClassic.post(isUser ? '/auth/register' : '/auth/register-vendor', registrationData, {
        headers: {'Accept-Language': currentLang}
      })

      // console.log('Registration successful:', {email, name})
      setShowNextStep(false)
      setShowFinalStep(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data?.message)
      const errorMessage = error.response?.data?.message || t('defaultRegisterError')

      toast.error(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('defaultRegisterError')}</strong>
          <span>{errorMessage}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
    }
  }

  const {refetch} = useUserQuery()
  // Step 3 submit
  const onSubmitThirdStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const {data} = await axiosClassic.post<AuthResponse>(
        '/auth/verify-email',
        {
          email: email,
          code: otpValue
        },
        {headers: {'Accept-Language': currentLang}}
      )

      const {accessToken, refreshToken} = data
      saveTokenStorage({accessToken, refreshToken})
      await refetch()
      router.push('/')
    } catch (e) {
      console.log(e)
    }
  }

  // Navigation handlers
  const handleBackToFirst = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowNextStep(false)
    setShowFinalStep(false)
  }

  const handleBackToSecond = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowNextStep(true)
    setShowFinalStep(false)
  }

  // Компонент выбора типа пользователя
  const UserTypeSelection = () => (
    <div className={styles.user_type_selection}>
      <h2 className={styles.login__title}>{t('chooseUserType') || 'Выберите тип аккаунта'}</h2>

      <div className={styles.user_type_buttons}>
        <button
          className={`${styles.user_type_button} ${styles.buyer_button}`}
          onClick={() => handleUserTypeSelect('user')}
        >
          <span className={styles.button_text}>{t('imBuyer') || 'Я покупатель'}</span>
        </button>

        <button
          className={`${styles.user_type_button} ${styles.exporter_button}`}
          onClick={() => handleUserTypeSelect('company')}
        >
          <span className={styles.button_text}>{t('imExporter') || 'Я компания Экспортер'}</span>
        </button>

        <Link href='/login' className={styles.login_link_button}>
          {t('haveAccount') || 'Есть аккаунт? Войти!'}
        </Link>
      </div>
    </div>
  )

  return (
    <div className={`${styles.login__box}`}>
      <MinimalHeader categories={categories} />
      <div className='container'>
        <div className={`${styles.login__inner}`}>
          <div className={styles.decor__image}></div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className={`${styles.login__form__box}`}
          >
            {/* Показываем выбор типа пользователя если тип не выбран */}
            {!userTypeSelected && <UserTypeSelection />}

            {/* Показываем форму регистрации если тип выбран */}
            {userTypeSelected && (
              <>
                <div className={`${styles.top__links}`}>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setIsUser(!isUser)
                    }}
                    className={`${styles.toggle__action__button}`}
                  >
                    {isUser ? t('imVendor') : t('imUser')}
                  </button>
                  <Link href='/login' className={`${styles.toggle__action__button}`}>
                    {t('haveAccount')}
                  </Link>
                </div>

                <h2 className={`${styles.login__title}`}>{isUser ? t('registerTitle') : t('registerTitleCompany')}</h2>

                <div className={`${styles.inputs__box}`}>
                  {/* Для пользователей */}
                  {isUser && !showNextStep && !showFinalStep && (
                    <RegisterUserFirst
                      name={name}
                      password={password}
                      telText={telText}
                      selectedRegion={selectedRegion}
                      listIsOpen={listIsOpen}
                      isValidNumber={isValidNumber}
                      setName={setNameState}
                      setPassword={setPasswordState}
                      setTelText={setTelText}
                      setSelectedRegion={setSelectedRegion}
                      setListIsOpen={setListIsOpen}
                      setIsValidNumber={setIsValidNumber}
                      handleNameChange={handleNameChange}
                      onChangeTelNumber={onChangeTelNumber}
                      onSubmit={onSubmitFirstStep}
                    />
                  )}

                  {isUser && showNextStep && !showFinalStep && (
                    <RegisterUserSecond
                      email={email}
                      selectedOption={selectedOption}
                      setEmail={setEmailStore}
                      handleOptionChange={handleOptionChange}
                      onBack={handleBackToFirst}
                      onNext={onSubmitSecondStep}
                    />
                  )}

                  {/* Для компаний */}
                  {!isUser && !showFinalStep && (
                    <RegisterCompany
                      inn={inn}
                      adress={adress}
                      setAdress={setAdress}
                      name={name}
                      password={password}
                      telText={telText}
                      email={email}
                      selectedOption={selectedOption}
                      isValidNumber={isValidNumber}
                      selectedCountries={selectedCountries}
                      selectedCategories={selectedCategories}
                      setInn={setInn}
                      setName={setNameState}
                      setPassword={setPasswordState}
                      setTelText={setTelText}
                      setEmail={setEmailStore}
                      setIsValidNumber={setIsValidNumber}
                      setSelectedCountries={setSelectedCountries}
                      setSelectedCategories={setSelectedCategories}
                      handleNameChange={handleNameChange}
                      onChangeTelNumber={onChangeTelNumber}
                      handleOptionChange={handleOptionChange}
                      showNextStep={showNextStep}
                      onSubmitFirstStep={onSubmitFirstStep}
                      onSubmitSecondStep={onSubmitSecondStep}
                      handleBackToFirst={handleBackToFirst}
                    />
                  )}

                  {/* Общий третий шаг для всех */}
                  {showFinalStep && (
                    <RegisterUserThird
                      email={email}
                      otpValue={otpValue}
                      setOtpValue={setOtpValue}
                      handleOtpComplete={handleOtpComplete}
                      onBack={handleBackToSecond}
                      onConfirm={onSubmitThirdStep}
                    />
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
      <Footer extraClass={`${styles.extraFooter}`} />
    </div>
  )
}

const validatePhoneLength = (phone: string, country: TNumberStart): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '')
  if (cleanedPhone.length === 0) return true
  switch (country) {
    case 'Belarus':
      return cleanedPhone.length === 9
    case 'China':
      return cleanedPhone.length === 11
    case 'Russia':
    case 'Kazakhstan':
      return cleanedPhone.length >= 7
    case 'other':
    default:
      return cleanedPhone.length >= 1
  }
}

export default RegisterPage
