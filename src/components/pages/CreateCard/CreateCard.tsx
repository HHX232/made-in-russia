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
import {Language} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'
import {usePathname} from 'next/navigation'
import {useActions} from '@/hooks/useActions'
import {setInitialStorageValue} from '@/hooks/createCardHelpers'
import {submitFormCardData} from '@/utils/createCardHelpers'
import 'md-editor-rt/lib/style.css'

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
    faqMatrixForOthers,
    setCardObjectForOthers,
    setCompanyDataForOthers,
    setFaqMatrixForOthers
  } = useCreateCardForm(initialData)
  // const [productCategoryes, setProductCategoryes] = useState<string[]>([])
  const [similarProducts, setSimilarProducts] = useState(new Set<Product>())
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(initialData?.category || null)
  // const [selectedDeliveryMethodIds, setSelectedDeliveryMethodIds] = useState<number[]>([1]) // Временные значения

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {descriptions}: {descriptions: any} = useTypedSelector((state) => state.multilingualDescriptions)
  const {ru, en, zh} = useTypedSelector((state) => state.multiLanguageCardPriceData)
  const multyLangObjectForPrices = {ru, en, zh}
  const {setDescriptions, setCharacteristics, setDelivery, setPackaging, updatePriceInfo} = useActions()

  useEffect(() => {
    setInitialStorageValue({
      setDescriptions,
      setCharacteristics,
      setDelivery,
      setPackaging,
      updatePriceInfo,
      initialData
    })
    setFaqMatrixForOthers({
      ru: initialData?.faq.map((el) => [el.questionTranslations.ru, el.answerTranslations.ru]) || [['', '']]
    })
    setFaqMatrixForOthers({
      en: initialData?.faq.map((el) => [el.questionTranslations.en, el.answerTranslations.en]) || [['', '']]
    })
    setFaqMatrixForOthers({
      zh: initialData?.faq.map((el) => [el.questionTranslations.zh, el.answerTranslations.zh]) || [['', '']]
    })
    setFaqMatrixForOthers({
      [currentLang]: initialData?.faq.map((el) => [
        el.questionTranslations[currentLang as Language],
        el.answerTranslations[currentLang as Language]
      ]) || [['', '']]
    })

    console.log('current faq matrix', faqMatrixForOthers, initialData?.faq)
  }, [initialData])

  const getValueForLang = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any, objectValue: keyof ICardFull): any => {
      const langData = cardObjectForOthers[currentLangState]
      return langData?.[objectValue] !== undefined ? langData[objectValue] : state
    },
    [currentLangState, currentLang, cardObjectForOthers]
  )

  // Используем универсальный хук для модального окна
  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const windowWidth = useWindowWidth()

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Добавляем состояние для отслеживания оставшихся начальных изображений
  const [remainingInitialImages, setRemainingInitialImages] = useState<string[]>(
    initialData?.media.map((el) => el.url) || []
  )

  // ! new line
  const initialImages = useMemo(
    () =>
      initialData?.media.map((el, i) => ({
        id: el.id,
        position: i
      })) || [],
    [initialData?.media]
  )

  const [objectRemainingInitialImages, setObjectRemainingInitialImages] = useState<{id: number; position: number}[]>(
    initialImages || []
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
      quantity: `${el.from}${el.to ? `-${el.to}` : ''}`,
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

  const getFaqMatrixForLang = useCallback((): string[][] => {
    return faqMatrixForOthers[currentLangState]
  }, [currentLangState, faqMatrixForOthers])

  const getCompanyDataForLang = useCallback((): CompanyDescriptionData => {
    return companyDataForOthers[currentLangState] || companyData
  }, [currentLangState, companyData, companyDataForOthers])

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
      saleDate: multyLangObjectForPrices[currentLangState].priceInfo.daysBeforeSale,
      currentLangState: currentLangState,
      cardTitle: cardTitle,
      uploadedFiles: uploadedFiles,
      cardObjectForOthers: cardObjectForOthers,
      remainingInitialImages: remainingInitialImages,
      objectRemainingInitialImages: objectRemainingInitialImages,
      pricesArray: pricesArray,
      descriptionImages: descriptionImages,
      descriptionMatrix: characteristics.map((el) => [el.title, el.characteristic]),
      packageArray: multyLangObjectForPrices[currentLangState].packaging.map((el) => [el.title, el.price]),
      companyData: companyData,
      companyDataImages: companyDataImages,
      faqMatrix: faqMatrixForOthers[currentLangState || 'en'] || [],
      errors: errors,
      selectedDeliveryMethodIds: [1]
    },
    () => {
      return descriptions[currentLangState]?.description
    },
    t
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
    setPricesArray(prices)
    if (errors.pricesArray) {
      setErrors((prev) => ({...prev, pricesArray: ''}))
    }
  }

  const handleDescriptionImagesChange = (images: ImageMapping[]) => {
    setTimeout(() => {
      setDescriptionImages(images)
    }, 0)
  }

  const handleCompanyDataChange = (data: CompanyDescriptionData) => {
    setCompanyData(data)
    if (errors.companyData) {
      setErrors((prev) => ({...prev, companyData: ''}))
    }
  }

  useEffect(() => {
    // Синхронизируем cardTitle с текущим языком
    const currentTitleValue = cardObjectForOthers[currentLangState]?.title
    if (currentTitleValue !== undefined && currentTitleValue !== cardTitle) {
      setCardTitle(currentTitleValue)
    }
  }, [cardObjectForOthers, cardTitle, currentLangState])

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

  const handleNewSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormValid) return
      const loadingToast = toast.loading('Сохранение карточки...')

      try {
        await submitFormCardData({
          cardObjectForOthers,
          companyDataForOthers,
          faqMatrixForOthers,
          similarProducts,
          selectedCategory,
          langFromPathname,
          currentLangState,
          cardTitle,
          descriptions,
          multyLangObjectForPrices,
          uploadedFiles,
          companyData,
          remainingInitialImages,
          objectRemainingInitialImages,
          pricesArray,
          pathname,
          initialData
        })
        toast.dismiss(loadingToast)
        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('gratulation')}</strong>
            <span>
              {t('cardSuccess').split(' ')[0] +
                (initialData?.id ? t('successUpdateCardEndText') : t('successCreateCardEndText'))}
            </span>
          </div>,
          {
            style: {
              background: '#2E7D32'
            }
          }
        )
      } catch (e) {
        toast.dismiss(loadingToast)
        toast.error(t('saveError'))
      }
    },
    [
      isFormValid,
      cardObjectForOthers,
      companyDataForOthers,
      faqMatrixForOthers,
      similarProducts,
      selectedCategory,
      langFromPathname,
      currentLangState,
      cardTitle,
      descriptions,
      multyLangObjectForPrices,
      uploadedFiles,
      companyData,
      remainingInitialImages,
      objectRemainingInitialImages,
      pricesArray,
      pathname,
      initialData,
      t
    ]
  )

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
          <h1 className={`${styles.create__title}`}>{t('createCardTitle')}</h1>

          <div className={`${styles.language__switcher}`}>
            <p className={`${styles.language__switcher__title}`}>{t('languageForInput')}</p>
            <p className={`${styles.language__switcher__subtitle}`}>
              {t('languageForInputSubtitle')} - {langFromPathname}
            </p>
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

          <form onSubmit={handleNewSave} className={`${styles.create__form}`}>
            {/* Поле "Название" */}
            <span className={`${styles.create__input__box__span}`}>
              <div className={`${styles.label__title__box}`}>
                <label className={`${styles.create__label__title}`} htmlFor='title'>
                  {t('name')}
                </label>
                <DropList
                  direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
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
                  direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
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
                allowMultipleFiles
                errorValue={errors.uploadedFiles}
                setErrorValue={(value: string) => setErrors((prev) => ({...prev, uploadedFiles: value}))}
                inputIdPrefix='product-images'
              />
            </div>
            <div className={`${styles.label__title__box}`}>
              <h3 className={`${styles.create__similar__products__box__title}`}>{t('similarProducts')}</h3>
              <DropList
                direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
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
                handleCompanyDataChange(data)

                const updatedCompanyDataForOthers = {...companyDataForOthers}
                updatedCompanyDataForOthers[currentLangState] = data
                setCompanyDataForOthers(updatedCompanyDataForOthers)
              }}
            />
            {/* CreateFaqCard */}
            {currentLangState === 'ru' && (
              <CreateFaqCard
                values={faqMatrixForOthers.ru}
                onChange={(matrix) => {
                  const updatedFaqMatrixForOthers = {...faqMatrixForOthers}
                  updatedFaqMatrixForOthers['ru'] = matrix
                  setFaqMatrixForOthers(updatedFaqMatrixForOthers)
                }}
              />
            )}
            {currentLangState === 'en' && (
              <CreateFaqCard
                values={faqMatrixForOthers.en}
                onChange={(matrix) => {
                  const updatedFaqMatrixForOthers = {...faqMatrixForOthers}
                  updatedFaqMatrixForOthers['en'] = matrix
                  setFaqMatrixForOthers(updatedFaqMatrixForOthers)
                }}
              />
            )}
            {currentLangState === 'zh' && (
              <CreateFaqCard
                values={faqMatrixForOthers.zh}
                onChange={(matrix) => {
                  const updatedFaqMatrixForOthers = {...faqMatrixForOthers}
                  updatedFaqMatrixForOthers['zh'] = matrix
                  setFaqMatrixForOthers(updatedFaqMatrixForOthers)
                }}
              />
            )}
            <div className={`${styles.button__box}`}>
              <button
                style={{
                  opacity: !isFormValid ? 0.7 : 1,
                  cursor: !isFormValid ? 'not-allowed' : 'pointer'
                }}
                className={`${styles.create____submit__button}`}
                type='submit'
                // disabled={!isFormValid}
                onClick={() => {
                  Object.entries(errors).forEach(([key, value]) => {
                    if (value) {
                      toast.error(
                        <div style={{lineHeight: 1.5}}>
                          <strong style={{display: 'block', marginBottom: 4}}>{t('error')}</strong>
                          <span>{value}</span>
                        </div>,
                        {
                          style: {
                            background: '#AC2525'
                          }
                        }
                      )
                    }
                  })
                }}
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
