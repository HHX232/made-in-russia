import React from 'react'
import Link from 'next/link'
import styles from '../RegisterPage.module.scss'
import InputOtp from '@/components/UI-kit/inputs/inputOTP/inputOTP'
import {useTranslations} from 'next-intl'

interface RegisterUserThirdProps {
  email: string
  otpValue: string
  setOtpValue: (value: string) => void
  handleOtpComplete: (value: string) => void
  onBack: (e: React.MouseEvent<HTMLButtonElement>) => void
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RegisterUserThird: React.FC<RegisterUserThirdProps> = ({
  email,
  otpValue,
  handleOtpComplete,
  onBack,
  onConfirm
}) => {
  const t = useTranslations('RegisterUserPage')
  return (
    <>
      <div className={`${styles.inputOtp_section}`}>
        <p className={`${styles.otp__text}`}>
          {t('codeText')} {email ? email : 'ваша почта@gmail.com'}
        </p>
        <InputOtp length={4} onComplete={handleOtpComplete} />
      </div>

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
            opacity: otpValue.length !== 0 ? 1 : 0.8,
            pointerEvents: otpValue.length !== 0 ? 'auto' : 'none'
          }}
          className={`${styles.checked__email}`}
          onClick={onConfirm}
        >
          {t('confirm')}
        </button>
      </span>

      <Link href={'/help'} className={styles.problem__link}>
        {t('haveProblemWithCode')}
      </Link>
    </>
  )
}

export default RegisterUserThird
