import React, {MouseEvent, useState, useEffect} from 'react'
import styles from '../RegisterPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import MultiDropSelect, {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'
import {useGoogleReCaptcha} from 'react-google-recaptcha-v3'
import {useCategories} from '@/services/categoryes/categoryes.service'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import axios from 'axios'
import Link from 'next/link'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // setSelectedCountries,
  setSelectedCategories,
  handleOptionChange,
  onSubmit
}) => {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const windowWidth = useWindowWidth()
  const t = useTranslations('RegisterUserPage')
  const {executeRecaptcha} = useGoogleReCaptcha()
  const currentLang = useCurrentLanguage()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = useCategories(currentLang as any)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const validateInn = (value: string) => {
    return /^\d*$/.test(value)
  }

  const handleInnChange = (value: string) => {
    if (validateInn(value)) {
      setInn(value)
    }
  }

  const isEmailValid = email.includes('@') && email.includes('.') && email.length !== 0

  const canSubmit =
    inn.length >= 9 &&
    name.length >= 3 &&
    isEmailValid &&
    password.length >= 6 &&
    isValidNumber &&
    selectedOption === 'Personal'

  const handleSubmitForm = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!executeRecaptcha || isLoading) return

    setIsLoading(true)

    try {
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
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      setIsLoading(false)
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

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('companyTel')}</p>
        <TelephoneInputUI currentValue={telText} error={!isValidNumber ? 'error' : ''} onSetValue={onChangeTelNumber} />
      </div>

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('categories')}</p>
        <MultiDropSelect
          showSearchInput
          useNewThemeTransparent
          extraClass={`${styles.profile__region__dropdown__extra} ${styles.extraDropClass} `}
          extraDropListClass={`${styles.extra_extraDropListClass} ${styles.extra_extraDropListClassSecond}  $`}
          options={(categories?.data || [])?.map((category) => ({
            id: category.id,
            label: category.name,
            value: category.name,
            imageUrl: category.imageUrl || '',
            okved: category.okved || [],
            children: category.children?.map((child) => ({
              id: child.id,
              label: child.name,
              value: child.name,
              imageUrl: child.imageUrl || '',
              okved: child.okved || [],
              children: child.children?.map((grandChild) => ({
                id: grandChild?.id,
                label: grandChild?.name,
                value: grandChild?.name,
                imageUrl: grandChild.imageUrl || '',
                okved: grandChild.okved || [],
                children: grandChild?.children?.map((greatGrandChild) => ({
                  id: greatGrandChild?.id,
                  label: greatGrandChild?.name,
                  value: greatGrandChild?.name,
                  imageUrl: greatGrandChild.imageUrl || '',
                  okved: greatGrandChild.okved || []
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
          label={
            <>
              {t('iSuccessWith')}{' '}
              <Link style={{color: '#0047BA', textDecoration: 'underline'}} href={'/privacy'}>
                {t('policy')}
              </Link>
            </>
          }
          name='Business'
          value='Personal'
          useRect
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
        className={`${styles.form__button} ${isLoading ? styles.form__button_loading : ''}`}
        disabled={!canSubmit || isLoading}
        style={{
          opacity: canSubmit && !isLoading ? 1 : 0.7,
          pointerEvents: canSubmit && !isLoading ? 'auto' : 'none'
        }}
      >
        {isLoading ? (
          <span className={styles.button__loader}>
            <span className={styles.spinner}></span>
            {t('loading') || 'Загрузка...'}
          </span>
        ) : (
          t('register') || t('next')
        )}
      </button>
    </>
  )
}

export default RegisterVendorUnified
