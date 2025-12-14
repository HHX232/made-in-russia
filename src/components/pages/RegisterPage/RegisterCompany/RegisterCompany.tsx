import React from 'react'
import RegisterCompanyFirst from './RegisterCompanyFirst'
import RegisterCompanySecond from './RegisterCompanySecond'
import {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'

interface RegisterCompanyProps {
  // Состояния форм
  inn: string
  name: string
  password: string
  telText: string
  email: string
  selectedOption: string
  isValidNumber: boolean
  selectedCountries: MultiSelectOption[]
  selectedCategories: MultiSelectOption[]
  adress: string
  setAdress: (value: string) => void

  // Сеттеры
  setInn: (value: string) => void
  setName: (value: string) => void
  setPassword: (value: string) => void
  setTelText: (value: string) => void
  setEmail: (value: string) => void
  setIsValidNumber: (value: boolean) => void
  setSelectedCountries: (countries: MultiSelectOption[]) => void
  setSelectedCategories: (categories: MultiSelectOption[]) => void

  // Обработчики
  handleNameChange: (value: string) => void
  onChangeTelNumber: (value: string) => void
  handleOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  // Навигация и сабмиты
  showNextStep: boolean
  onSubmitFirstStep: (e: React.MouseEvent<HTMLButtonElement>) => void
  onSubmitSecondStep: (e: React.MouseEvent<HTMLButtonElement>) => void
  handleBackToFirst: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RegisterCompany: React.FC<RegisterCompanyProps> = ({
  inn,
  name,
  password,
  telText,
  email,
  selectedOption,
  isValidNumber,
  selectedCountries,
  selectedCategories,
  setInn,
  setName,
  setPassword,
  setTelText,
  setEmail,
  setIsValidNumber,
  setSelectedCountries,
  setSelectedCategories,
  handleNameChange,
  onChangeTelNumber,
  handleOptionChange,
  showNextStep,
  onSubmitFirstStep,
  onSubmitSecondStep,
  handleBackToFirst,
  adress,
  setAdress
}) => {
  if (!showNextStep) {
    return (
      <RegisterCompanyFirst
        inn={inn}
        name={name}
        telText={telText}
        selectedCountries={selectedCountries}
        isValidNumber={isValidNumber}
        setInn={setInn}
        setName={setName}
        setTelText={setTelText}
        setSelectedCountries={setSelectedCountries}
        setIsValidNumber={setIsValidNumber}
        handleNameChange={handleNameChange}
        onChangeTelNumber={onChangeTelNumber}
        onSubmit={onSubmitFirstStep}
      />
    )
  }

  return (
    <RegisterCompanySecond
      adress={adress}
      setAdress={setAdress}
      email={email}
      password={password}
      selectedOption={selectedOption}
      selectedCategories={selectedCategories}
      setEmail={setEmail}
      setPassword={setPassword}
      setSelectedCategories={setSelectedCategories}
      handleOptionChange={handleOptionChange}
      onBack={handleBackToFirst}
      onNext={onSubmitSecondStep}
    />
  )
}

export default RegisterCompany
