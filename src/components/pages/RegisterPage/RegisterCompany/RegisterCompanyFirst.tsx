import React, {useEffect, useState} from 'react'
import styles from '../RegisterPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI, TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import MultiDropSelect, {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'

const belarusSvg = '/countries/belarus.svg'
const kazakhstanSvg = '/countries/kazakhstan.svg'
const chinaSvg = '/countries/china.svg'
const russiaSvg = '/countries/russia.svg'
interface RegisterCompanyFirstProps {
  inn: string
  name: string
  telText: string
  selectedCountries: MultiSelectOption[]
  isValidNumber: boolean
  setInn: (value: string) => void
  setName: (value: string) => void
  setTelText: (value: string) => void
  setSelectedCountries: (countries: MultiSelectOption[]) => void
  setIsValidNumber: (value: boolean) => void
  handleNameChange: (value: string) => void
  onChangeTelNumber: (value: string) => void
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RegisterCompanyFirst: React.FC<RegisterCompanyFirstProps> = ({
  inn,
  name,
  telText,
  selectedCountries,
  isValidNumber,
  setInn,
  handleNameChange,
  onChangeTelNumber,
  setSelectedCountries,
  onSubmit
}) => {
  const [isClient, setIsClient] = useState(false)
  const windowWidth = useWindowWidth()
  useEffect(() => {
    setIsClient(true)
  }, [])
  const t = useTranslations('RegisterUserPage')
  // Опции стран для мультивыбора
  const countryOptions: MultiSelectOption[] = [
    {id: 'belarus', label: t('Belarus'), value: 'Belarus', icon: belarusSvg},
    {id: 'kazakhstan', label: t('Kazakhstan'), value: 'Kazakhstan', icon: kazakhstanSvg},
    {id: 'china', label: t('China'), value: 'China', icon: chinaSvg},
    {id: 'russia', label: t('Russia'), value: 'Russia', icon: russiaSvg}
  ]

  const validateInn = (value: string) => {
    // Простая валидация ИНН (только цифры)
    return /^\d*$/.test(value)
  }

  const handleInnChange = (value: string) => {
    if (validateInn(value)) {
      setInn(value)
    }
  }

  // Определяем страну для телефонного номера (берем первую выбранную)
  const phoneCountry =
    selectedCountries.length > 0
      ? selectedCountries.length === 1
        ? (selectedCountries[0].value as TNumberStart)
        : 'other'
      : 'Russia'

  return (
    <>
      <TextInputUI
        extraClass={`${styles.inputs__text_extra}`}
        isSecret={false}
        onSetValue={handleInnChange}
        currentValue={inn}
        placeholder={t('innPlaceholder')}
        errorValue={inn.length !== 0 && inn.length < 9 ? t('innError') : ''}
        title={<p className={`${styles.input__title}`}>{t('inn')}</p>}
      />

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>{t('companyCountryes')}</p>
        <MultiDropSelect
          options={countryOptions}
          selectedValues={selectedCountries}
          onChange={setSelectedCountries}
          placeholder={t('companyCountryesPlaceholder')}
          direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'left'}
        />
      </div>

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class}`}
        isSecret={false}
        onSetValue={handleNameChange}
        currentValue={name}
        placeholder={t('companyNamePlaceholder')}
        title={<p className={`${styles.input__title}`}>{t('companyName')}</p>}
      />

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('companyTel')}</p>
        <TelephoneInputUI
          currentValue={telText}
          error={!isValidNumber ? 'error' : ''}
          onSetValue={onChangeTelNumber}
          numberStartWith={phoneCountry}
        />
      </div>

      <button
        onClick={onSubmit}
        className={`${styles.form__button}`}
        disabled={inn.length < 9 || name.length < 3 || !isValidNumber || selectedCountries.length === 0}
        style={{
          opacity: inn.length < 9 || name.length < 3 || !isValidNumber || selectedCountries.length === 0 ? 0.7 : 1
        }}
      >
        {t('next')}
      </button>
    </>
  )
}

export default RegisterCompanyFirst
