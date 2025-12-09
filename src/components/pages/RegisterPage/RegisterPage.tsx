'use client'
import styles from './RegisterPage.module.scss'
import {useEffect, useState, useId} from 'react'
import {TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import {useActions} from '@/hooks/useActions'
import Link from 'next/link'
import {axiosClassic} from '@/api/api.interceptor'
import {saveTokenStorage} from '@/services/auth/auth.helper'
import {useRouter, useSearchParams} from 'next/navigation'
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
  const searchParams = useSearchParams()
  const t = useTranslations('RegisterUserPage')
  const id = useId()

  // Состояние для этапа выбора типа аккаунта
  const [showTypeSelection, setShowTypeSelection] = useState(true)
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

  // Проверка URL параметра type
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'user' || typeParam === 'vendor') {
      setShowTypeSelection(false)
      setIsUser(typeParam === 'user')
    }
  }, [searchParams])

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

  // Хендлеры для страницы выбора типа
  const handleSelectUserType = () => {
    setIsUser(true)
    setShowTypeSelection(false)
    router.push('/register?type=user', {scroll: false})
  }

  const handleSelectVendorType = () => {
    setIsUser(false)
    setShowTypeSelection(false)
    router.push('/register?type=vendor', {scroll: false})
  }

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.checked ? e.target.value : '')
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
        fullPhoneNumber = trueTelephoneNumber
      } else if (selectedCountries.length > 0) {
        fullPhoneNumber = trueTelephoneNumber
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

      if (status === 400 || status === 404 || status === 429) {
        let errorMessage = errorData?.message || t('errorWriteOTP')

        if (errorData?.code === 'INVALID_CODE') {
          errorMessage = t('invalidCode')
        } else if (errorData?.code === 'OUT_OF_ATTEMPTS') {
          errorMessage = t('outOfAttempts')
        } else if (status === 429) {
          errorMessage = t('tooManyRequests')
        } else if (status === 404) {
          errorMessage = t('emailNotFound')
        }

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

  const handleBackToSecond = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowFinalStep(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
  }

  // Рендер страницы выбора типа аккаунта
  if (showTypeSelection) {
    return (
      <div className={`${styles.login__box}`}>
        <Header categories={categories} />
        <div className='container'>
          <div className={`${styles.login__inner}`}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className={`${styles.login__form__box} ${styles.select_role_box}`}
            >
              <div className={styles.top__links}>
                <Link href='/login' className={styles.toggle__action__button}>
                  {t('haveAccount')}
                </Link>
              </div>

              <h2 className={styles.login__title}>{t('chooseAccountType')}</h2>

              <p className={styles.type_selection__subtitle}>{t('selectRoleDescription')}</p>

              <div className={styles.type_buttons__container}>
                <button
                  onClick={handleSelectUserType}
                  className={`${styles.type__button} ${styles.user__type__button}`}
                >
                  <div className={styles.type_button__icon}>
                    <svg width='48' height='48' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                  <div className={styles.type_button__content}>
                    <h3 className={styles.type_button__title}>{t('imUser')}</h3>
                    <p className={styles.type_button__description}>{t('buyerDescription')}</p>
                  </div>
                </button>

                <button
                  onClick={handleSelectVendorType}
                  className={`${styles.type__button} ${styles.vendor__type__button}`}
                >
                  <div className={styles.type_button__icon}>
                    <svg width='48' height='48' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M23 3H1V8H23V3Z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M12 18V3'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                  <div className={styles.type_button__content}>
                    <h3 className={styles.type_button__title}>{t('imVendor')}</h3>
                    <p className={styles.type_button__description}>{t('vendorDescription')}</p>
                  </div>
                </button>
              </div>

              {/* <div className={styles.type_selection__info}>
                <p className={styles.type_selection__info_text}>{t('canChangeType')}</p>
              </div> */}
            </form>
            <LoginSlider />
          </div>
        </div>
        <Footer useFixedFooter minMediaHeight={900} extraClass={`${styles.extraFooter}`} />
      </div>
    )
  }

  // Основная форма регистрации
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

            <div className={`${styles.inputs__box}`}>
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

// const getCountryCode = (country: string): string => {
//   switch (country) {
//     case 'Belarus':
//       return '+375'
//     case 'China':
//       return '+86'
//     case 'Russia':
//     case 'Kazakhstan':
//       return '+7'
//     default:
//       return '+'
//   }
// }

export default RegisterPage
