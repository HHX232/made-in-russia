/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from 'next/image'
import styles from './LoginPage.module.scss'
import {SetStateAction, MouseEvent, useEffect, useState, useRef, useId} from 'react'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {axiosClassic} from '@/api/api.interceptor'
import {toast} from 'sonner'
import {saveTokenStorage} from '@/services/auth/auth.helper'
import Footer from '@/components/MainComponents/Footer/Footer'
import ResetPasswordForm from './ResetPAsswordForm/ResetPasswordForm'
import {Category} from '@/services/categoryes/categoryes.service'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import TelegramLoginWidget from './TelegramLoginWidget/TelegramLoginWidget'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {useUserQuery} from '@/hooks/useUserApi'
import LoginSlider from './LoginSlider/LoginSlider'
import Header from '@/components/MainComponents/Header/Header'

const tg = 'iconsNew/telegram.svg'

const LoginPage = ({categories}: {categories: Category[]}) => {
  const [name, setNameState] = useState('')
  const [password, setPasswordState] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)
  const router = useRouter()
  const t = useTranslations('LoginPage')
  const currentLang = useCurrentLanguage()
  const id = useId()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const accessToken = url.searchParams.get('accessToken')
    const refreshToken = url.searchParams.get('refreshToken')
    const resetPassword = url.searchParams.get('resetPassword')

    if (accessToken && refreshToken) {
      saveTokenStorage({accessToken, refreshToken})
      router.push('/profile') // Перенаправляем на главную после авторизации
      // Очистка query из URL
      window.history.replaceState({}, '', window.location.pathname)
    }

    // Если есть параметр resetPassword=true, показываем форму восстановления пароля
    if (resetPassword === 'true') {
      setShowResetForm(true)
      // Очищаем параметр из URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [router])

  const handleNameChange = (value: SetStateAction<string>) => {
    setNameState(value)
    setError('')
  }

  const {refetch} = useUserQuery()
  const onSubmit = async (e: MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()

    if (!name) {
      setError(t('nicknameError'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordError'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axiosClassic.post(
        '/auth/login-with-email',
        {
          email: name,
          password: password
        },
        {
          headers: {
            'Accept-Language': currentLang
          }
        }
      )

      const {accessToken, refreshToken} = response.data as any

      saveTokenStorage({accessToken, refreshToken})
      await refetch()
      console.log('Access Token:', accessToken, 'Refresh Token:', refreshToken)
      router.push('/profile')
    } catch (error: any) {
      console.error('Login error:', error)

      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('autorithationError')}</strong>
          {/* <span>Пожалуйста, перепроверьте введенные данные</span> */}
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )

      setError(error.response?.data?.message || t('autorithationError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = () => {
    setShowResetForm(true)
    setError('')
    setNameState('')
    setPasswordState('')
  }

  const handleBackToLogin = () => {
    setShowResetForm(false)
    setError('')
  }

  const handleTelegramAuth = async (user: any) => {
    try {
      console.log('user try tg', user)
      const {first_name, last_name, username, ...userWithoutNames} = user
      const updatedUser = {
        ...userWithoutNames,
        firstName: user.first_name,
        lastName: user.last_name
      }
      const response = await axiosClassic.post('/auth/login-with-telegram', updatedUser, {
        headers: {
          'Accept-Language': currentLang
        }
      })

      const {accessToken, refreshToken} = response.data

      if (accessToken && refreshToken) {
        // Пользователь уже зарегистрирован, сохраняем токены и перенаправляем
        saveTokenStorage({accessToken, refreshToken})
        router.push('/profile')
      }
    } catch (error: any) {
      console.error('Telegram auth error:', error)

      // if (error.response?.status === 404) {
      // Пользователь не найден, перенаправляем на регистрацию с данными Telegram
      const queryParams = new URLSearchParams({
        email: user.email || '',
        picture: user.photo_url || '',
        telegram_id: user.id?.toString() || '',
        username: user.username || '',
        firstName: user.first_name || '',
        lastName: user.last_name || ''
      })

      router.push(`/register?${queryParams.toString()}`)
      // } else {
      // toast.error(t('autorithationErrorTelegram'))
      // }
    }
  }

  return (
    <div className={`${styles.login__box}`}>
      {/* <MinimalHeader categories={categories} /> */}
      <Header categories={categories} />
      <div className={`${styles.login__container} container`}>
        <div className={`${styles.login__inner}`}>
          {showResetForm ? (
            <ResetPasswordForm onBack={handleBackToLogin} />
          ) : (
            <form className={`${styles.login__form__box}`}>
              <h2 className={`${styles.login__title}`}>{t('loginTitle')}</h2>
              <div className={`${styles.inputs__box}`}>
                {
                  <>
                    {' '}
                    <TextInputUI
                      idForLabel='cy-email-input'
                      extraClass={` ${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class} ${error && styles.extra__name__class}`}
                      isSecret={false}
                      theme='newGray'
                      onSetValue={handleNameChange}
                      currentValue={name}
                      placeholder={t('writeEmailOrNickname')}
                      title={<p className={`${styles.input__title}`}>{t('loginAccount')}</p>}
                    />
                    <TextInputUI
                      idForLabel='cy-password-input'
                      extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2} ${error && styles.extra__name__class}`}
                      theme='newGray'
                      isSecret={true}
                      onSetValue={setPasswordState}
                      currentValue={password}
                      errorValue={password.length < 6 && password.length !== 0 ? t('passwordError') : ''}
                      placeholder={t('writePassword')}
                      title={<p className={`${styles.input__title}`}>{t('loginPassword')}</p>}
                    />
                    <button
                      id='cy-login-button'
                      onClick={(e: any) => onSubmit(e)}
                      className={`${styles.form__button}`}
                      disabled={isLoading}
                    >
                      {isLoading ? t('loading') : t('loginButton')}
                    </button>
                    <Link className={`${styles.form__button_register}`} href='/register'>
                      {t('loginRegister')}
                    </Link>
                    <div className={`${styles.form__reset__password__button}`} onClick={handleResetPassword}>
                      {t('loginForgotPassword')}
                    </div>
                    <div className={`${styles.apps__login}`}>
                      <div className={`${styles.flex_soc}`}>
                        <div className={styles.line_soc}></div>
                        <p className={`${styles.apps__text}`}>{t('loginWithSocial')}</p>
                        <div className={styles.line_soc}></div>
                      </div>
                      <div className={`${styles.apps__images}`}>
                        {/* {currentLang === 'en' && (
                          <Link
                            className={`${styles.registr__image}`}
                            href={`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/oauth2/google`}
                          >
                            <Image
                              className={`${styles.registr__image}`}
                              src={google}
                              width={50}
                              height={50}
                              alt='registr with google'
                            />
                          </Link>
                        )} */}

                        <div className={styles.telegram__button__container}>
                          <Image
                            className={`${styles.registr__image}`}
                            src={tg}
                            width={28}
                            height={20}
                            alt='registr with telegram'
                          />
                          <p className={styles.tg_text}>{t('loginWithTelegram')}</p>
                          <TelegramLoginWidget
                            onAuth={handleTelegramAuth}
                            className={styles.telegram__widget__overlay}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                }
              </div>
            </form>
          )}

          {/* <div className={`${styles.decor__image}`}>
            <Image
              className={styles.decor__image}
              src={decorImage2}
              width={580}
              height={745}
              alt={t('decorationImage')}
            />
          </div> */}
          <LoginSlider key={`${showResetForm} ${id}`} />
        </div>
        <div className={`${styles.margin__box}`}></div>
      </div>
      <Footer useFixedFooter minMediaHeight={1070} extraClass={`${styles.extraFooter}`} />
    </div>
  )
}

export default LoginPage
