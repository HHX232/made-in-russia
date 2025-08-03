/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from 'next/image'
import styles from './LoginPage.module.scss'
import MinimalHeader from '@/components/MainComponents/MinimalHeader/MinimalHeader'
import {SetStateAction, MouseEvent, useEffect, useState} from 'react'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {axiosClassic} from '@/api/api.interceptor'
import Link from 'next/link'
import {toast} from 'sonner'
import {saveTokenStorage} from '@/services/auth/auth.helper'
import {useRouter} from 'next/navigation'
import Footer from '@/components/MainComponents/Footer/Footer'
import ResetPasswordForm from './ResetPAsswordForm/ResetPasswordForm'
import {Category} from '@/services/categoryes/categoryes.service'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

const google = '/google_registr.svg'
const wechat = '/wechat_registr.svg'
const weibo = '/weibo-svgrepo-com.svg'
const tg = '/tg.svg'

const decorImage = '/login__image.jpg'
const decorImage2 = '/new_login.webp'

const LoginPage = ({categories}: {categories: Category[]}) => {
  const [name, setNameState] = useState('')
  const [password, setPasswordState] = useState('')
  const [telText, setTelText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)
  const router = useRouter()
  const t = useTranslations('LoginPage')
  const currentLang = useCurrentLanguage()
  const handleNameChange = (value: SetStateAction<string>) => {
    setNameState(value)
    setError('')
  }

  const isEmail = (value: string | string[]) => {
    return value.includes('@') && value.includes('.')
  }

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
      let response

      if (isEmail(name)) {
        response = await axiosClassic.post(
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
      } else {
        response = await axiosClassic.post(
          '/auth/login-with-login',
          {
            login: name,
            password: password
          },
          {
            headers: {
              'Accept-Language': currentLang
            }
          }
        )
      }

      const {accessToken, refreshToken} = response.data as any

      saveTokenStorage({accessToken, refreshToken})
      console.log('Access Token:', accessToken, 'Refresh Token:', refreshToken)
      router.push('/')
    } catch (error: any) {
      console.error('Login error:', error)

      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>Ошибка входа</strong>
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

  return (
    <div className={`${styles.login__box}`}>
      <MinimalHeader categories={categories} />
      <div className={`${styles.login__container} container`}>
        <div className={`${styles.login__inner}`}>
          <Image
            className={styles.decor__image}
            src={decorImage2}
            width={580}
            height={745}
            alt={t('decorationImage')}
          />

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
                      onSetValue={handleNameChange}
                      currentValue={name}
                      placeholder={t('writeEmailOrNickname')}
                      title={<p className={`${styles.input__title}`}>{t('loginAccount')}</p>}
                    />
                    <TextInputUI
                      idForLabel='cy-password-input'
                      extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2} ${error && styles.extra__name__class}`}
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
                      <p className={`${styles.apps__text}`}>{t('loginWithSocial')}</p>
                      <div className={`${styles.apps__images}`}>
                        <Image
                          className={`${styles.registr__image}`}
                          src={google}
                          width={50}
                          height={50}
                          alt='registr with google'
                        />
                        <Image
                          className={`${styles.registr__image}`}
                          src={tg}
                          width={50}
                          height={50}
                          alt='registr with telegram'
                        />
                        <Image
                          className={`${styles.registr__image}`}
                          src={wechat}
                          width={50}
                          height={50}
                          alt='registr with telegram'
                        />
                        <Image
                          className={`${styles.registr__image}`}
                          src={weibo}
                          width={50}
                          height={50}
                          alt='registr with telegram'
                        />
                      </div>
                    </div>
                  </>
                }
              </div>
            </form>
          )}
        </div>
        <div className={`${styles.margin__box}`}></div>
      </div>
      <Footer extraClass={`${styles.extraFooter}`} />
    </div>
  )
}

export default LoginPage
