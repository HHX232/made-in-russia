'use client'
import {FC, useEffect, useRef, useState} from 'react'
import style from './LanguageButtonUI.module.scss'
import Image from 'next/image'
import {useRouter} from '@/i18n/navigation'

const whiteArrow = '/arrow-white.svg'
enum Languages {
  RUSSIAN = 'Русский',
  ENGLISH = 'English',
  CHINA = '中文'
}
const languageToLocale = {
  [Languages.RUSSIAN]: 'ru',
  [Languages.ENGLISH]: 'en',
  [Languages.CHINA]: 'zh'
}

const LanguageButtonUI: FC = () => {
  // Using useRef instead of useState to preserve values between renders
  const languageRef = useRef<Languages>(Languages.RUSSIAN)
  // We still need useState for dropdown as it affects the UI rendering
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  // For UI display purpose - to force re-render when ref value changes
  const [displayLanguage, setDisplayLanguage] = useState<Languages>(languageRef.current)

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const languageCookie = cookies.find((cookie) => cookie.startsWith('NEXT_LOCALE='))
    if (languageCookie) {
      const language = languageCookie.split('=')[1]
      languageRef.current = language as Languages
      setDisplayLanguage(languageRef.current)
    }
  }, [])

  const changeLanguage = (language: Languages) => {
    languageRef.current = language
    // Update display state to trigger re-render
    setDisplayLanguage(language)
  }

  return (
    <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={style.languageButtonUI__box}>
      <p className={`${style.current__text}`}>{displayLanguage}</p>
      <Image
        style={{transform: `${isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`, transition: 'all .3s'}}
        className={style.arrow__image}
        src={whiteArrow}
        alt='white-arrow'
        width={9}
        height={5}
      />
      {isDropdownOpen && (
        <div className={`${style.dropdown__box}`}>
          <p
            onClick={() => {
              console.log(languageToLocale[Languages.RUSSIAN], 'Мы хотим сменить язык')
              changeLanguage(Languages.RUSSIAN)
              console.log(languageToLocale[Languages.RUSSIAN], 'Мы сменили язык')
              router.push(`/${languageToLocale[Languages.RUSSIAN]}`)
            }}
            className={`${style.language__text} fontJaro`}
          >
            {Languages.RUSSIAN}
          </p>
          <p
            onClick={() => {
              console.log(languageToLocale[Languages.ENGLISH], 'Мы хотим сменить язык')
              changeLanguage(Languages.ENGLISH)
              console.log(languageToLocale[Languages.ENGLISH], 'Мы сменили язык')
              router.push(`/${languageToLocale[Languages.ENGLISH]}`)
            }}
            className={`${style.language__text} fontJaro`}
          >
            {Languages.ENGLISH}
          </p>
          <p
            onClick={() => {
              console.log(languageToLocale[Languages.CHINA], 'Мы хотим сменить язык')
              changeLanguage(Languages.CHINA)
              console.log(languageToLocale[Languages.CHINA], 'Мы сменили язык')
              router.push(`/${languageToLocale[Languages.CHINA]}`)
            }}
            className={`${style.language__text} fontJaro`}
          >
            {Languages.CHINA}
          </p>
        </div>
      )}
    </div>
  )
}

export default LanguageButtonUI
