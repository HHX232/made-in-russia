import React from 'react'
import Image from 'next/image'
import styles from '../RegisterPage.module.scss'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {TelephoneInputUI, TNumberStart} from '@/components/UI-kit/inputs/TelephoneInputUI/TelephoneInputUI'

const belarusSvg = '/belarus.svg'

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
  const regions = [
    {imageSrc: belarusSvg, title: 'Беларусь', altName: 'Belarus'},
    {imageSrc: belarusSvg, title: 'Казахстан', altName: 'Kazakhstan'},
    {imageSrc: belarusSvg, title: 'Китай', altName: 'China'},
    {imageSrc: belarusSvg, title: 'Россия', altName: 'Russia'}
  ]

  //   const categoryOptions: MultiSelectOption[] = [
  //     {id: 1, label: 'Беларусь', value: 'Belarus', icon: regions[0].imageSrc},
  //     {id: 2, label: 'Китай', value: 'China', icon: regions[1].imageSrc},
  //     {id: 3, label: 'Казахстан', value: 'Kazakhstan', icon: regions[2].imageSrc},
  //     {id: 4, label: 'Россия', value: 'Russia', icon: regions[3].imageSrc},
  //     {id: 5, label: 'Другое', value: 'Other'}
  //   ]

  //   const [selectedCategories, setSelectedCategories] = useState<MultiSelectOption[]>([])
  //   <MultiDropSelect
  //   options={categoryOptions}
  //   selectedValues={selectedCategories}
  //   onChange={setSelectedCategories}
  //   placeholder='Выберите категории...'
  // />
  const handleRegionSelect = (region: RegionType) => {
    setSelectedRegion(region)
    setListIsOpen(false)
  }

  return (
    <>
      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>Страна/Регион</p>

        <div className={`${styles.drop__box}`}>
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
      </div>

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${name.length !== 0 && name.length < 3 && styles.extra__name__class}`}
        isSecret={false}
        onSetValue={handleNameChange}
        currentValue={name}
        placeholder='Введите имя...'
        title={<p className={`${styles.input__title}`}>Полное имя</p>}
      />

      <TextInputUI
        extraClass={`${styles.inputs__text_extra} ${styles.inputs__text_extra_2}`}
        isSecret={true}
        onSetValue={setPassword}
        currentValue={password}
        errorValue={password.length < 6 && password.length !== 0 ? 'Пароль должен быть не менее 6 символов' : ''}
        placeholder='Введите пароль, 6-20 символов'
        title={<p className={`${styles.input__title}`}>Пароль аккаунта</p>}
      />

      <div className={`${styles.some__drop__box}`}>
        <p className={`${styles.input__title}`}>Номер мобильного телефона</p>
        <TelephoneInputUI
          currentValue={telText}
          error={!isValidNumber ? 'error' : ''}
          onSetValue={onChangeTelNumber}
          numberStartWith={selectedRegion.altName as TNumberStart}
        />
      </div>

      <button onClick={onSubmit} className={`${styles.form__button}`}>
        Далее
      </button>
    </>
  )
}

export default RegisterUserFirst
