'use client'

import styles from './RegisterPage.module.scss'
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
import Header from '@/components/MainComponents/Header/Header'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'

const russiaSvg = '/countries/russia.svg'

interface AuthResponse {
  accessToken: string
  refreshToken: string
}

interface ErrorResponse {
  message: string
  code?: string
  status: number
  error?: string
}

const RegisterPage = ({categories}: {categories?: Category[]}) => {
  const router = useRouter()
  const t = useTranslations('RegisterUserPage')
  const id = useId()

  // Состояния шагов
  const [showFinalStep, setShowFinalStep] = useState(false)

  // Модальное окно
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)

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
  useEffect(() => {
    if (showFinalStep) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [showFinalStep])
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
      router.replace('/profile')
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
            countries: ['other'],
            productCategories: selectedCategories.map((c) => c.value),
            phoneNumber: fullPhoneNumber?.length <= 1 ? '' : fullPhoneNumber,
            avatarUrl: avatarUrl
          }

      await axiosClassic
        .post(isUser ? '/auth/register' : '/auth/register-vendor', registrationData, {
          headers: {'Accept-Language': currentLang}
        })
        .then(() => {
          // Сохраняем данные в Redux
          setPassword(password)
          setNumber(trueTelephoneNumber)
          setName(name)
          if (isUser) {
            setRegion(selectedRegion.altName)
          }

          setShowFinalStep(true)
        })
        .catch((error) => {
          const errorData: ErrorResponse = error?.response?.data
          const status = errorData?.status || error?.response?.status

          // Обработка ошибки 409 - пользователь уже зарегистрирован
          if (status === 409) {
            setModalContent(
              <div style={{padding: '20px', textAlign: 'center'}}>
                <h3 style={{marginBottom: '16px', fontSize: '20px', fontWeight: 'bold'}}>
                  {t('userAlreadyRegistered')}
                </h3>
                <p style={{marginBottom: '20px', lineHeight: 1.6}}>
                  {t('userAlreadyRegisteredText').replace('{email}', email)}{' '}
                  <Link href='/login?resetPassword=true' style={{color: '#0066cc', textDecoration: 'underline'}}>
                    {t('loginOrResetPassword')}
                  </Link>
                </p>
              </div>
            )
            setIsModalOpen(true)
            return
          }

          // Обработка других ошибок
          toast.error(
            <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
              <strong
                style={{
                  display: 'block',
                  marginBottom: 4,
                  fontSize: '18px'
                }}
              >
                {t('defaultRegisterError')}
              </strong>
              <span>{errorData?.message || error?.message || ''}</span>
            </div>,
            {style: {background: '#AC2525'}}
          )
        })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Registration failed:', error)
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
      try {
        await refetch()
      } catch {
        router.push('/profile')
      }
      router.push('/profile')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const errorData: ErrorResponse = e?.response?.data
      const status = errorData?.status || e?.response?.status

      // Обработка ошибки 409 - пользователь уже зарегистрирован
      if (status === 409) {
        setModalContent(
          <div style={{padding: '20px', textAlign: 'center'}}>
            <h3 style={{marginBottom: '16px', fontSize: '20px', fontWeight: 'bold'}}>{t('userAlreadyRegistered')}</h3>
            <p style={{marginBottom: '20px', lineHeight: 1.6}}>
              {t('userAlreadyRegisteredText').replace('{email}', email)}{' '}
              <Link href='/login?resetPassword=true' style={{color: '#0066cc', textDecoration: 'underline'}}>
                {t('loginOrResetPassword')}
              </Link>
            </p>
          </div>
        )
        setIsModalOpen(true)
        setShowFinalStep(false)
        return
      }

      // Обработка других ошибок (400, 404, 429)
      if (status === 400 || status === 404 || status === 429) {
        let errorMessage = errorData?.message || t('errorWriteOTP')

        // Специфичные сообщения для разных кодов ошибок
        if (errorData?.code === 'INVALID_CODE') {
          errorMessage = t('invalidCode')
        } else if (errorData?.code === 'OUT_OF_ATTEMPTS') {
          errorMessage = t('outOfAttempts')
        } else if (status === 429) {
          errorMessage = t('tooManyRequests')
        } else if (status === 404) {
          errorMessage = t('emailNotFound')
        }

        // Если код неверный или превышено количество попыток - оставляем на финальном шаге
        if (errorData?.code !== 'INVALID_CODE' && errorData?.code !== 'OUT_OF_ATTEMPTS') {
          setShowFinalStep(false)
        }

        toast.error(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: '18px'
              }}
            >
              {t('verificationError')}
            </strong>
            <span>{errorMessage}</span>
          </div>,
          {style: {background: '#AC2525'}}
        )
        return
      }

      // Обработка неожиданных ошибок
      toast.error(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong
            style={{
              display: 'block',
              marginBottom: 4,
              fontSize: '18px'
            }}
          >
            {t('verificationError')}
          </strong>
          <span>{errorData?.message || t('errorWriteOTP')}</span>
        </div>,
        {style: {background: '#AC2525'}}
      )
      console.log(e)
    }
  }

  // Обратный переход
  const handleBackToSecond = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowFinalStep(false)
  }

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
  }

  return (
    <div className={`${styles.login__box}`}>
      <Header categories={categories} />
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
      <Footer useFixedFooter minMediaHeight={isUser ? 1250 : 1435} extraClass={`${styles.extraFooter}`} />

      {/* Модальное окно для ошибок */}
      <ModalWindowDefault isOpen={isModalOpen} onClose={handleCloseModal}>
        {modalContent}
      </ModalWindowDefault>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validatePhoneLength = (phone: string, country: TNumberStart): boolean => {
  return true
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
