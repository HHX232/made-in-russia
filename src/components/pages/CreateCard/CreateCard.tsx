/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useState, useEffect, useCallback, useMemo} from 'react'
import styles from './CreateCard.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import Image from 'next/image'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import CreateCardPriceElements from './CreateCardElements/CreateCardPriceElements/CreateCardPriceElements'
import CreateDescriptionsElements, {ImageMapping} from './CreateDescriptionsElements/CreateDescriptionsElements'
import CreateCompanyDescription from './CreateCompanyDescription/CreateCompanyDescription'
import CreateFaqCard from './CreateFaqCard/CreateFaqCard'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import ICardFull, {ICategory} from '@/services/card/card.types'
import {Product} from '@/services/products/product.types'
import CreateSimilarProducts from './CreateSimilarProducts/CreateSimilarProducts'
import CreateCardProductCategory from './CreateCardProductCategory/CreateCardProductCategory'
import {toast} from 'sonner'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {ValidationErrors, CompanyDescriptionData, CreateCardProps, ICurrentLanguage} from './CreateCard.types'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useFormValidation} from '@/hooks/useFormValidation'
import {useCreateCardForm} from '@/hooks/useCreateCardForm'
import {useCreateCardAPI} from '@/hooks/useCreateCardAPI'
import {SupportedLanguage} from '@/store/multilingualDescriptionsInCard/multilingualDescriptions.types'
import {Language} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'
import {usePathname} from 'next/navigation'

const vopros = '/vopros.svg'
// Конфигурация изображений для подсказок
export const HELP_IMAGES = {
  title: '/create/help1.jpg',
  productImages: '/create/help2.jpg',
  prices: '/create/help3.jpg',
  saleDate: '/create/help4.jpg',
  delivery: '/create/help5.jpg',
  charactersTable: '/create/help6.jpg',
  description: '/create/help7.jpg',
  companyDescription: '/create/help8.jpg',
  faq: '/create/help9.jpg',
  similarProducts: '/create/help10.jpg'
} as const

const CreateCard: FC<CreateCardProps> = ({initialData}) => {
  const [isValidForm, setIsValidForm] = useState(true)

  const {
    cardObjectForOthers,
    companyDataForOthers,
    descriptionMatrixForOthers,
    faqMatrixForOthers,
    formState,
    setCardObjectForOthers,
    setCompanyDataForOthers,
    setDescriptionMatrixForOthers,
    setFaqMatrixForOthers,
    setFormState
  } = useCreateCardForm(initialData)
  // const [productCategoryes, setProductCategoryes] = useState<string[]>([])
  const [similarProducts, setSimilarProducts] = useState(new Set<Product>())
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(initialData?.category || null)
  const [selectedDeliveryMethodIds, setSelectedDeliveryMethodIds] = useState<number[]>([1]) // Временные значения
  const [saleDate, setSaleDate] = useState<string>(
    initialData?.daysBeforeDiscountExpires ? initialData.daysBeforeDiscountExpires.toString() : ''
  )
  const t = useTranslations('createCard')

  // Language start ===========
  const pathname = usePathname()
  const langFromPathname = pathname.split('/')[1]
  const currentLangFromHook = useCurrentLanguage()
  const currentLang = langFromPathname || currentLangFromHook

  const [currentLangState, setCurrentLangState] = useState<ICurrentLanguage>(
    (langFromPathname as ICurrentLanguage) || (currentLang as ICurrentLanguage)
  )
  // Language end ===========

  const [cardTitle, setCardTitle] = useState(initialData?.title || '')

  const {descriptions} = useTypedSelector((state) => state.multilingualDescriptions)

  // useEffect(() => {
  //   console.log('cardObjectForOthers', cardObjectForOthers)
  // }, [cardObjectForOthers])

  const getValueForLang = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any, objectValue: keyof ICardFull): any => {
      const langData = cardObjectForOthers[currentLangState]
      return langData?.[objectValue] !== undefined ? langData[objectValue] : state
    },
    [currentLangState, currentLang, cardObjectForOthers]
  )

  const [packageArray, setPackaginArray] = useState<string[][]>([])

  // Используем универсальный хук для модального окна
  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const indowWidth = useWindowWidth()

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Добавляем состояние для отслеживания оставшихся начальных изображений
  const [remainingInitialImages, setRemainingInitialImages] = useState<string[]>(
    initialData?.media.map((el) => el.url) || []
  )
  const [objectRemainingInitialImages, setObjectRemainingInitialImages] = useState<{id: number; position: number}[]>(
    initialData?.media.map((el, i) => {
      return {
        id: el.id,
        position: i
      }
    }) || []
  )

  const [pricesArray, setPricesArray] = useState<
    {
      currency: string
      priceWithDiscount: string
      priceWithoutDiscount: string
      quantity: string
      value: number
      unit: string
    }[]
  >(
    initialData?.prices.map((el) => ({
      currency: el.currency,
      priceWithDiscount: el.discountedPrice.toString(),
      priceWithoutDiscount: el.originalPrice.toString(),
      quantity: `${el.from}`,
      value: Math.min(el.discountedPrice, el.originalPrice),
      unit: el.unit
    })) || []
  )

  const [descriptionImages, setDescriptionImages] = useState<ImageMapping[]>([])

  const {characteristics} = useTypedSelector(
    (state) => state.multiLanguageCardPriceData[(langFromPathname as Language) || (currentLang as Language)]
  )

  // Состояние для описания компании (CreateCompanyDescription)
  const [companyData, setCompanyData] = useState<CompanyDescriptionData>({
    topDescription: initialData?.aboutVendor?.mainDescription || '',
    images:
      initialData && initialData?.aboutVendor && initialData?.aboutVendor?.media?.length > 0
        ? initialData.aboutVendor.media.map((el) => ({
            image: el.url as string,
            description: el.altText
          }))
        : [
            {image: null, description: ''},
            {image: null, description: ''},
            {image: null, description: ''},
            {image: null, description: ''}
          ],
    bottomDescription: initialData?.aboutVendor?.furtherDescription || ''
  })
  const [companyDataImages, setCompanyDataImages] = useState<{id: number; position: number}[]>(
    (initialData &&
      initialData?.aboutVendor?.media.map((el, i) => {
        return {
          id: el.id,
          position: i
        }
      })) ||
      []
  )

  // Состояние для FAQ (CreateFaqCard)
  const [faqMatrix, setFaqMatrix] = useState<string[][]>(
    initialData?.faq.map((el) => [el.question, el.answer]) || [
      ['', ''], // Начальные пустые строки
      ['', ''],
      ['', ''],
      ['', ''],
      ['', '']
    ]
  )

  const getFaqMatrixForLang = useCallback((): string[][] => {
    return faqMatrixForOthers[currentLangState]
  }, [currentLangState, faqMatrixForOthers])

  const getCompanyDataForLang = useCallback((): CompanyDescriptionData => {
    if (currentLangState === langFromPathname) {
      return companyData
    }
    return companyDataForOthers[currentLangState] || companyData
  }, [currentLangState, langFromPathname, companyData, companyDataForOthers])

  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<ValidationErrors>({
    cardTitle: '',
    uploadedFiles: '',
    pricesArray: '',
    description: '',
    descriptionImages: '',
    descriptionMatrix: '',
    companyData: '',
    faqMatrix: ''
  })

  // Обновляем валидацию при изменении полей
  const {validationErrors, isFormValid} = useFormValidation(
    {
      isValidForm: isValidForm,
      submitAttempted: true,
      similarProducts: similarProducts,
      selectedCategory: selectedCategory,
      saleDate: saleDate,
      currentLangState: currentLangState,
      cardTitle: cardTitle,
      uploadedFiles: uploadedFiles,
      cardObjectForOthers: cardObjectForOthers,
      remainingInitialImages: remainingInitialImages,
      objectRemainingInitialImages: objectRemainingInitialImages,
      pricesArray: pricesArray,
      descriptionImages: descriptionImages,
      descriptionMatrix: characteristics.map((el) => [el.title, el.characteristic]),
      packageArray: packageArray,
      companyData: companyData,
      companyDataImages: companyDataImages,
      faqMatrix: faqMatrixForOthers[currentLangState || 'ru'] || faqMatrix,

      errors: errors,
      selectedDeliveryMethodIds: selectedDeliveryMethodIds
    },
    () => {
      return descriptions[currentLangState]?.description
    }
  )

  useEffect(() => {
    setIsValidForm(isFormValid)
    // Обновляем ошибки только если они изменились
    setErrors((prev) => {
      const hasChanges = Object.keys(validationErrors).some(
        (key) => prev[key as keyof ValidationErrors] !== validationErrors[key as keyof ValidationErrors]
      )
      return hasChanges ? validationErrors : prev
    })
  }, [isFormValid, validationErrors])

  const handleUploadedFilesChange = useCallback(
    (files: File[]) => {
      setTimeout(() => {
        setUploadedFiles(files)
        if (errors.uploadedFiles && files.length + remainingInitialImages.length >= 3) {
          setErrors((prev) => ({...prev, uploadedFiles: ''}))
        }
      }, 0)
    },
    [errors.uploadedFiles, remainingInitialImages.length]
  )
  // Обработчик для обновления оставшихся начальных изображений
  const handleActiveImagesChange = (remainingUrls: string[]) => {
    setRemainingInitialImages(remainingUrls)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePricesArrayChange = (prices: any[]) => {
    // console.log('prices', prices)
    // setTimeout(() => {
    setPricesArray(prices)
    // }, 0)
    if (errors.pricesArray) {
      setErrors((prev) => ({...prev, pricesArray: ''}))
    }
  }

  // const handleDescriptionChange = (value: string) => {
  //   setDescription(value)
  //   if (errors.description) {
  //     setErrors((prev) => ({...prev, description: ''}))
  //   }
  // }

  const handleDescriptionImagesChange = (images: ImageMapping[]) => {
    setTimeout(() => {
      setDescriptionImages(images)
    }, 0)
    // Изображения в описании необязательны, поэтому не сбрасываем ошибку
  }

  const handleCompanyDataChange = (data: CompanyDescriptionData) => {
    // setTimeout(() => {
    setCompanyData(data)
    // }, 0)
    if (errors.companyData) {
      setErrors((prev) => ({...prev, companyData: ''}))
    }
  }

  const {submitForm} = useCreateCardAPI()

  useEffect(() => {
    // Синхронизируем cardTitle с текущим языком
    const currentTitleValue = cardObjectForOthers[currentLangState]?.title
    if (currentTitleValue !== undefined && currentTitleValue !== cardTitle) {
      setCardTitle(currentTitleValue)
    }
  }, [cardObjectForOthers, currentLangState])

  const handleTitleChange = useCallback(
    (value: string) => {
      // Обновляем и основное состояние и объект для языков
      setCardTitle(value)

      const updatedCardTitleForOthers = {...cardObjectForOthers}
      updatedCardTitleForOthers[currentLangState] = {
        ...updatedCardTitleForOthers[currentLangState],
        title: value
      }
      setCardObjectForOthers(updatedCardTitleForOthers)
    },
    [cardObjectForOthers, currentLangState]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('Submit attempted. Form valid:', isFormValid)

    if (!isFormValid) {
      const firstError = Object.entries(validationErrors).find(([_, error]) => error !== '')
      console.log('Validation failed. First error:', firstError)

      if (firstError) {
        toast.error(
          <div style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>{t('validateError')}</strong>
            <span>{firstError[1]}</span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
      }
      return
    }

    // Проверка наличия категории
    if (!selectedCategory) {
      console.log('Category validation failed')
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('error')}</strong>
          <span>{t('categoryError')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      return
    }

    console.log('Submitting form...')

    try {
      await submitForm(
        {
          cardTitle: getValueForLang(cardTitle, 'title') || cardTitle,
          getCurrentMainDescription: () => cardObjectForOthers[currentLangState]?.mainDescription,
          getCurrentFurtherDescription: () => cardObjectForOthers[currentLangState]?.furtherDescription,
          selectedDeliveryMethodIds: selectedDeliveryMethodIds,
          pricesArray: pricesArray,
          descriptionMatrix: characteristics.map((el) => [el.title, el.characteristic]),
          companyData: getCompanyDataForLang(),
          faqMatrix: faqMatrixForOthers[currentLangState],
          packageArray: packageArray,
          selectedCategory: selectedCategory,
          saleDate: saleDate,
          similarProducts: similarProducts,
          uploadedFiles: uploadedFiles,
          objectRemainingInitialImages: objectRemainingInitialImages,
          companyDataImages: companyDataImages
        },
        initialData
      )
    } catch (error) {
      console.error('Ошибка при сохранении:', error as Error)
    }
  }

  return (
    <>
      {/* Единое модальное окно для всех изображений подсказок */}
      <ModalWindowDefault isOpen={isModalOpen} onClose={closeModal}>
        {modalImage && (
          <Image
            className={`${styles.drop__extra__image} ${styles.drop__extra__image__modal}`}
            src={modalImage}
            alt='Help image'
            width={1000}
            height={1000}
          />
        )}
      </ModalWindowDefault>

      <Header />
      <div className={'container'}>
        <div className={`${styles.create__inner}`}>
          <h1 className={`${styles.create__title}`}>{t('createCardTitle')} + TEST</h1>

          <div className={`${styles.language__switcher}`}>
            <p className={`${styles.language__switcher__title}`}>{t('languageForInput')}</p>
            <p className={`${styles.language__switcher__subtitle}`}>{t('languageForInputSubtitle')}</p>
            <div className={`${styles.language__buttons}`}>
              <button
                type='button'
                className={`${styles.language__button} ${currentLangState === 'ru' ? styles.language__button__active : ''}`}
                onClick={() => setCurrentLangState('ru')}
              >
                RU
              </button>
              <button
                type='button'
                className={`${styles.language__button} ${currentLangState === 'en' ? styles.language__button__active : ''}`}
                onClick={() => setCurrentLangState('en')}
              >
                EN
              </button>
              <button
                type='button'
                className={`${styles.language__button} ${currentLangState === 'zh' ? styles.language__button__active : ''}`}
                onClick={() => setCurrentLangState('zh')}
              >
                ZH
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={`${styles.create__form}`}>
            {/* Поле "Название" */}
            <span className={`${styles.create__input__box__span}`}>
              <div className={`${styles.label__title__box}`}>
                <label className={`${styles.create__label__title}`} htmlFor='title'>
                  {t('name')}
                </label>
                <DropList
                  direction={indowWidth && indowWidth < 768 ? 'bottom' : 'right'}
                  safeAreaEnabled
                  positionIsAbsolute={false}
                  trigger='hover'
                  extraClass={`${styles.drop__extra} ${styles.drop__extra__first}`}
                  arrowClassName={`${styles.arrow__none}`}
                  title={<Image src={vopros} alt='vopros' width={27} height={27} />}
                  items={[
                    <Image
                      className={`${styles.drop__extra__image}`}
                      src={HELP_IMAGES.title}
                      alt={t('altHelpWithName')}
                      width={300}
                      height={300}
                      key={1}
                      onClick={() => openModal(HELP_IMAGES.title)}
                    />
                  ]}
                />
              </div>
              <TextInputUI
                errorValue={errors.cardTitle}
                extraClass={`${styles.create__input__title}`}
                idForLabel='title'
                placeholder={t('name')}
                currentValue={getValueForLang(cardTitle, 'title')}
                onSetValue={handleTitleChange}
                theme='superWhite'
              />
            </span>

            <div className={`${styles.create__input__box__span__category}`}>
              <div className={`${styles.label__title__box}`}>
                <p className={`${styles.create__label__title}`}>{t('categoryTitle')}</p>
              </div>
              <CreateCardProductCategory
                initialProductCategory={selectedCategory || undefined}
                // initialProductCategory={getValueForLang(selectedCategory, 'category')}
                onSetCategory={(category) => setSelectedCategory(category)}
              />
            </div>
            {/* Поле "Изображения товара" */}
            <div className={`${styles.create__input__box__span} ${styles.create__input__box__span__images}`}>
              <div className={`${styles.label__title__box}`}>
                <p className={`${styles.create__label__title}`}>{t('imageCard')}</p>
                <DropList
                  direction={indowWidth && indowWidth < 768 ? 'bottom' : 'right'}
                  safeAreaEnabled
                  positionIsAbsolute={false}
                  trigger='hover'
                  extraClass={`${styles.drop__extra} ${styles.drop__extra__second}`}
                  arrowClassName={`${styles.arrow__none}`}
                  title={<Image src={vopros} alt='vopros' width={27} height={27} />}
                  items={[
                    <Image
                      className={`${styles.drop__extra__image}`}
                      src={HELP_IMAGES.productImages}
                      alt={t('altHelpWithImageCard')}
                      width={300}
                      height={300}
                      key={1}
                      onClick={() => openModal(HELP_IMAGES.productImages)}
                    />
                  ]}
                />
              </div>
              <CreateImagesInput
                onFilesChange={handleUploadedFilesChange}
                onActiveImagesChange={handleActiveImagesChange}
                activeImages={remainingInitialImages}
                maxFiles={9}
                minFiles={3}
                errorValue={errors.uploadedFiles}
                setErrorValue={(value: string) => setErrors((prev) => ({...prev, uploadedFiles: value}))}
                inputIdPrefix='product-images'
              />
            </div>
            <div className={`${styles.label__title__box}`}>
              <h3 className={`${styles.create__similar__products__box__title}`}>{t('similarProducts')}</h3>
              <DropList
                direction={indowWidth && indowWidth < 768 ? 'bottom' : 'right'}
                safeAreaEnabled
                positionIsAbsolute={false}
                trigger='hover'
                extraClass={`${styles.drop__extra} ${styles.drop__extra__second}`}
                arrowClassName={`${styles.arrow__none}`}
                title={<Image src={vopros} alt='vopros' width={27} height={27} />}
                items={[
                  <Image
                    className={`${styles.drop__extra__image}`}
                    src={HELP_IMAGES.similarProducts}
                    alt={t('altHelpWithSimilarProducts')}
                    width={300}
                    height={300}
                    key={1}
                    onClick={() => openModal(HELP_IMAGES.similarProducts)}
                  />
                ]}
              />
            </div>
            <CreateSimilarProducts
              // initialProducts={initialData?.similarProducts}
              onUpdateProductsSet={setSimilarProducts}
            />
            {/* CreateCardPriceElements */}
            <CreateCardPriceElements
              inputType={['text', 'number', 'number', 'text', 'text']}
              pricesArray={pricesArray.map((item) => [
                item.quantity,
                item.priceWithoutDiscount,
                item.priceWithDiscount,
                item.currency,
                item.unit
              ])}
              currentLanguage={currentLangState}
              onSetPricesArray={handlePricesArrayChange}
              pricesError={errors.pricesArray}
            />

            <CreateDescriptionsElements
              onImagesChange={handleDescriptionImagesChange}
              descriptionError={errors.description}
              currentDynamicLang={currentLangState}
            />
            <CreateCompanyDescription
              data={getCompanyDataForLang()}
              onChange={(data) => {
                if (currentLangState === currentLang) {
                  handleCompanyDataChange(data)
                } else {
                  const updatedCompanyDataForOthers = {...companyDataForOthers}
                  updatedCompanyDataForOthers[currentLangState] = data
                  setCompanyDataForOthers(updatedCompanyDataForOthers)
                }
              }}
            />
            {/* CreateFaqCard */}
            <CreateFaqCard
              values={getFaqMatrixForLang()}
              onChange={(matrix) => {
                const updatedFaqMatrixForOthers = {...faqMatrixForOthers}
                updatedFaqMatrixForOthers[currentLangState] = matrix
                setFaqMatrixForOthers(updatedFaqMatrixForOthers)
              }}
            />
            <div className={`${styles.button__box}`}>
              <button
                style={{
                  opacity: !isFormValid ? 0.7 : 1,
                  cursor: !isFormValid ? 'not-allowed' : 'pointer'
                }}
                className={`${styles.create____submit__button}`}
                type='submit'
                disabled={!isFormValid}
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CreateCard
