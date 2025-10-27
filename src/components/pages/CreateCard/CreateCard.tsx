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
import CreateFaqCard from './CreateFaqCard/CreateFaqCard'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import ICardFull, {ICategory} from '@/services/card/card.types'
import {Product} from '@/services/products/product.types'
import CreateSimilarProducts from './CreateSimilarProducts/CreateSimilarProducts'
import CreateCardProductCategory from './CreateCardProductCategory/CreateCardProductCategory'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {ValidationErrors, CreateCardProps, ICurrentLanguage} from './CreateCard.types'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useFormValidation} from '@/hooks/useFormValidation'
import {useCreateCardForm} from '@/hooks/useCreateCardForm'
import {Language} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'
import {usePathname} from 'next/navigation'
import {useActions} from '@/hooks/useActions'
import {setInitialStorageValue} from '@/hooks/createCardHelpers'
import {submitFormCardData} from '@/utils/createCardHelpers'
import {toast} from 'sonner'
import {useRouter} from 'next/navigation'
import RowsInputs from '@/components/UI-kit/RowsInputs/RowsInputs'

// import {useQueryClient} from '@tanstack/react-query'
// import {invalidateProductsCache} from '@/hooks/useProducts'

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
  const router = useRouter()
  const {cardObjectForOthers, faqMatrixForOthers, setCardObjectForOthers, setFaqMatrixForOthers} =
    useCreateCardForm(initialData)

  const [similarProducts, setSimilarProducts] = useState(new Set<Product>())
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(initialData?.category || null)

  const t = useTranslations('createCard')
  // Language start ===========
  const pathname = usePathname()
  // const langFromPathname = pathname.split('/')[1]
  const currentLangFromHook = useCurrentLanguage()
  const currentLang = currentLangFromHook

  const [currentLangState, setCurrentLangState] = useState<ICurrentLanguage>(currentLang as ICurrentLanguage)
  // Language end ===========

  const [cardTitle, setCardTitle] = useState(initialData?.title || '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {descriptions}: {descriptions: any} = useTypedSelector((state) => state.multilingualDescriptions)
  const {ru, en, zh} = useTypedSelector((state) => state.multiLanguageCardPriceData)
  const multyLangObjectForPrices = useMemo(() => ({ru, en, zh}), [ru, en, zh])
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
        el.questionTranslations?.[currentLang as Language],
        el.answerTranslations?.[currentLang as Language]
      ]) || [['', '']]
    })

    console.log('current faq matrix', faqMatrixForOthers, initialData?.faq)
  }, [initialData])

  const getValueForLang = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any, objectValue: keyof ICardFull): any => {
      const langData = cardObjectForOthers?.[currentLangState]
      return langData?.[objectValue] !== undefined ? langData[objectValue] : state
    },
    [currentLangState, currentLang, cardObjectForOthers]
  )
  // const queryClient = useQueryClient()

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

  const [testFaq, setTestFaq] = useState<string[][]>([['', '']])

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
    (state) => state.multiLanguageCardPriceData[(currentLang as Language) || (currentLang as Language)]
  )
  // console.log('characteristics after selector', characteristics)

  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<ValidationErrors>({
    cardTitle: '',
    uploadedFiles: '',
    pricesArray: '',
    description: '',
    descriptionImages: '',
    descriptionMatrix: ''
    // faqMatrix: ''
  })

  const formState = useMemo(
    () => ({
      isValidForm,
      submitAttempted: true,
      similarProducts,
      selectedCategory,
      saleDate: multyLangObjectForPrices?.[currentLangState]?.priceInfo?.daysBeforeSale,
      currentLangState,
      cardTitle,
      uploadedFiles,
      cardObjectForOthers,
      remainingInitialImages,
      objectRemainingInitialImages,
      pricesArray,
      descriptionImages,
      descriptionMatrix: characteristics?.map((el) => [el.title, el.characteristic]),
      packageArray: multyLangObjectForPrices?.[currentLangState]?.packaging?.map((el) => [el.title, el.price]),
      faqMatrix: faqMatrixForOthers?.[currentLangState || 'en'] || [],
      errors,
      selectedDeliveryMethodIds: [1]
    }),
    [
      isValidForm,
      similarProducts,
      selectedCategory,
      multyLangObjectForPrices,
      currentLangState,
      cardTitle,
      uploadedFiles,
      cardObjectForOthers,
      remainingInitialImages,
      objectRemainingInitialImages,
      pricesArray,
      descriptionImages,
      characteristics,
      faqMatrixForOthers,
      errors
    ]
  )

  // Инициализируем хук валидации
  const {validateAllFields} = useFormValidation(formState, () => descriptions?.[currentLangState]?.description, t)

  const handleUploadedFilesChange = useCallback(
    (files: File[]) => {
      setTimeout(() => {
        setUploadedFiles(files)
        // Валидируем только поле изображений при его изменении
        if (errors.uploadedFiles && files.length + remainingInitialImages.length >= 1) {
          setErrors((prev) => ({...prev, uploadedFiles: ''}))
        }
      }, 0)
    },
    [errors.uploadedFiles, remainingInitialImages.length]
  )

  // Обработчик для обновления оставшихся начальных изображений
  const handleActiveImagesChange = useCallback((remainingUrls: string[]) => {
    setRemainingInitialImages(remainingUrls)
  }, [])

  const handlePricesArrayChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prices: any[]) => {
      setPricesArray(prices)
      if (errors.pricesArray) {
        setErrors((prev) => ({...prev, pricesArray: ''}))
      }
    },
    [errors.pricesArray]
  )

  useEffect(() => {
    // Синхронизируем cardTitle с текущим языком
    const currentTitleValue = cardObjectForOthers?.[currentLangState]?.title
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
        ...updatedCardTitleForOthers?.[currentLangState],
        title: value
      }
      setCardObjectForOthers(updatedCardTitleForOthers)

      // Очищаем ошибку заголовка при изменении (быстрая валидация)
      if (errors.cardTitle && value.trim().length > 0) {
        setErrors((prev) => ({...prev, cardTitle: ''}))
      }
    },
    [cardObjectForOthers, currentLangState, errors.cardTitle]
  )

  const handleNewSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Выполняем полную валидацию при сабмите
      const {validationErrors, isFormValid: isValid} = validateAllFields()
      setErrors(validationErrors)
      setIsValidForm(isValid)

      if (!isValid) {
        Object.entries(validationErrors).forEach(([key, value]) => {
          if (value) {
            toast.error(
              <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
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
        return
      }

      const loadingToast = toast.loading('Saving...')

      try {
        await submitFormCardData({
          cardObjectForOthers,
          faqMatrixForOthers,
          similarProducts,
          selectedCategory,
          langFromPathname: currentLang,
          currentLangState,
          cardTitle,
          descriptions,
          multyLangObjectForPrices,
          uploadedFiles,
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
                ' ' +
                (initialData?.id ? t('successUpdateCardEndText') : t('successCreateCardEndText'))}
            </span>
          </div>,
          {
            style: {
              background: '#2E7D32'
            }
          }
        )
        // invalidateProductsCache(queryClient)
        router.push(`/vendor`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast.dismiss(loadingToast)
        console.log(e, 'path:', e?.message?.errors?.message)
        // toast.error(
        //   <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
        //     <strong style={{display: 'block', marginBottom: 4}}>{t('saveError')}</strong>
        //     <span>{e?.message?.errors?.message}</span>
        //   </div>,
        //   {
        //     style: {
        //       background: '#AC2525'
        //     }
        //   }
        // )
      }
    },
    [
      validateAllFields,
      cardObjectForOthers,
      faqMatrixForOthers,
      similarProducts,
      selectedCategory,
      currentLang,
      currentLangState,
      cardTitle,
      descriptions,
      multyLangObjectForPrices,
      uploadedFiles,
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
              {t('languageForInputSubtitle')} - {currentLang}
            </p>
            <div className={`${styles.language__buttons}`}>
              <button
                id='cy-language-button--switch-ru'
                data-active={currentLangState === 'ru'}
                type='button'
                className={`${styles.language__button} ${currentLangState === 'ru' ? styles.language__button__active : ''}`}
                onClick={() => setCurrentLangState('ru')}
              >
                RU
              </button>
              <button
                id='cy-language-button--switch-en'
                data-active={currentLangState === 'en'}
                type='button'
                className={`${styles.language__button} ${currentLangState === 'en' ? styles.language__button__active : ''}`}
                onClick={() => setCurrentLangState('en')}
              >
                EN
              </button>
              <button
                id='cy-language-button--switch-zh'
                data-active={currentLangState === 'zh'}
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
                <label className={`${styles.create__label__title}`} htmlFor='cy-title-create-input'>
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
                idForLabel='cy-title-create-input'
                placeholder={t('name')}
                currentValue={getValueForLang(cardTitle, 'title')}
                onSetValue={handleTitleChange}
                theme='newWhite'
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
                minFiles={1}
                allowMultipleFiles
                errorValue={errors.uploadedFiles}
                setErrorValue={(value: string) => setErrors((prev) => ({...prev, uploadedFiles: value}))}
                inputIdPrefix='product-images'
              />
            </div>
            <div style={{display: 'none'}}>
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
            </div>
            {/* CreateCardPriceElements */}
            <CreateCardPriceElements
              inputType={['text', 'number', 'number', 'dropdown', 'dropdown']}
              pricesArray={pricesArray.map((item) => [
                item.quantity,
                item.priceWithoutDiscount,
                item.priceWithDiscount,
                item.currency,
                item.unit
              ])}
              dropdownPricesOptions={[
                ['RUB', 'USD', 'CNY'],
                [
                  t('mg'),
                  t('g'),
                  t('kg'),
                  t('c'),
                  t('t'),
                  t('ml'),
                  t('l'),
                  t('hl'),
                  t('m3'),
                  t('m2'),
                  t('cm2'),
                  t('pcs'),
                  t('pack'),
                  t('m'),
                  t('cm'),
                  t('pair'),
                  t('set'),
                  t('box')
                ]
              ]}
              canCreateNewOption={[false, true]}
              currentLanguage={currentLangState}
              onSetPricesArray={handlePricesArrayChange}
              pricesError={errors.pricesArray}
            />

            <CreateDescriptionsElements descriptionError={errors.description} currentDynamicLang={currentLangState} />

            {/* CreateFaqCard */}
            {currentLangState === 'ru' && (
              <CreateFaqCard
                values={faqMatrixForOthers?.ru}
                onChange={(matrix) => {
                  console.log('faqMatrixForOthers ru', faqMatrixForOthers?.ru)

                  console.log('ru matrix update', matrix)
                  const updatedFaqMatrixForOthers = {...faqMatrixForOthers}
                  updatedFaqMatrixForOthers['ru'] = matrix
                  setFaqMatrixForOthers(updatedFaqMatrixForOthers)
                }}
              />
            )}
            {currentLangState === 'en' && (
              <CreateFaqCard
                values={faqMatrixForOthers?.en}
                onChange={(matrix) => {
                  console.log('faqMatrixForOthers en', faqMatrixForOthers?.en)
                  console.log('en matrix update', matrix)
                  const updatedFaqMatrixForOthers = {...faqMatrixForOthers}
                  updatedFaqMatrixForOthers['en'] = matrix
                  setFaqMatrixForOthers(updatedFaqMatrixForOthers)
                }}
              />
            )}
            {currentLangState === 'zh' && (
              <CreateFaqCard
                values={faqMatrixForOthers?.zh}
                onChange={(matrix) => {
                  console.log('faqMatrixForOthers zh', faqMatrixForOthers?.zh)
                  console.log('zh matrix update', matrix)
                  const updatedFaqMatrixForOthers = {...faqMatrixForOthers}
                  updatedFaqMatrixForOthers['zh'] = matrix
                  setFaqMatrixForOthers(updatedFaqMatrixForOthers)
                }}
              />
            )}
            <div className={`${styles.button__box}`}>
              <button
                id='cy-submit-create-button'
                style={{
                  opacity: !isValidForm ? 0.7 : 1,
                  cursor: !isValidForm ? 'not-allowed' : 'pointer'
                }}
                className={`${styles.create____submit__button}`}
                type='submit'
                // disabled={!isFormValid}
                onClick={() => {
                  validateAllFields()
                  Object.entries(errors).forEach(([key, value]) => {
                    if (value) {
                      toast.error(
                        <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
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
