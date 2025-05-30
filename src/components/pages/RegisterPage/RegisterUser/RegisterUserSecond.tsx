import React from 'react'
import styles from '../RegisterPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'

interface RegisterUserSecondProps {
  email: string
  selectedOption: string
  setEmail: (value: string) => void
  handleOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: (e: React.MouseEvent<HTMLButtonElement>) => void
  onNext: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RegisterUserSecond: React.FC<RegisterUserSecondProps> = ({
  email,
  selectedOption,
  setEmail,
  handleOptionChange,
  onBack,
  onNext
}) => {
  const isEmailValid = email.includes('@') && email.includes('.') && email.length !== 0
  const canProceed = selectedOption === 'Personal' && isEmailValid

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${!isEmailValid && email.length !== 0 ? styles.extra__email__error : ''}`}
        extraStyle={{width: '100%'}}
        isSecret={false}
        onSetValue={setEmail}
        currentValue={email}
        errorValue={!isEmailValid && email.length !== 0 ? 'почта должна содержать @ и расширение' : ''}
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

export default RegisterUserSecond
