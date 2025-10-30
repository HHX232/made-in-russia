import React, {useEffect, useState} from 'react'
import styles from '../RegisterPage.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import RadioButton from '@/components/UI-kit/buttons/RadioButtonUI/RadioButtonUI'
import MultiDropSelect, {MultiSelectOption} from '@/components/UI-kit/Texts/MultiDropSelect/MultiDropSelect'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'
import {useCategories} from '@/services/categoryes/categoryes.service'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

interface RegisterCompanySecondProps {
  email: string
  adress: string
  password: string
  selectedOption: string
  selectedCategories: MultiSelectOption[]
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  setSelectedCategories: (categories: MultiSelectOption[]) => void
  handleOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: (e: React.MouseEvent<HTMLButtonElement>) => void
  onNext: (e: React.MouseEvent<HTMLButtonElement>) => void
  setAdress: (value: string) => void
}

const RegisterCompanySecond: React.FC<RegisterCompanySecondProps> = ({
  email,
  adress,
  password,
  selectedOption,
  selectedCategories,
  setEmail,
  setPassword,
  setSelectedCategories,
  handleOptionChange,
  onBack,
  onNext,
  setAdress
}) => {
  const isEmailValid = email.includes('@') && email.includes('.') && email?.length !== 0
  const canProceed = selectedOption === 'Personal' && isEmailValid && password?.length >= 6
  const [isClient, setIsClient] = useState(false)
  const windowWidth = useWindowWidth()
  const currentLang = useCurrentLanguage()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = useCategories(currentLang as any)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const t = useTranslations('RegisterUserPage')
  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '22px'}}>
      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra__min__height} ${!isEmailValid && email?.length !== 0 ? styles.extra__email__error : ''}`}
        extraStyle={{width: '100%'}}
        isSecret={false}
        autoComplete='on'
        inputType='email'
        onSetValue={setEmail}
        currentValue={email}
        errorValue={!isEmailValid && email?.length !== 0 ? t('emailError') : ''}
        placeholder={t('corporateEmailPlaceholder')}
        title={<p className={`${styles.input__title}`}>{t('corporateEmail')}</p>}
      />

      {/* <p className={`${styles.input__subtitle}`}>Используйте официальную почту компании для верификации.</p> */}

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra__min__height}  ${styles.inputs__text_extra_2}`}
        isSecret={true}
        onSetValue={setPassword}
        currentValue={password}
        errorValue={password?.length < 6 && password?.length !== 0 ? t('passwordError') : ''}
        placeholder={t('passwordPlaceholder')}
        title={<p className={`${styles.input__title}`}>{t('password')}</p>}
      />
      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra__min__height} ${styles.inputs__text_extra_2}`}
        onSetValue={setAdress}
        currentValue={adress}
        placeholder={t('adressPlaceholder')}
        title={<p className={`${styles.input__title} ${styles.input__title__without}`}>{t('adress')}</p>}
      />

      <div className={`${styles.some__drop__box}`} style={{marginTop: '16px', marginBottom: '16px'}}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('categories')}</p>
        {/* <MultiDropSelect
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={setSelectedCategories}
          placeholder={t('categoriesPlaceholder')}
          direction={isClient && windowWidth !== undefined && windowWidth > 1050 ? 'left' : 'bottom'}
        /> */}
        <MultiDropSelect
          showSearchInput
          extraClass={styles.profile__region__dropdown__extra}
          extraDropListClass={styles.extra_extraDropListClass}
          options={(categories?.data || [])?.map((category) => ({
            id: category.id,
            label: category.name,
            value: category.name,
            imageUrl: category?.imageUrl,
            children: category.children?.map((child) => ({
              id: child.id,
              label: child.name,
              value: child.name,
              imageUrl: child?.imageUrl,
              children: child.children?.map((grandChild) => ({
                id: grandChild?.id,
                label: grandChild?.name,
                value: grandChild?.name,
                imageUrl: grandChild?.imageUrl,
                children: grandChild?.children?.map((greatGrandChild) => ({
                  id: greatGrandChild?.id,
                  label: greatGrandChild?.name,
                  value: greatGrandChild?.name,
                  imageUrl: greatGrandChild?.imageUrl
                }))
              }))
            }))
          }))}
          isCategories
          selectedValues={selectedCategories}
          onChange={(values) => {
            setSelectedCategories(values)
          }}
          placeholder={t('categoriesPlaceholder')}
          direction={isClient && windowWidth !== undefined && windowWidth < 1050 ? 'bottom' : 'left'}
        />

        <p className={`${styles.input__subtitle}`} style={{marginTop: '8px'}}>
          {t('categoriesSubtext')}
        </p>
      </div>

      <RadioButton
        label={t('checkPolicy')}
        name='Business'
        value='Personal'
        useRect
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
          {t('emailNext')}
        </button>
      </span>
    </div>
  )
}

export default RegisterCompanySecond
