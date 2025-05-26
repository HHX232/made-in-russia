'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from 'next/image'
import styles from './RegisterPage.module.scss'
import MinimalHeader from '@/components/MainComponents/MinimalHeader/MinimalHeader'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import {useEffect, useId, useState} from 'react'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI, TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import Link from 'next/link'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import {axiosClassic} from '@/api/api.interceptor'
import InputOtp from '@/components/UI-kit/inputs/inputOTP/inputOTP'
import {saveTokenStorage, saveToStorage} from '@/services/auth/auth.helper'
import {Router} from 'next/router'
import {useRouter} from 'next/navigation'
import {toast} from 'sonner'

const decorImage = '/login__image.jpg'
const belarusSvg = '/belarus.svg'
interface AuthResponse {
  accessToken: string
  refreshToken: string
}
const RegionItem = ({
  imageSrc,
  title,
  altName,
  onClickF
}: {
  imageSrc: string
  title: string
  altName: string
  onClickF?: () => void
}) => {
  const id = useId()
  return (
    <div onClick={onClickF} key={id} className={`${styles.region__item}`}>
      <Image className={`${styles.region__image}`} src={imageSrc} alt={altName} width={18} height={18} />
      <p className={`${styles.region__text}`}>{title}</p>
    </div>
  )
}

const RegisterPage = () => {
  const [selectedOption, setSelectedOption] = useState('')
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.value === selectedOption)
    setSelectedOption((prevSelected) => (prevSelected === e.target.value ? '' : e.target.value))
  }

  // ! STEPS FORM
  const [showNextStep, setShowNextStep] = useState(false)
  const [showFinalStep, setShowFinalStep] = useState(false)
  //
  const router = useRouter()
  const [email, setEmailStore] = useState('')
  const [name, setNameState] = useState('')
  const [password, setPasswordState] = useState('')
  const [listIsOpen, setListIsOpen] = useState(false)
  const [telText, setTelText] = useState('')
  const [trueTelephoneNumber, setTrueTelephoneNumber] = useState('')

  const [errorInName, setErrorInName] = useState<null | string>(null)
  const [isValidNumber, setIsValidNumber] = useState(true)
  const {name: nameStore, password: passwordStores, number, region} = useTypedSelector((state) => state.registration)
  const [selectedRegion, setSelectedRegion] = useState({
    imageSrc: belarusSvg,
    title: 'Беларусь',
    altName: 'Belarus'
  })
  const {setRegion, setPassword, setNumber, setName, setEmail} = useActions()
  const [otpValue, setOtpValue] = useState<string>('')

  const handleOtpComplete = (value: string) => {
    setOtpValue(value)
    // console.log('OTP Value:', value)
  }
  // useEffect(() => {
  //   console.log(telText)
  // }, [telText])
  useEffect(() => {
    const cleanedNumber = telText.replace(/\D/g, '')
    setTrueTelephoneNumber(cleanedNumber)
  }, [telText, trueTelephoneNumber])

  const onChangeTelNumber = (val: string) => {
    const cleanedNumber = val.replace(/\D/g, '')

    const isValid = validatePhoneLength(cleanedNumber, selectedRegion.altName as TNumberStart)
    setTelText(val)
    setIsValidNumber(isValid)
    setTrueTelephoneNumber(cleanedNumber)
  }

  const regions = [
    {imageSrc: belarusSvg, title: 'Беларусь', altName: 'Belarus'},
    {imageSrc: belarusSvg, title: 'Казахстан', altName: 'Kazakhstan'},
    {imageSrc: belarusSvg, title: 'Китай', altName: 'China'},
    {imageSrc: belarusSvg, title: 'Россия', altName: 'Russia'}
  ]
  const handleNameChange = (value: string) => {
    if (/[0-9!@#$%^&*()_+=|<>?{}\[\]~\/]/.test(value)) {
      setErrorInName('Имя не должно содержать цифр или специальных символов')
    } else {
      setErrorInName(null)
      setNameState(value)
    }
  }
  const handleRegionSelect = (region: {imageSrc: string; title: string; altName: string}) => {
    setSelectedRegion(region)
    setListIsOpen(false)
  }

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (name.length < 3 || !isValidNumber || password.length < 6) {
      // console.log('all in error')
    } else {
      setPassword(password)
      setNumber(trueTelephoneNumber)
      setName(name)
      setRegion(selectedRegion.altName)
      setShowNextStep(true)
      // console.log('set: ', password, ' ', trueTelephoneNumber, ' ', name, ' ', selectedRegion.altName)
    }
  }
  return (
    <div className={`${styles.login__box}`}>
      <MinimalHeader />
      <div className='container'>
        <div className={`${styles.login__inner}`}>
          <Image
            className={styles.decor__image}
            src={decorImage}
            width={580}
            height={745}
            alt='декоративное изображение "Большое количество материалов"'
          />

          <form className={`${styles.login__form__box}`}>
            <Link href='/login' className={`${styles.toggle__action__button}`}>
              есть аккаунт? Войти!
            </Link>
            <h2 className={`${styles.login__title}`}>Регистрация</h2>
            <div className={`${styles.inputs__box}`}>
              {!showNextStep && !showFinalStep && (
                <>
                  {' '}
                  <div className={`${styles.some__drop__box}`}>
                    <p className={`${styles.input__title}`}>Страна/Регион</p>
                    <div className={`${styles.drop__box}`}>
                      <DropList
                        extraClass={`${styles.extra__drop__list}`}
                        gap='15'
                        extraListClass={`${styles.extra__list__style}`}
                        title={
                          <RegionItem
                            imageSrc={selectedRegion.imageSrc}
                            title={selectedRegion.title}
                            altName={selectedRegion.altName}
                          />
                        }
                        isOpen={listIsOpen}
                        onOpenChange={setListIsOpen}
                        items={regions.map((region, index) => (
                          <div
                            style={{width: '100%'}}
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRegionSelect(region)
                            }}
                          >
                            <RegionItem imageSrc={region.imageSrc} title={region.title} altName={region.altName} />
                          </div>
                        ))}
                      />
                    </div>
                  </div>
                  <TextInputUI
                    extraClass={`${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class}`}
                    isSecret={false}
                    onSetValue={handleNameChange}
                    currentValue={name}
                    placeholder='Введите имя...'
                    title={<p className={`${styles.input__title}`}>Полное имя</p>}
                  />
                  <TextInputUI
                    extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2}`}
                    isSecret={true}
                    onSetValue={setPasswordState}
                    currentValue={password}
                    errorValue={
                      password.length < 6 && password.length !== 0 ? 'Пароль должен быть не менее 6 символов' : ''
                    }
                    placeholder='Введите пароль, 6-20 символов'
                    title={<p className={`${styles.input__title}`}>Пароль аккаунта</p>}
                  />
                  <div className={`${styles.some__drop__box}`}>
                    <p className={`${styles.input__title}`}>Номер мобильного телефона</p>
                    <TelephoneInputUI
                      currentValue={telText}
                      error={!isValidNumber ? 'error' : ''}
                      onSetValue={onChangeTelNumber}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      numberStartWith={selectedRegion.altName as any}
                    />
                  </div>
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      onSubmit(e)
                    }}
                    className={`${styles.form__button}`}
                  >
                    Далее
                  </button>
                </>
              )}
              {showNextStep && (
                <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
                  <TextInputUI
                    extraClass={`${styles.inputs__text_extra} ${(!email.includes('@') || !email.includes('.')) && email.length !== 0 ? styles.extra__email__error : ''}`}
                    extraStyle={{width: '100%'}}
                    isSecret={false}
                    onSetValue={setEmailStore}
                    currentValue={email}
                    errorValue={
                      (!email.includes('@') || !email.includes('.')) && email.length !== 0
                        ? 'почта должна содержать @ и расширение'
                        : ''
                    }
                    placeholder='Введите почту...'
                    title={<p className={`${styles.input__title}`}>Почта</p>}
                  />
                  <p className={`${styles.input__subtitle}`}>Предпочтительна бизнес-электронная почта.</p>
                  <RadioButton
                    label='Я согласен с пользовательским соглашением и политикой конфиденциальности. '
                    name='Personal'
                    value='Personal'
                    checked={selectedOption === 'Personal'}
                    onChange={handleOptionChange}
                    allowUnchecked={true}
                  />

                  <button
                    style={{
                      opacity:
                        selectedOption === 'Personal' &&
                        email.includes('@') &&
                        email.includes('.') &&
                        email.length !== 0
                          ? 1
                          : 0.7,
                      pointerEvents:
                        selectedOption === 'Personal' &&
                        email.includes('@') &&
                        email.includes('.') &&
                        email.length !== 0
                          ? 'auto'
                          : 'none'
                    }}
                    className={`${styles.checked__email}`}
                    onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault()

                      try {
                        const response = await axiosClassic.post('/auth/register', {
                          email,
                          login: name,
                          password,
                          region: selectedRegion.altName,
                          phoneNumber: trueTelephoneNumber
                        })

                        console.log('Registration successful:', {
                          email,
                          name
                        })
                        setShowNextStep(false)
                        setShowFinalStep(true)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      } catch (error: any) {
                        console.error('Registration failed:', error.response.data.message)
                        if (error.response.data.message.includes('Пользователь с почтой')) {
                          toast.error(
                            <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
                              <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>
                                Ошибка регистрации
                              </strong>
                              <span>{error.response.data.message}</span>
                            </div>,
                            {
                              style: {
                                background: '#AC2525'
                              }
                            }
                          )
                        }
                      }
                    }}
                  >
                    Проверка электронной почты
                  </button>
                </div>
              )}

              {showFinalStep && (
                <div className={`${styles.inputOtp_section}`}>
                  <p className={`${styles.otp__text}`}>
                    Код подтверждения был отправлен на ваш адрес электронной почты{' '}
                    {email ? email : 'ваша почта@gmail.com'}
                  </p>
                  <InputOtp length={4} onComplete={handleOtpComplete} />
                </div>
              )}

              {showFinalStep && (
                <>
                  {' '}
                  <button
                    style={{
                      opacity: otpValue.length !== 0 ? 1 : 0.8,
                      pointerEvents: otpValue.length !== 0 ? 'auto' : 'none'
                    }}
                    className={`${styles.checked__email}`}
                    onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault()
                      try {
                        const {data} = await axiosClassic.post<AuthResponse>('/auth/verify-email', {
                          email: email,
                          code: otpValue
                        })

                        const {accessToken, refreshToken} = data
                        // console.log(accessToken, refreshToken)
                        saveTokenStorage({accessToken, refreshToken})
                        router.push('/')
                      } catch (e) {
                        console.log(e)
                      }
                    }}
                  >
                    Подтвердить
                  </button>
                  <Link href={'#'} className={styles.problem__link}>
                    Есть проблемы с получением кода?
                  </Link>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const validatePhoneLength = (phone: string, country: TNumberStart): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '')

  switch (country) {
    case 'Belarus':
      return cleanedPhone.length === 9 // Пример: 29 123 45 67 → 291234567 (9 цифр)
    case 'China':
      return cleanedPhone.length === 11 // Пример: 131 2345 6789 → 13123456789 (11 цифр)
    case 'Russia':
    case 'Kazakhstan':
    case 'other':
    default:
      return cleanedPhone.length === 10 // Пример: 912 345 67 89 → 9123456789 (10 цифр)
  }
}

export default RegisterPage
