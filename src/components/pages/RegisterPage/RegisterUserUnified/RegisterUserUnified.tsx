import React, {MouseEvent} from 'react'
import Image from 'next/image'
import styles from '../RegisterPage.module.scss'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import {useTranslations} from 'next-intl'
import {useGoogleReCaptcha} from 'react-google-recaptcha-v3'
import axios from 'axios'
import Link from 'next/link'

const belarusSvg = '/countries/belarus.svg'
const kazakhstanSvg = '/countries/kazakhstan.svg'
const chinaSvg = '/countries/china.svg'
const russiaSvg = '/countries/russia.svg'

interface RegionType {
  imageSrc: string
  title: string
  altName: string
}

interface RegisterUserUnifiedProps {
  name: string
  password: string
  email: string
  telText: string
  selectedRegion: RegionType
  listIsOpen: boolean
  isValidNumber: boolean
  selectedOption: string
  setName: (value: string) => void
  setPassword: (value: string) => void
  setEmail: (value: string) => void
  setTelText: (value: string) => void
  setSelectedRegion: (region: RegionType) => void
  setListIsOpen: (value: boolean) => void
  handleNameChange: (value: string) => void
  onChangeTelNumber: (value: string) => void
  handleOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void
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
  return (
    <div onClick={onClickF} className={`${styles.region__item}`}>
      <Image className={`${styles.region__image}`} src={imageSrc} alt={altName} width={18} height={18} />
      <p className={`${styles.region__text}`}>{title}</p>
    </div>
  )
}

const RegisterUserUnified: React.FC<RegisterUserUnifiedProps> = ({
  name,
  password,
  email,
  telText,
  selectedRegion,
  listIsOpen,
  isValidNumber,
  selectedOption,
  handleNameChange,
  setPassword,
  setEmail,
  onChangeTelNumber,
  setSelectedRegion,
  setListIsOpen,
  handleOptionChange,
  onSubmit
}) => {
  const t = useTranslations('RegisterUserPage')
  const {executeRecaptcha} = useGoogleReCaptcha()

  const regions = [
    {imageSrc: belarusSvg, title: t('Belarus'), altName: 'Belarus'},
    {imageSrc: kazakhstanSvg, title: t('Kazakhstan'), altName: 'Kazakhstan'},
    {imageSrc: chinaSvg, title: t('China'), altName: 'China'},
    {imageSrc: russiaSvg, title: t('Russia'), altName: 'Russia'}
  ]

  const handleRegionSelect = (region: RegionType) => {
    setSelectedRegion(region)
    setListIsOpen(false)
  }

  const isEmailValid = email.includes('@') && email.includes('.') && email.length !== 0
  const canSubmit =
    name.length >= 3 && password.length >= 6 && isEmailValid && isValidNumber && selectedOption === 'Personal'

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
        extraClass={`${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class}`}
        isSecret={false}
        theme='newGray'
        onSetValue={handleNameChange}
        currentValue={name}
        placeholder={t('registerFullName') + '...'}
        title={<p className={`${styles.input__title}`}>{t('registerFullName')}</p>}
      />

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${!isEmailValid && email.length !== 0 ? styles.extra__email__error : ''}`}
        isSecret={false}
        theme='newGray'
        autoComplete='on'
        onSetValue={setEmail}
        inputType='email'
        currentValue={email}
        errorValue={!isEmailValid && email.length !== 0 ? t('emailError') : ''}
        placeholder={t('email') + '...'}
        title={<p className={`${styles.input__title}`}>{t('email')}</p>}
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

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>{t('registerRegion')}</p>
        <div style={{backgroundColor: '#F6F6F6', borderWidth: '1px'}} className={`${styles.drop__box}`}>
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

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('phoneNumber')}</p>
        <TelephoneInputUI
          currentValue={telText}
          error={!isValidNumber ? 'error' : ''}
          onSetValue={onChangeTelNumber}
          // numberStartWith={selectedRegion.altName as TNumberStart}
        />
      </div>

      <div className={`${styles.policy__checkbox}`}>
        <RadioButton
          useRect
          label={
            <>
              {t('iSuccessWith')}{' '}
              <Link style={{color: '#0047BA', textDecoration: 'underline'}} href={'/privacy'}>
                {t('policy')}
              </Link>
            </>
          }
          name='Personal'
          value='Personal'
          textColor='dark'
          checked={selectedOption === 'Personal'}
          onChange={handleOptionChange}
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

export default RegisterUserUnified
