import React from 'react'
import Image from 'next/image'
import styles from '../RegisterPage.module.scss'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI, TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'
import {useTranslations} from 'next-intl'

const belarusSvg = '/countries/belarus.svg'
const kazakhstanSvg = '/countries/kazakhstan.svg'
const chinaSvg = '/countries/china.svg'
const russiaSvg = '/countries/russia.svg'
interface RegionType {
  imageSrc: string
  title: string
  altName: string
}

interface RegisterUserFirstProps {
  name: string
  password: string
  telText: string
  selectedRegion: RegionType
  listIsOpen: boolean
  isValidNumber: boolean
  setName: (value: string) => void
  setPassword: (value: string) => void
  setTelText: (value: string) => void
  setSelectedRegion: (region: RegionType) => void
  setListIsOpen: (value: boolean) => void
  setIsValidNumber: (value: boolean) => void
  handleNameChange: (value: string) => void
  onChangeTelNumber: (value: string) => void
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void
}

interface RegionDropListProps {
  regions: RegionType[]
  selectedRegion: RegionType
  listIsOpen: boolean
  setListIsOpen: (value: boolean) => void
  handleRegionSelect: (region: RegionType) => void
  extraClass?: string
  extraStyle?: React.CSSProperties
}

const RegionItem = ({
  imageSrc,
  title,
  altName,
  onClickF
}: {
  imageSrc: string
  title: string
  altName: string
  onClickF?: () => void
}) => {
  return (
    <div onClick={onClickF} className={`${styles.region__item}`}>
      <Image className={`${styles.region__image}`} src={imageSrc} alt={altName} width={18} height={18} />
      <p className={`${styles.region__text}`}>{title}</p>
    </div>
  )
}

export const RegionDropList: React.FC<RegionDropListProps> = ({
  regions,
  selectedRegion,
  listIsOpen,
  setListIsOpen,
  handleRegionSelect,
  extraClass = '',
  extraStyle = {}
}) => {
  return (
    <div style={extraStyle} className={extraClass}>
      <DropList
        extraClass={`${styles.extra__drop__list}`}
        gap='15'
        extraListClass={`${styles.extra__list__style}`}
        title={
          <RegionItem
            imageSrc={selectedRegion.imageSrc}
            title={selectedRegion.title}
            altName={selectedRegion.altName}
          />
        }
        isOpen={listIsOpen}
        onOpenChange={setListIsOpen}
        items={regions.map((region, index) => (
          <div
            style={{width: '100%'}}
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              handleRegionSelect(region)
            }}
          >
            <RegionItem imageSrc={region.imageSrc} title={region.title} altName={region.altName} />
          </div>
        ))}
      />
    </div>
  )
}

const RegisterUserFirst: React.FC<RegisterUserFirstProps> = ({
  name,
  password,
  telText,
  selectedRegion,
  listIsOpen,
  isValidNumber,
  handleNameChange,
  setPassword,
  onChangeTelNumber,
  setSelectedRegion,
  setListIsOpen,
  onSubmit
}) => {
  const t = useTranslations('RegisterUserPage')
  const regions = [
    {imageSrc: belarusSvg, title: t('Belarus'), altName: 'Belarus'},
    {imageSrc: kazakhstanSvg, title: t('Kazakhstan'), altName: 'Kazakhstan'},
    {imageSrc: chinaSvg, title: t('China'), altName: 'China'},
    {imageSrc: russiaSvg, title: t('Russia'), altName: 'Russia'}
  ]

  const handleRegionSelect = (region: RegionType) => {
    setSelectedRegion(region)
    setListIsOpen(false)
  }

  return (
    <>
      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>{t('registerRegion')}</p>

        <div className={`${styles.drop__box}`}>
          <RegionDropList
            regions={regions}
            selectedRegion={selectedRegion}
            listIsOpen={listIsOpen}
            setListIsOpen={setListIsOpen}
            handleRegionSelect={handleRegionSelect}
          />
        </div>
      </div>

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class}`}
        isSecret={false}
        onSetValue={handleNameChange}
        currentValue={name}
        placeholder={t('registerFullName') + '...'}
        title={<p className={`${styles.input__title}`}>{t('registerFullName')}</p>}
      />

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2}`}
        isSecret={true}
        onSetValue={setPassword}
        currentValue={password}
        errorValue={password.length < 6 && password.length !== 0 ? t('passwordError') : ''}
        placeholder={t('passwordPlaceholder')}
        title={<p className={`${styles.input__title}`}>{t('password')}</p>}
      />

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title} ${styles.input__title__tel}`}>{t('phoneNumber')}</p>
        <TelephoneInputUI
          currentValue={telText}
          error={!isValidNumber ? 'error' : ''}
          onSetValue={onChangeTelNumber}
          numberStartWith={selectedRegion.altName as TNumberStart}
        />
      </div>

      <button onClick={onSubmit} className={`${styles.form__button}`}>
        {t('next')}
      </button>
    </>
  )
}

export default RegisterUserFirst
