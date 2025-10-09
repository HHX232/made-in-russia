import React, {MouseEvent, useState, useEffect} from 'react'
import styles from '../RegisterPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI, TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import MultiDropSelect, {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'
import {useGoogleReCaptcha} from 'react-google-recaptcha-v3'
import {useCategories} from '@/services/categoryes/categoryes.service'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import axios from 'axios'

const belarusSvg = '/countries/belarus.svg'
const kazakhstanSvg = '/countries/kazakhstan.svg'
const chinaSvg = '/countries/china.svg'
const russiaSvg = '/countries/russia.svg'

interface RegisterVendorUnifiedProps {
  inn: string
  name: string
  email: string
  password: string
  adress: string
  telText: string
  selectedCountries: MultiSelectOption[]
  selectedCategories: MultiSelectOption[]
  isValidNumber: boolean
  selectedOption: string
  setInn: (value: string) => void
  setName: (value: string) => void
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  setAdress: (value: string) => void
  setTelText: (value: string) => void
  setSelectedCountries: (countries: MultiSelectOption[]) => void
  setSelectedCategories: (categories: MultiSelectOption[]) => void
  handleNameChange: (value: string) => void
  onChangeTelNumber: (value: string) => void
  handleOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RegisterVendorUnified: React.FC<RegisterVendorUnifiedProps> = ({
  inn,
  name,
  email,
  password,
  adress,
  telText,
  selectedCountries,
  selectedCategories,
  isValidNumber,
  selectedOption,
  setInn,
  handleNameChange,
  setEmail,
  setPassword,
  setAdress,
  onChangeTelNumber,
  setSelectedCountries,
  setSelectedCategories,
  handleOptionChange,
  onSubmit
}) => {
  const [isClient, setIsClient] = useState(false)
  const windowWidth = useWindowWidth()
  const t = useTranslations('RegisterUserPage')
  const {executeRecaptcha} = useGoogleReCaptcha()
  const currentLang = useCurrentLanguage()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = useCategories(currentLang as any)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Опции стран для мультивыбора
  const countryOptions: MultiSelectOption[] = [
    {id: 'belarus', label: t('Belarus'), value: 'Belarus', icon: belarusSvg},
    {id: 'kazakhstan', label: t('Kazakhstan'), value: 'Kazakhstan', icon: kazakhstanSvg},
    {id: 'china', label: t('China'), value: 'China', icon: chinaSvg},
    {id: 'russia', label: t('Russia'), value: 'Russia', icon: russiaSvg}
  ]

  const validateInn = (value: string) => {
    return /^\d*$/.test(value)
  }

  const handleInnChange = (value: string) => {
    if (validateInn(value)) {
      setInn(value)
    }
  }

  // Определяем страну для телефонного номера
  const phoneCountry =
    selectedCountries.length > 0
      ? selectedCountries.length === 1
        ? (selectedCountries[0].value as TNumberStart)
        : 'other'
      : 'Russia'

  const isEmailValid = email.includes('@') && email.includes('.') && email.length !== 0

  const canSubmit =
    inn.length >= 9 &&
    name.length >= 3 &&
    isEmailValid &&
    password.length >= 6 &&
    isValidNumber &&
    selectedCountries.length > 0 &&
    selectedOption === 'Personal'

  const handleSubmitForm = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!executeRecaptcha) return
    const gRecaptchaToken = await executeRecaptcha('inquirySubmit')

    const responseRec = await axios({
      method: 'post',
      url: '/backend/recaptchaSubmit',
      data: {gRecaptchaToken},
      headers: {Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json'}
    })

    if (responseRec.data?.success) {
      onSubmit(e)
    } else {
      console.log('error in recaptcha response')
    }
  }

  return (
    <>
      <TextInputUI
        extraClass={`${styles.inputs__text_extra}`}
        isSecret={false}
        theme='newGray'
        onSetValue={handleInnChange}
        currentValue={inn}
        placeholder={t('innPlaceholder')}
        errorValue={inn.length !== 0 && inn.length < 9 ? t('innError') : ''}
        title={<p className={`${styles.input__title}`}>{t('inn')}</p>}
      />

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class}`}
        isSecret={false}
        theme='newGray'
        onSetValue={handleNameChange}
        currentValue={name}
        placeholder={t('companyNamePlaceholder')}
        title={<p className={`${styles.input__title}`}>{t('companyName')}</p>}
      />

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${!isEmailValid && email.length !== 0 ? styles.extra__email__error : ''}`}
        isSecret={false}
        theme='newGray'
        autoComplete='on'
        inputType='email'
        onSetValue={setEmail}
        currentValue={email}
        errorValue={!isEmailValid && email.length !== 0 ? t('emailError') : ''}
        placeholder={t('corporateEmailPlaceholder')}
        title={<p className={`${styles.input__title}`}>{t('corporateEmail')}</p>}
      />

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2}`}
        isSecret={true}
        theme='newGray'
        onSetValue={setPassword}
        currentValue={password}
        errorValue={password.length < 6 && password.length !== 0 ? t('passwordError') : ''}
        placeholder={t('passwordPlaceholder')}
        title={<p className={`${styles.input__title}`}>{t('password')}</p>}
      />

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2}`}
        theme='newGray'
        onSetValue={setAdress}
        currentValue={adress}
        placeholder={t('adressPlaceholder')}
        title={<p className={`${styles.input__title} ${styles.input__title__without}`}>{t('adress')}</p>}
      />

      <div style={{zIndex: 1000000}} className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>{t('companyCountryes')}</p>
        <MultiDropSelect
          options={countryOptions}
          extraClass={styles.extraDropClass}
          selectedValues={selectedCountries}
          extraDropListClass={styles.extra_extraDropListClassSecond}
          onChange={setSelectedCountries}
          placeholder={t('companyCountryesPlaceholder')}
          direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'right'}
        />
      </div>

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('companyTel')}</p>
        <TelephoneInputUI
          currentValue={telText}
          error={!isValidNumber ? 'error' : ''}
          onSetValue={onChangeTelNumber}
          numberStartWith={phoneCountry}
        />
      </div>

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('categories')}</p>
        <MultiDropSelect
          showSearchInput
          extraClass={`${styles.profile__region__dropdown__extra} ${styles.extraDropClass}`}
          extraDropListClass={`${styles.extra_extraDropListClass} ${styles.extra_extraDropListClassSecond}`}
          options={(categories?.data || [])?.map((category) => ({
            id: category.id,
            label: category.name,
            value: category.name,
            imageUrl: category?.imageUrl,
            children: category.children?.map((child) => ({
              id: child.id,
              label: child.name,
              value: child.name,
              imageUrl: child?.imageUrl,
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
          isCategories
          selectedValues={selectedCategories}
          onChange={(values) => {
            setSelectedCategories(values)
          }}
          placeholder={t('categoriesPlaceholder')}
          direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'right'}
        />
        <p className={`${styles.input__subtitle}`} style={{marginTop: '8px'}}>
          {t('categoriesSubtext')}
        </p>
      </div>

      <div className={`${styles.policy__checkbox}`}>
        <RadioButton
          label={t('checkPolicy')}
          name='Business'
          value='Personal'
          checked={selectedOption === 'Personal'}
          onChange={handleOptionChange}
          textColor='dark'
          allowUnchecked={true}
        />
      </div>

      <button
        onClick={(e) => {
          if (!executeRecaptcha) {
            console.log('executeRecaptcha is not defined')
            return
          }
          handleSubmitForm(e)
        }}
        className={`${styles.form__button}`}
        style={{
          opacity: canSubmit ? 1 : 0.7,
          pointerEvents: canSubmit ? 'auto' : 'none'
        }}
      >
        {t('register') || t('next')}
      </button>
    </>
  )
}

export default RegisterVendorUnified
