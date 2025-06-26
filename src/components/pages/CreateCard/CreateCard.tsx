/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useState, useEffect} from 'react'
import styles from './CreateCard.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
const vopros = '/vopros.svg'
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
import CardsCatalog from '@/components/screens/Catalog/CardsCatalog/CardsCatalog'
import {Product} from '@/services/products/product.types'
import CreateSimilarProducts from './CreateSimilarProducts/CreateSimilarProducts'
import CreateCardProductCategory from './CreateCardProductCategory/CreateCardProductCategory'
import {getAccessToken} from '@/services/auth/auth.helper'
import {toast} from 'sonner'
import useWindowWidth from '@/hooks/useWindoWidth'

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

const parseQuantityRange = (quantityStr: string): {from: number; to: number | null} => {
  // Удаляем пробелы
  const trimmed = quantityStr.trim()

  // Проверяем различные варианты дефисов
  const separators = ['-', '–', '—', '––']
  let parts: string[] = []

  for (const separator of separators) {
    if (trimmed.includes(separator)) {
      parts = trimmed.split(separator).map((p) => p.trim())
      break
    }
  }

  // Если нашли разделитель и есть две части
  if (parts.length === 2) {
    const from = parseInt(parts[0]) || 0
    const to = parseInt(parts[1]) || 0
    return {from, to}
  }

  // Если разделителя нет, считаем это одним числом
  const singleValue = parseInt(trimmed) || 0
  return {from: singleValue, to: null}
}

// Типы для API
interface PriceData {
  quantityFrom: number
  quantityTo: number
  currency: string
  unit: string
  price: number
  discount: number
}

interface DeliveryMethodDetail {
  name: string
  value: string
}

interface AboutVendorData {
  mainDescription: string
  furtherDescription: string
  mediaAltTexts: string[]
}

interface FaqItem {
  question: string
  answer: string
}

interface Characteristic {
  name: string
  value: string
}

interface PackageOption {
  name: string
  price: number
  priceUnit: string
}

interface CreateProductDto {
  mainDescription: string
  deliveryMethodIds: number[]
  prices: PriceData[]
  minimumOrderQuantity: string
  deliveryMethodDetails: DeliveryMethodDetail[]
  aboutVendor: AboutVendorData
  faq: FaqItem[]
  characteristics: Characteristic[]
  title: string
  furtherDescription: string
  packageOptions: PackageOption[]
  categoryId: number
  discountExpirationDate: string | number
  similarProducts: number[]
  oldProductMedia?: {id: number; position: number}[]
  oldAboutVendorMedia?: {id: number; position: number}[]
}

// Типы для состояния компонентов
// Обновленный тип для поддержки File | string | null
interface CompanyDescriptionData {
  topDescription: string
  images: Array<{
    image: File | string | null // Изменено: добавлена поддержка string
    description: string
  }>
  bottomDescription: string
}

// Интерфейс для ошибок валидации
interface ValidationErrors {
  cardTitle: string
  uploadedFiles: string
  pricesArray: string
  description: string
  descriptionImages: string
  descriptionMatrix: string
  companyData: string
  faqMatrix: string
}

interface CreateCardProps {
  initialData?: ICardFull
}

const CreateCard: FC<CreateCardProps> = ({initialData}) => {
  const [isValidForm, setIsValidForm] = useState(false)
  // const [productCategoryes, setProductCategoryes] = useState<string[]>([])
  const [similarProducts, setSimilarProducts] = useState(new Set<Product>())
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(initialData?.category || null)
  const [selectedDeliveryMethodIds, setSelectedDeliveryMethodIds] = useState<number[]>([1]) // Временные значения
  const [saleDate, setSaleDate] = useState<string>(
    initialData?.daysBeforeDiscountExpires ? initialData.daysBeforeDiscountExpires.toString() : ''
  )
  // useEffect(() => {
  //   console.log('sale date', saleDate)
  //   try {
  //     const days = parseFloat(saleDate.replace(',', '.'))
  //     const newDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  //     console.log('new sale date', newDate)
  //   } catch (error) {
  //     console.error('Error in useEffect:', error)
  //   }
  // }, [saleDate])

  const [packageArray, setPackaginArray] = useState<string[][]>([])

  const handlePackagingMatrixChange = (packagingMatrix: string[][]) => {
    setPackaginArray(packagingMatrix)
  }
  // useEffect(() => {
  //   console.log('initialData', initialData)
  // }, [initialData])

  // Используем универсальный хук для модального окна
  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const indowWidth = useWindowWidth()
  // Состояние для базовых полей
  const [cardTitle, setCardTitle] = useState(initialData?.title || '')
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

  // useEffect(() => {
  //   console.log('pricesArray', pricesArray)
  // }, [pricesArray])

  // Состояние для описаний (CreateDescriptionsElements)
  const [description, setDescription] = useState(initialData?.mainDescription || '# Основное описание')
  const [additionalDescription, setAdditionalDescription] = useState(
    initialData?.furtherDescription || '# Дополнительное описание'
  )
  const [descriptionImages, setDescriptionImages] = useState<ImageMapping[]>([])
  const [descriptionMatrix, setDescriptionMatrix] = useState<string[][]>(
    initialData?.characteristics.map((el) => [el.name, el.value]) || []
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

  // Флаг, показывающий, была ли попытка отправки формы
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Функция валидации отдельного поля
  const validateField = (fieldName: keyof ValidationErrors): string => {
    switch (fieldName) {
      case 'cardTitle':
        if (!cardTitle.trim()) {
          return 'Название товара обязательно для заполнения'
        }
        if (cardTitle.trim().length < 3) {
          return 'Название должно содержать минимум 3 символа'
        }
        return ''

      case 'uploadedFiles':
        // Считаем общее количество изображений (загруженные + оставшиеся начальные)
        const totalImages = uploadedFiles.length + remainingInitialImages.length
        if (totalImages < 3) {
          return `Необходимо минимум 3 изображения (текущее количество: ${totalImages})`
        }
        return ''

      case 'pricesArray':
        if (pricesArray.length === 0) {
          return 'Необходимо добавить хотя бы одну цену'
        }
        // Дополнительная проверка на корректность данных в массиве цен
        const invalidPrices = pricesArray.filter((price) => !price.value || price.value <= 0)
        if (invalidPrices.length > 0) {
          return 'Все цены должны быть больше нуля'
        }
        return ''

      case 'description':
        const cleanDescription = description.replace('# Основное описание', '').trim()
        if (!cleanDescription) {
          return 'Основное описание обязательно для заполнения'
        }
        if (cleanDescription.length < 10) {
          return 'Основное описание должно содержать минимум 10 символов'
        }
        return ''

      case 'descriptionImages':
        // Изображения в описании необязательны
        return ''

      case 'descriptionMatrix':
        const filledRows = descriptionMatrix.filter((row) => row.some((cell) => cell.trim()))
        if (filledRows.length === 0) {
          return 'Необходимо заполнить хотя бы одну строку в таблице характеристик'
        }
        return ''

      case 'companyData':
        if (!companyData.topDescription.trim()) {
          return 'Верхнее описание компании обязательно для заполнения'
        }
        if (!companyData.bottomDescription.trim()) {
          return 'Нижнее описание компании обязательно для заполнения'
        }
        const companyImagesWithContent = companyData.images.filter((img) => img.image !== null)
        if (companyImagesWithContent.length === 0) {
          return 'Необходимо загрузить хотя бы одно изображение компании'
        }
        // Проверка, что у загруженных изображений есть описания
        const imagesWithoutDescription = companyImagesWithContent.filter((img) => !img.description.trim())
        if (imagesWithoutDescription.length > 0) {
          return 'У всех загруженных изображений должны быть описания'
        }
        return ''

      case 'faqMatrix':
        const filledFaqRows = faqMatrix.filter((row) => row[0].trim() || row[1].trim())
        if (filledFaqRows.length === 0) {
          return 'Необходимо добавить хотя бы один вопрос и ответ'
        }
        // Проверка, что если есть вопрос, то есть и ответ
        const incompleteRows = filledFaqRows.filter(
          (row) => (row[0].trim() && !row[1].trim()) || (!row[0].trim() && row[1].trim())
        )
        if (incompleteRows.length > 0) {
          return 'Каждый вопрос должен иметь ответ и наоборот'
        }
        return ''

      default:
        return ''
    }
  }

  // Функция для валидации всех полей
  const validateAllFields = (): boolean => {
    const newErrors: ValidationErrors = {
      cardTitle: validateField('cardTitle'),
      uploadedFiles: validateField('uploadedFiles'),
      pricesArray: validateField('pricesArray'),
      description: validateField('description'),
      descriptionImages: validateField('descriptionImages'),
      descriptionMatrix: validateField('descriptionMatrix'),
      companyData: validateField('companyData'),
      faqMatrix: validateField('faqMatrix')
    }

    setErrors(newErrors)

    // Проверяем, есть ли ошибки
    return !Object.values(newErrors).some((error) => error !== '')
  }

  // Обновляем валидацию при изменении полей
  useEffect(() => {
    if (submitAttempted) {
      const isValid = validateAllFields()
      setIsValidForm(isValid)
    }
  }, [
    cardTitle,
    uploadedFiles,
    remainingInitialImages,
    pricesArray,
    description,
    descriptionImages,
    descriptionMatrix,
    companyData,
    faqMatrix,
    submitAttempted
  ])

  // Обработчики изменений с очисткой ошибок
  const handleCardTitleChange = (value: string) => {
    setCardTitle(value)
    if (errors.cardTitle) {
      setErrors((prev) => ({...prev, cardTitle: ''}))
    }
  }

  const handleUploadedFilesChange = (files: File[]) => {
    setUploadedFiles(files)
    if (errors.uploadedFiles && files.length + remainingInitialImages.length >= 3) {
      setErrors((prev) => ({...prev, uploadedFiles: ''}))
    }
  }

  // Обработчик для обновления оставшихся начальных изображений
  const handleActiveImagesChange = (remainingUrls: string[]) => {
    setRemainingInitialImages(remainingUrls)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePricesArrayChange = (prices: any[]) => {
    // console.log('prices', prices)
    setPricesArray(prices)
    if (errors.pricesArray) {
      setErrors((prev) => ({...prev, pricesArray: ''}))
    }
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    if (errors.description) {
      setErrors((prev) => ({...prev, description: ''}))
    }
  }

  const handleDescriptionImagesChange = (images: ImageMapping[]) => {
    setDescriptionImages(images)
    // Изображения в описании необязательны, поэтому не сбрасываем ошибку
  }

  const handleDescriptionMatrixChange = (matrix: string[][]) => {
    setDescriptionMatrix(matrix)
    if (errors.descriptionMatrix) {
      setErrors((prev) => ({...prev, descriptionMatrix: ''}))
    }
  }

  const handleCompanyDataChange = (data: CompanyDescriptionData) => {
    setCompanyData(data)
    if (errors.companyData) {
      setErrors((prev) => ({...prev, companyData: ''}))
    }
  }

  const handleFaqMatrixChange = (matrix: string[][]) => {
    setFaqMatrix(matrix)
    if (errors.faqMatrix) {
      setErrors((prev) => ({...prev, faqMatrix: ''}))
    }
  }

  // Альтернативный метод отправки через fetch
  const handleSubmitAlternative = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)

    const isValid = validateAllFields()

    if (!isValid) {
      const firstErrorField = Object.entries(errors).find(([_, error]) => error !== '')
      if (firstErrorField) {
        toast.error(
          <div style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>Ошибка валидации</strong>
            <span>{firstErrorField[1]}</span>
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
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>Ошибка</strong>
          <span>Пожалуйста, выберите категорию товара</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
      return
    }

    try {
      // Подготовка данных для отправки
      const data: CreateProductDto = {
        title: cardTitle,
        mainDescription: description.replace('# Основное описание', '').trim(),
        furtherDescription: additionalDescription.replace('# Дополнительное описание', '').trim(),
        deliveryMethodIds: selectedDeliveryMethodIds,
        prices: pricesArray.map((price, index) => {
          // Парсим диапазон количества
          const quantityRange = parseQuantityRange(price.quantity)

          // Определяем quantityTo
          let quantityTo: number
          if (quantityRange.to !== null) {
            // Если указан диапазон через дефис
            quantityTo = quantityRange.to
          } else if (index < pricesArray.length - 1) {
            // Если это не последний элемент, берем from следующего минус 1
            const nextQuantityRange = parseQuantityRange(pricesArray[index + 1].quantity)
            quantityTo = nextQuantityRange.from - 1
          } else {
            // Для последнего элемента
            quantityTo = 999999
          }

          const originalPrice = parseFloat(price.priceWithoutDiscount) || 0
          const discountedPrice = parseFloat(price.priceWithDiscount) || 0
          const discountPercent =
            originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0

          return {
            quantityFrom: quantityRange.from,
            quantityTo: quantityTo,
            currency: price.currency || 'RUB',
            unit: price.unit || 'шт',
            price: originalPrice,
            discount: discountPercent
          }
        }),
        minimumOrderQuantity:
          pricesArray.length > 0 ? parseQuantityRange(pricesArray[0].quantity).from.toString() : '1',
        deliveryMethodDetails: descriptionMatrix
          .filter((row) => row[0] && row[1])
          .map((row) => ({
            name: row[0],
            value: row[1]
          })),
        aboutVendor: {
          mainDescription: companyData.topDescription,
          furtherDescription: companyData.bottomDescription,
          mediaAltTexts: companyData.images.filter((img) => img.image !== null).map((img) => img.description)
        },
        faq: faqMatrix
          .filter((row) => row[0] && row[1])
          .map((row) => ({
            question: row[0],
            answer: row[1]
          })),
        characteristics: descriptionMatrix
          .filter((row) => row[0] && row[1])
          .map((row) => ({
            name: row[0],
            value: row[1]
          })),
        packageOptions: packageArray
          .filter((item) => item[0] && item[1])
          .map((item) => ({
            name: item[0],
            price: parseFloat(item[1]) || 0,
            priceUnit: pricesArray[0]?.unit || 'RUB'
          })),
        categoryId: selectedCategory.id,
        // Обработка saleDate - если это число дней
        discountExpirationDate: saleDate ? (!isNaN(parseInt(saleDate)) ? parseInt(saleDate) : 30) : 0,
        similarProducts: Array.from(similarProducts).map((product) => product.id)
      }
      const isUpdate = !!initialData?.id
      // Добавляем oldProductMedia только если есть оставшиеся изображения
      if (objectRemainingInitialImages.length > 0 && isUpdate) {
        data.oldProductMedia = objectRemainingInitialImages
        if (companyDataImages.length === 0 && isUpdate) {
          data.oldAboutVendorMedia = []
        }
      }

      // Добавляем oldAboutVendorMedia только если есть оставшиеся изображения компании
      if (companyDataImages.length > 0 && isUpdate) {
        data.oldAboutVendorMedia = companyDataImages
        if (objectRemainingInitialImages.length === 0 && isUpdate) {
          data.oldAboutVendorMedia = []
        }
      }

      const formData = new FormData()

      // Создаем Blob для JSON
      const jsonBlob = new Blob([JSON.stringify(data)], {type: 'application/json'})
      formData.append('data', jsonBlob)

      // Добавляем только файлы для productMedia
      uploadedFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append('productMedia', file)
        }
      })

      // Добавляем только файлы для aboutVendorMedia
      companyData.images.forEach((item) => {
        if (item.image && item.image instanceof File) {
          formData.append('aboutVendorMedia', item.image)
        }
      })

      const token = await getAccessToken()

      // Определяем метод и URL в зависимости от наличия initialData

      const method = isUpdate ? 'PUT' : 'POST'
      const url = isUpdate
        ? `https://exporteru-prorumble.amvera.io/api/v1/products/${initialData.id}`
        : 'https://exporteru-prorumble.amvera.io/api/v1/products'

      // Показываем toast о процессе отправки
      const loadingToast = toast.loading(isUpdate ? 'Обновление товара...' : 'Сохранение товара...')

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
          // Не указываем Content-Type для FormData
        },
        body: formData
      })

      const responseText = await response.text()
      // console.log('Response status:', response.status)
      // console.log('Response text:', responseText)

      // Убираем loading toast
      toast.dismiss(loadingToast)

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = {message: responseText}
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Успешное создание/обновление
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>Поздравляем!</strong>
          <span>Товар успешно {isUpdate ? 'обновлен' : 'создан'}!</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          },
          duration: 5000
        }
      )

      // Редирект или очистка формы
      // router.push('/products')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Ошибка при сохранении:', error)

      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>Ошибка сохранения</strong>
          <span>{error.message || 'Произошла ошибка при сохранении товара'}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          },
          duration: 5000
        }
      )
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
          <h1 className={`${styles.create__title}`}>Создание товара</h1>
          <form onSubmit={handleSubmitAlternative} className={`${styles.create__form}`}>
            {/* Поле "Название" */}
            <span className={`${styles.create__input__box__span}`}>
              <div className={`${styles.label__title__box}`}>
                <label className={`${styles.create__label__title}`} htmlFor='title'>
                  Название
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
                      alt='Помощь по названию'
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
                placeholder='Название'
                currentValue={cardTitle}
                onSetValue={handleCardTitleChange}
                theme='superWhite'
              />
            </span>

            <div className={`${styles.create__input__box__span__category}`}>
              <div className={`${styles.label__title__box}`}>
                <p className={`${styles.create__label__title}`}>Категория товара</p>
              </div>
              <CreateCardProductCategory
                initialProductCategory={initialData?.category}
                onSetCategory={(category) => setSelectedCategory(category)}
              />
            </div>
            {/* Поле "Изображения товара" */}
            <div className={`${styles.create__input__box__span} ${styles.create__input__box__span__images}`}>
              <div className={`${styles.label__title__box}`}>
                <p className={`${styles.create__label__title}`}>Изображения товара</p>
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
                      alt='Помощь по изображениям товара'
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
              <h3 className={`${styles.create__similar__products__box__title}`}>Похожие товары</h3>
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
                    alt='Помощь по изображениям товара'
                    width={300}
                    height={300}
                    key={1}
                    onClick={() => openModal(HELP_IMAGES.similarProducts)}
                  />
                ]}
              />
            </div>

            {/* <CreateProductForm /> */}
            <CreateSimilarProducts
              // initialProducts={initialData?.similarProducts}
              onUpdateProductsSet={setSimilarProducts}
            />
            {/* CreateCardPriceElements */}
            <CreateCardPriceElements
              inputType={['text', 'number', 'number', 'text', 'text']}
              minimalValue={initialData?.minimumOrderQuantity + ' ' + initialData?.prices[0]?.unit}
              saleDateInitial={initialData?.daysBeforeDiscountExpires?.toString() || ''}
              initialDelieveryMatrix={initialData?.deliveryMethodsDetails?.map((el) => [el.name, el.value])}
              initialPackagingMatrix={initialData?.packagingOptions?.map((el) => [el.name, el.price.toString()])}
              pricesArray={pricesArray.map((item) => [
                item.quantity,
                item.priceWithoutDiscount,
                item.priceWithDiscount,
                item.currency,
                item.unit
              ])}
              descriptionArray={descriptionMatrix}
              onSetDescriptionArray={handleDescriptionMatrixChange}
              onSetPricesArray={handlePricesArrayChange}
              onSetPackagingMatrix={handlePackagingMatrixChange}
              onSetSaleDate={setSaleDate}
              pricesError={errors.pricesArray}
              descriptionMatrixError={errors.descriptionMatrix}
            />

            {/* Big descriptions - предполагаем, что внутри компонента есть свои подсказки */}
            <CreateDescriptionsElements
              initialDescr={description}
              initialAdditionalDescr={additionalDescription}
              onSetDescr={handleDescriptionChange}
              onSetAdditionalDescr={setAdditionalDescription}
              onImagesChange={handleDescriptionImagesChange}
              descriptionError={errors.description}
              imagesError={errors.descriptionImages}
            />

            {/* CreateCompanyDescription */}
            <CreateCompanyDescription
              data={companyData}
              onChange={handleCompanyDataChange}
              // error={errors.companyData}
            />

            {/* CreateFaqCard */}
            <CreateFaqCard values={faqMatrix} onChange={handleFaqMatrixChange} />

            <div className={`${styles.button__box}`}>
              <button
                style={{
                  opacity: submitAttempted && !isValidForm ? 0.7 : 1,
                  cursor: submitAttempted && !isValidForm ? 'not-allowed' : 'pointer'
                }}
                className={`${styles.create____submit__button}`}
                type='submit'
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  )
}

export default CreateCard
