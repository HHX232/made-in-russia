import React from 'react'
import styles from '../RegisterPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI, TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import MultiDropSelect, {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'

const belarusSvg = '/belarus.svg'

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
  // Опции стран для мультивыбора
  const countryOptions: MultiSelectOption[] = [
    {id: 'belarus', label: 'Беларусь', value: 'Belarus', icon: belarusSvg},
    {id: 'kazakhstan', label: 'Казахстан', value: 'Kazakhstan', icon: belarusSvg},
    {id: 'china', label: 'Китай', value: 'China', icon: belarusSvg},
    {id: 'russia', label: 'Россия', value: 'Russia', icon: belarusSvg},
    {id: 'usa', label: 'США', value: 'USA', icon: belarusSvg},
    {id: 'germany', label: 'Германия', value: 'Germany', icon: belarusSvg},
    {id: 'poland', label: 'Польша', value: 'Poland', icon: belarusSvg},
    {id: 'ukraine', label: 'Украина', value: 'Ukraine', icon: belarusSvg}
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
  const phoneCountry = selectedCountries.length > 0 ? (selectedCountries[0].value as TNumberStart) : 'Belarus'

  return (
    <>
      <TextInputUI
        extraClass={`${styles.inputs__text_extra}`}
        isSecret={false}
        onSetValue={handleInnChange}
        currentValue={inn}
        placeholder='Введите ИНН компании...'
        errorValue={inn.length !== 0 && inn.length < 9 ? 'ИНН должен содержать минимум 9 цифр' : ''}
        title={<p className={`${styles.input__title}`}>ИНН компании</p>}
      />

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>Страны присутствия</p>
        <MultiDropSelect
          options={countryOptions}
          selectedValues={selectedCountries}
          onChange={setSelectedCountries}
          placeholder='Выберите страны...'
        />
      </div>

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class}`}
        isSecret={false}
        onSetValue={handleNameChange}
        currentValue={name}
        placeholder='Введите название компании...'
        title={<p className={`${styles.input__title}`}>Название компании</p>}
      />

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>Контактный телефон</p>
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
        Далее
      </button>
    </>
  )
}

export default RegisterCompanyFirst
