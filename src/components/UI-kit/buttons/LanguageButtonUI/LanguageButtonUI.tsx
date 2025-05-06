'use client'
import {FC, useEffect, useRef, useState} from 'react'
import style from './LanguageButtonUI.module.scss'
import Image from 'next/image'

const whiteArrow = '/arrow-white.svg'
enum Languages {
  RUSSIAN = 'Русский',
  ENGLISH = 'English',
  CHINA = '中文'
}

const LanguageButtonUI: FC = () => {
  // Using useRef instead of useState to preserve values between renders
  const languageRef = useRef<Languages>(Languages.RUSSIAN)
  // We still need useState for dropdown as it affects the UI rendering
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // For UI display purpose - to force re-render when ref value changes
  const [displayLanguage, setDisplayLanguage] = useState<Languages>(languageRef.current)

  //TODO: Заменить на получение из куков
  useEffect(() => {
    languageRef.current = Languages.RUSSIAN
    setDisplayLanguage(languageRef.current)
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
          <p onClick={() => changeLanguage(Languages.RUSSIAN)} className={`${style.language__text} fontJaro`}>
            {Languages.RUSSIAN}
          </p>
          <p onClick={() => changeLanguage(Languages.ENGLISH)} className={`${style.language__text} fontJaro`}>
            {Languages.ENGLISH}
          </p>
          <p onClick={() => changeLanguage(Languages.CHINA)} className={`${style.language__text} fontJaro`}>
            {Languages.CHINA}
          </p>
        </div>
      )}
    </div>
  )
}

export default LanguageButtonUI
