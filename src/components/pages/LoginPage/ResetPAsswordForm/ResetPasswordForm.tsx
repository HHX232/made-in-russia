/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {useState, SetStateAction} from 'react'
import styles from './ResetPasswordForm.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {axiosClassic} from '@/api/api.interceptor'
import {toast} from 'sonner'
import InputOtp from '@/components/UI-kit/inputs/inputOTP/inputOTP'
import {saveTokenStorage} from '@/middleware'
// import {useRouter} from '@/i18n/navigation'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {useTranslations} from 'next-intl'
import {useRouter} from '@/i18n/navigation'

interface ResetPasswordFormProps {
  onBack: () => void
}

const ResetPasswordForm = ({onBack}: ResetPasswordFormProps) => {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const router = useRouter()
  const t = useTranslations('ResetPasswordPage')
  const currentLang = useCurrentLanguage()

  const handleEmailChange = (value: SetStateAction<string>) => {
    setEmail(value)
    setError('')
  }

  const handlePasswordChange = (value: SetStateAction<string>) => {
    setNewPassword(value)
    setError('')
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmitReset = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!email) {
      setError(t('emailRequired'))
      return
    }

    if (!isValidEmail(email)) {
      setError(t('emailInvalid'))
      return
    }

    if (newPassword.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      axiosClassic.post(
        '/auth/recover-password',
        {
          email: email,
          newPassword: newPassword
        },
        {
          headers: {
            'Accept-Language': currentLang
          }
        }
      )

      toast.success(t('codeSentSuccess'))
      setStep('verify')
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('resetError')}</strong>
          <span>{error.response?.data?.message || t('checkDataError')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      setError(error.response?.data?.message || t('resetPasswordError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (code: string) => {
    // Предотвращаем множественные запросы
    if (isLoading) return

    setIsLoading(true)

    try {
      const res = await axiosClassic.post<{accessToken: string; refreshToken: string}>(
        '/auth/verify-recover-password',
        {
          email: email,
          recoverCode: code
        },
        {
          headers: {
            'Accept-Language': currentLang
          }
        }
      )
      saveTokenStorage(res.data)

      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('congratulations')}</strong>
          <span>{t('passwordChangedSuccess')}</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
      setTimeout(() => {
        onBack()
        router.replace('/')
      }, 2000)
    } catch (error: any) {
      console.error('Verify code error:', error)
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('confirmationError')}</strong>
          <span>{error.response?.data?.message || t('invalidCode')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <div className={styles.reset__form__box}>
        <h2 className={styles.reset__title}>{t('confirmationTitle')}</h2>
        <div className={styles.verify__container}>
          <p className={styles.verify__text}>
            {t('verificationText')} {email}
          </p>
          <p className={styles.verify__subtitle}>{t('verificationSubtitle')}</p>
          <div className={styles.otp__wrapper}>
            <InputOtp length={4} onComplete={handleVerifyCode} disabled={isLoading} />
          </div>
          <button onClick={onBack} className={styles.back__button} disabled={isLoading}>
            {t('backToLogin')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.reset__form__box}>
      <h2 className={styles.reset__title}>{t('title')}</h2>
      <div className={styles.inputs__box}>
        <TextInputUI
          extraClass={`${styles.inputs__text_extra} ${error && !isValidEmail(email) && email.length > 0 && styles.extra__error__class}`}
          isSecret={false}
          onSetValue={handleEmailChange}
          currentValue={email}
          placeholder={t('emailPlaceholder')}
          title={<p className={styles.input__title}>{t('emailLabel')}</p>}
          errorValue={email.length > 0 && !isValidEmail(email) ? t('emailCorrect') : ''}
        />

        <TextInputUI
          extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2} ${error && styles.extra__error__class}`}
          isSecret={true}
          onSetValue={handlePasswordChange}
          currentValue={newPassword}
          errorValue={newPassword.length < 6 && newPassword.length !== 0 ? t('passwordMinLength') : ''}
          placeholder={t('newPasswordPlaceholder')}
          title={<p className={styles.input__title}>{t('newPasswordLabel')}</p>}
        />

        {error && <p className={styles.error__message}>{error}</p>}

        <button onClick={handleSubmitReset} className={styles.form__button} disabled={isLoading}>
          {isLoading ? t('sending') : t('confirmButton')}
        </button>

        <button onClick={onBack} className={styles.form__button_back}>
          {t('backToLogin')}
        </button>
      </div>
    </div>
  )
}

export default ResetPasswordForm
