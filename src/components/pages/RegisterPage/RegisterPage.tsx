'use client'

import styles from './RegisterPage.module.scss'
import MinimalHeader from '@/components/MainComponents/MinimalHeader/MinimalHeader'
import {useEffect, useState, useId} from 'react'
import {TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import {useActions} from '@/hooks/useActions'
import Link from 'next/link'
import {axiosClassic} from '@/api/api.interceptor'
import {saveTokenStorage} from '@/services/auth/auth.helper'
import {useRouter} from 'next/navigation'
import {toast} from 'sonner'
import RegisterUserThird from './RegisterUser/RegisterUserThird'
import Footer from '@/components/MainComponents/Footer/Footer'
import {Category} from '@/services/categoryes/categoryes.service'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {useUserQuery} from '@/hooks/useUserApi'
import LoginSlider from '../LoginPage/LoginSlider/LoginSlider'
import RegisterUserUnified from './RegisterUserUnified/RegisterUserUnified'
import {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import RegisterVendorUnified from './RegisterVendorUnified/RegisterVendorUnified'

const russiaSvg = '/countries/russia.svg'

interface AuthResponse {
  accessToken: string
  refreshToken: string
}

const RegisterPage = ({categories}: {categories?: Category[]}) => {
  const router = useRouter()
  const t = useTranslations('RegisterUserPage')
  const id = useId()

  // Состояния шагов
  const [showFinalStep, setShowFinalStep] = useState(false)

  // Тип аккаунта
  const [isUser, setIsUser] = useState(true)

  // Общие поля формы
  const [email, setEmailStore] = useState('')
  const [name, setNameState] = useState('')
  const [password, setPasswordState] = useState('')
  const [telText, setTelText] = useState('')
  const [trueTelephoneNumber, setTrueTelephoneNumber] = useState('')
  const [otpValue, setOtpValue] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const currentLang = useCurrentLanguage()
  const {refetch} = useUserQuery()

  // Пользовательские состояния
  const [listIsOpen, setListIsOpen] = useState(false)
  const [isValidNumber, setIsValidNumber] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState({
    imageSrc: russiaSvg,
    title: t('Russia'),
    altName: 'Russia'
  })

  // Company-specific state
  const [inn, setInn] = useState('')
  const [adress, setAdress] = useState('')

  const [selectedCountries, setSelectedCountries] = useState<MultiSelectOption[]>([])
  const [selectedCategories, setSelectedCategories] = useState<MultiSelectOption[]>([])

  // Redux actions
  const {setRegion, setPassword, setNumber, setName} = useActions()

  // Эффект для обновления «чистого» номера телефона
  useEffect(() => {
    const cleanedNumber = telText.replace(/\D/g, '')
    setTrueTelephoneNumber(cleanedNumber)
  }, [telText])

  // Обработка OAuth (Google / Telegram)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const emailFromUrl = url.searchParams.get('email')
    const pictureFromUrl = url.searchParams.get('picture')
    const accessToken = url.searchParams.get('accessToken')
    const refreshToken = url.searchParams.get('refreshToken')
    const username = url.searchParams.get('username')
    const firstName = url.searchParams.get('first_name')
    const lastName = url.searchParams.get('last_name')

    if (accessToken && refreshToken) {
      saveTokenStorage({accessToken, refreshToken})
      router.replace('/')
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (emailFromUrl) setEmailStore(decodeURIComponent(emailFromUrl))
    if (pictureFromUrl) setAvatarUrl(decodeURIComponent(pictureFromUrl))
    if (username) setNameState(decodeURIComponent(username))
    else if (firstName || lastName) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim()
      if (fullName) setNameState(fullName)
    }
  }, [router])

  // Хендлеры
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption((prev) => (prev === e.target.value ? '' : e.target.value))
  }

  const onChangeTelNumber = (val: string) => {
    const cleanedNumber = val.replace(/\D/g, '')
    const isValid = validatePhoneLength(cleanedNumber, selectedRegion.altName as TNumberStart)
    setTelText(val)
    setIsValidNumber(isValid)
    setTrueTelephoneNumber(cleanedNumber)
  }

  const handleNameChange = (value: string) => {
    setNameState(value)
  }

  // Регистрация пользователя
  // const onSubmitUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault()

  //   try {
  //     const fullPhoneNumber = getCountryCode(selectedRegion.altName) + trueTelephoneNumber

  //     const registrationData = {
  //       email,
  //       login: name,
  //       password,
  //       region: selectedRegion.altName,
  //       phoneNumber: fullPhoneNumber?.length <= 4 ? '' : fullPhoneNumber,
  //       avatarUrl: avatarUrl
  //     }

  //     axiosClassic.post('/auth/register', registrationData, {
  //       headers: {'Accept-Language': currentLang}
  //     })

  //     setPassword(password)
  //     setNumber(trueTelephoneNumber)
  //     setName(name)
  //     setRegion(selectedRegion.altName)
  //     setShowFinalStep(true)
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   } catch (error: any) {
  //     const errorMessage = error.response?.data?.message || t('defaultRegisterError')
  //     toast.error(
  //       <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
  //         <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('defaultRegisterError')}</strong>
  //         <span>{errorMessage}</span>
  //       </div>,
  //       {style: {background: '#AC2525'}}
  //     )
  //   }
  // }

  const onSubmitRegistration = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    try {
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
          }

      await axiosClassic.post(isUser ? '/auth/register' : '/auth/register-vendor', registrationData, {
        headers: {'Accept-Language': currentLang}
      })

      // Сохраняем данные в Redux
      setPassword(password)
      setNumber(trueTelephoneNumber)
      setName(name)
      if (isUser) {
        setRegion(selectedRegion.altName)
      }

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

  // Подтверждение кода
  const onSubmitThirdStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const {data} = await axiosClassic.post<AuthResponse>(
        '/auth/verify-email',
        {email, code: otpValue},
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

  // Обратный переход
  const handleBackToSecond = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowFinalStep(false)
  }

  return (
    <div className={`${styles.login__box}`}>
      <MinimalHeader categories={categories} />
      <div className='container'>
        <div className={`${styles.login__inner}`}>
          <form onSubmit={(e) => e.preventDefault()} className={`${styles.login__form__box}`} id={id}>
            <div className={`${styles.top__links}`}>
              <Link href='/login' className={`${styles.toggle__action__button}`}>
                {t('haveAccount')}
              </Link>
            </div>

            <h2 className={`${styles.login__title}`}>{isUser ? t('registerTitle') : t('registerTitleCompany')}</h2>

            <div className={styles.button__box__switch}>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsUser(true)
                }}
                className={`${styles.toggle__action__button} ${isUser && styles.active__user_button}`}
              >
                {t('imUser')}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsUser(false)
                }}
                className={`${styles.toggle__action__button} ${!isUser && styles.active__user_button}`}
              >
                {t('imVendor')}
              </button>
            </div>
            <div className={`${styles.inputs__box}`}>
              {/* Форма пользователя */}
              {isUser && !showFinalStep && (
                <RegisterUserUnified
                  name={name}
                  password={password}
                  email={email}
                  telText={telText}
                  selectedRegion={selectedRegion}
                  listIsOpen={listIsOpen}
                  isValidNumber={isValidNumber}
                  selectedOption={selectedOption}
                  setName={setNameState}
                  setPassword={setPasswordState}
                  setEmail={setEmailStore}
                  setTelText={setTelText}
                  setSelectedRegion={setSelectedRegion}
                  setListIsOpen={setListIsOpen}
                  handleNameChange={handleNameChange}
                  onChangeTelNumber={onChangeTelNumber}
                  handleOptionChange={handleOptionChange}
                  onSubmit={onSubmitRegistration}
                />
              )}

              {/* Форма компании */}
              {!isUser && !showFinalStep && (
                <RegisterVendorUnified
                  inn={inn}
                  adress={adress}
                  setAdress={setAdress}
                  name={name}
                  password={password}
                  telText={telText}
                  email={email}
                  selectedOption={selectedOption}
                  isValidNumber={isValidNumber}
                  setInn={setInn}
                  setName={setNameState}
                  setPassword={setPasswordState}
                  setTelText={setTelText}
                  setEmail={setEmailStore}
                  handleNameChange={handleNameChange}
                  onChangeTelNumber={onChangeTelNumber}
                  handleOptionChange={handleOptionChange}
                  onSubmit={onSubmitRegistration}
                  selectedCountries={selectedCountries}
                  selectedCategories={selectedCategories}
                  setSelectedCountries={setSelectedCountries}
                  setSelectedCategories={setSelectedCategories}
                />
              )}

              {/* Третий шаг — подтверждение email */}
              {showFinalStep && (
                <RegisterUserThird
                  email={email}
                  otpValue={otpValue}
                  setOtpValue={setOtpValue}
                  handleOtpComplete={setOtpValue}
                  onBack={handleBackToSecond}
                  onConfirm={onSubmitThirdStep}
                />
              )}
            </div>
          </form>
          <LoginSlider />
        </div>
      </div>
      <Footer extraClass={`${styles.extraFooter}`} />
    </div>
  )
}

// === Валидация длины номера ===
const validatePhoneLength = (phone: string, country: TNumberStart): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 0) return true
  switch (country) {
    case 'Belarus':
      return cleaned.length === 9
    case 'China':
      return cleaned.length === 11
    case 'Russia':
    case 'Kazakhstan':
      return cleaned.length >= 7
    case 'other':
    default:
      return cleaned.length >= 1
  }
}

// === Определение телефонного кода страны ===
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

export default RegisterPage
