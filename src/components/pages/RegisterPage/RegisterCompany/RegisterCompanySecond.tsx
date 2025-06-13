import React, {useEffect, useState} from 'react'
import styles from '../RegisterPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import MultiDropSelect, {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import useWindowWidth from '@/hooks/useWindoWidth'

interface RegisterCompanySecondProps {
  email: string
  password: string
  selectedOption: string
  selectedCategories: MultiSelectOption[]
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  setSelectedCategories: (categories: MultiSelectOption[]) => void
  handleOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: (e: React.MouseEvent<HTMLButtonElement>) => void
  onNext: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RegisterCompanySecond: React.FC<RegisterCompanySecondProps> = ({
  email,
  password,
  selectedOption,
  selectedCategories,
  setEmail,
  setPassword,
  setSelectedCategories,
  handleOptionChange,
  onBack,
  onNext
}) => {
  const isEmailValid = email.includes('@') && email.includes('.') && email.length !== 0
  const canProceed =
    selectedOption === 'Personal' && isEmailValid && password.length >= 6 && selectedCategories.length > 0
  const [isClient, setIsClient] = useState(false)
  const windowWidth = useWindowWidth()
  useEffect(() => {
    setIsClient(true)
  }, [])
  // Категории товаров компании
  const categoryOptions: MultiSelectOption[] = [
    {id: 'metal', label: 'Металл и металлоизделия', value: 'metal'},
    {id: 'wood', label: 'Дерево и пиломатериалы', value: 'wood'},
    {id: 'stone', label: 'Камень и минералы', value: 'stone'},
    {id: 'plastic', label: 'Пластик и полимеры', value: 'plastic'},
    {id: 'glass', label: 'Стекло и стеклоизделия', value: 'glass'},
    {id: 'textile', label: 'Текстиль и ткани', value: 'textile'},
    {id: 'chemical', label: 'Химические материалы', value: 'chemical'},
    {id: 'construction', label: 'Строительные материалы', value: 'construction'}
  ]

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '22px'}}>
      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${!isEmailValid && email.length !== 0 ? styles.extra__email__error : ''}`}
        extraStyle={{width: '100%'}}
        isSecret={false}
        onSetValue={setEmail}
        currentValue={email}
        errorValue={!isEmailValid && email.length !== 0 ? 'почта должна содержать @ и расширение' : ''}
        placeholder='Введите корпоративную почту...'
        title={<p className={`${styles.input__title}`}>Корпоративная почта</p>}
      />

      {/* <p className={`${styles.input__subtitle}`}>Используйте официальную почту компании для верификации.</p> */}

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2}`}
        isSecret={true}
        onSetValue={setPassword}
        currentValue={password}
        errorValue={password.length < 6 && password.length !== 0 ? 'Пароль должен быть не менее 6 символов' : ''}
        placeholder='Введите пароль, 6-20 символов'
        title={<p className={`${styles.input__title}`}>Пароль аккаунта</p>}
      />

      <div className={`${styles.some__drop__box}`} style={{marginTop: '16px', marginBottom: '16px'}}>
        <p className={`${styles.input__title}`}>Категории товаров</p>
        <MultiDropSelect
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={setSelectedCategories}
          placeholder='Выберите категории товаров...'
          direction={isClient && windowWidth !== undefined && windowWidth > 1050 ? 'left' : 'bottom'}
        />
        <p className={`${styles.input__subtitle}`} style={{marginTop: '8px'}}>
          Выберите основные категории материалов, с которыми работает ваша компания
        </p>
      </div>

      <RadioButton
        label='Я согласен с условиями сотрудничества и политикой конфиденциальности для бизнес-партнеров.'
        name='Business'
        value='Personal'
        checked={selectedOption === 'Personal'}
        onChange={handleOptionChange}
        textColor='dark'
        allowUnchecked={true}
        extraStyle={{marginTop: '6px'}}
      />

      <span className={`${styles.buttons__box}`}>
        <button onClick={onBack} className={`${styles.back_step_button}`}>
          <svg
            style={{transform: 'rotate(180deg)'}}
            width='35px'
            height='35px'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M6 12H18M18 12L13 7M18 12L13 17'
              stroke='#ffffff'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>

        <button
          style={{
            opacity: canProceed ? 1 : 0.7,
            pointerEvents: canProceed ? 'auto' : 'none'
          }}
          className={`${styles.checked__email}`}
          onClick={onNext}
        >
          Проверка электронной почты
        </button>
      </span>
    </div>
  )
}

export default RegisterCompanySecond
