import React, {useState, useEffect, useMemo} from 'react'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import styles from './PurchaseModal.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useTranslations} from 'next-intl'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import Image from 'next/image'

interface DiscountPriceRange {
  from: number
  to: number
  originalPrice: number
  discountedPrice: number
  currency: string
  unit: string
}

interface IPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  productImageUrl: string
  prices: DiscountPriceRange[]
  minimumOrderQuantity: number
  useAbsoluteClose?: boolean
  onSubmit: (data: {
    firstName: string
    // phoneNumber: string
    comment: string
    quantity: number
    selectedPrice: DiscountPriceRange
    totalPrice: number
  }) => void
}

const PurchaseModal: React.FC<IPurchaseModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  productImageUrl,
  prices,
  minimumOrderQuantity,
  onSubmit,
  useAbsoluteClose = false
}) => {
  const {user} = useTypedSelector((state) => state.user)
  const t = useTranslations('CardPage.PurchaseModal')
  const t2 = useTranslations('ReviewsToNumber')

  // Проверяем, является ли цена "По запросу"
  const isNullPrice = prices[0]?.currency?.toLocaleLowerCase() === 'no_currency'

  // Функция для очистки дублирующихся кодов стран
  const cleanPhoneNumber = (phone: string): string => {
    if (!phone) return ''

    const countryCodes = ['+375', '+7', '+86']

    // Удаляем пробелы и тире
    let clean = phone.replace(/[\s-]/g, '')

    // Если пользователь ввёл без +, но с кодом страны — добавляем +
    for (const code of countryCodes) {
      const noPlus = code.slice(1) // 375, 7, 86
      if (clean.startsWith(noPlus)) {
        clean = '+' + clean
        break
      }
    }

    // После нормализации проверяем дублирование
    for (const code of countryCodes) {
      const digits = code.slice(1) // например '375'
      if (clean.startsWith(code)) {
        // Если дальше идут такие же цифры → удаляем повторение
        if (clean.slice(code.length, code.length + digits.length) === digits) {
          clean = code + clean.slice(code.length + digits.length)
        }
      }
    }

    return clean
  }

  // Отладочная информация
  useEffect(() => {
    if (isOpen) {
      console.log('PurchaseModal открыт:', {
        user,
        phoneNumber: user?.phoneNumber,
        productTitle,
        productImageUrl,
        prices,
        minimumOrderQuantity
      })
    }
  }, [isOpen, productTitle, productImageUrl, prices, minimumOrderQuantity, user])

  const [formData, setFormData] = useState({
    firstName: user?.login || '',
    phoneNumber: cleanPhoneNumber(user?.phoneNumber || ''),
    comment: '',
    quantity: minimumOrderQuantity.toString()
  })

  const [errors, setErrors] = useState({
    firstName: '',
    // phoneNumber: '',
    quantity: ''
  })

  const [touched, setTouched] = useState({
    firstName: false,
    phoneNumber: false,
    quantity: false
  })

  // Обновление данных формы при изменении данных пользователя или открытии модального окна
  useEffect(() => {
    if (isOpen && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.login || prev.firstName,
        phoneNumber: cleanPhoneNumber(user.phoneNumber || prev.phoneNumber)
      }))
    }
  }, [isOpen, user])

  // Функция для определения подходящей цены на основе количества
  const getApplicablePrice = (quantity: number): DiscountPriceRange | null => {
    if (!prices || prices.length === 0) return null

    const sortedPrices = [...prices].sort((a, b) => a.from - b.from)

    for (const price of sortedPrices) {
      // Проверяем, попадает ли количество в диапазон
      // to может быть 999999 для обозначения "и более"
      if (quantity >= price.from && (price.to === 999999 || quantity <= price.to)) {
        return price
      }
    }

    // Если количество больше максимального диапазона, возвращаем последний диапазон
    const lastPrice = sortedPrices[sortedPrices.length - 1]
    if (quantity >= lastPrice.from) {
      return lastPrice
    }

    return sortedPrices[0] // Возвращаем первый диапазон как fallback
  }

  // Расчет цены и общей суммы
  const priceCalculation = useMemo(() => {
    const quantity = parseInt(formData.quantity) || 0
    const applicablePrice = getApplicablePrice(quantity)

    if (!applicablePrice) {
      return {
        selectedPrice: null,
        unitPrice: 0,
        totalPrice: 0,
        hasDiscount: false
      }
    }

    const unitPrice = applicablePrice.discountedPrice
    const totalPrice = unitPrice * quantity
    const hasDiscount = applicablePrice.originalPrice !== applicablePrice.discountedPrice

    return {
      selectedPrice: applicablePrice,
      unitPrice,
      totalPrice,
      hasDiscount
    }
  }, [formData.quantity, prices])

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      phoneNumber: '',
      quantity: ''
    }

    let isValid = true

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('errors.firstNameRequired')
      isValid = false
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('errors.phoneRequired')
      isValid = false
    }

    const quantity = parseInt(formData.quantity)
    if (!quantity || quantity < minimumOrderQuantity) {
      newErrors.quantity = t('errors.quantityMinimum', {minimum: minimumOrderQuantity})
      isValid = false
    }

    setErrors(newErrors)
    setTouched({
      firstName: true,
      phoneNumber: true,
      quantity: true
    })

    return isValid
  }

  const handleSubmit = () => {
    if (validateForm() && priceCalculation.selectedPrice) {
      onSubmit({
        firstName: formData.firstName,
        // phoneNumber: formData.phoneNumber,
        comment: formData.comment,
        quantity: parseInt(formData.quantity),
        selectedPrice: priceCalculation.selectedPrice,
        totalPrice: priceCalculation.totalPrice
      })
      onClose()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}))

    // Очистить ошибку при изменении поля
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({...prev, [field]: ''}))
    }
  }

  const handleInputBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({...prev, [field]: true}))
  }

  // Функция для получения текста ошибки для поля
  const getFieldError = (field: keyof typeof errors) => {
    return touched[field] && errors[field] ? errors[field] : ''
  }

  return (
    <ModalWindowDefault
      isOpen={isOpen}
      onClose={onClose}
      extraClass={styles.purchaseModal}
      useAbsoluteClose={useAbsoluteClose}
    >
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{t('title')}</h2>

        <div className={styles.productInfo}>
          <Image width={600} height={600} src={productImageUrl} alt={productTitle} className={styles.productImage} />
          <h3 className={styles.productTitle}>{productTitle}</h3>
        </div>

        <div className={styles.formSection}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {t('fields.firstName')} <span className={styles.required}>*</span>
            </label>
            <TextInputUI
              currentValue={formData.firstName}
              placeholder={t('placeholders.firstName')}
              onSetValue={(value) => handleInputChange('firstName', value)}
              onBlur={() => handleInputBlur('firstName')}
              theme='newWhite'
              inputType='text'
              errorValue={getFieldError('firstName')}
            />
          </div>

          {/* <div className={styles.inputGroup}>
            <label className={styles.label}>
              {t('fields.phoneNumber')} <span className={styles.required}>*</span>
            </label>
            <TextInputUI
              currentValue={formData.phoneNumber}
              placeholder={t('placeholders.phoneNumber')}
              onSetValue={(value) => handleInputChange('phoneNumber', value)}
              onBlur={() => handleInputBlur('phoneNumber')}
              theme='newWhite'
              inputType='text'
              errorValue={getFieldError('phoneNumber')}
            />
          </div> */}

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('fields.comment')}</label>
            <TextAreaUI
              currentValue={formData.comment}
              placeholder={t('placeholders.comment')}
              onSetValue={(value) => handleInputChange('comment', value)}
              theme='newWhite'
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {t('fields.quantity')} <span className={styles.required}>*</span>
            </label>
            <TextInputUI
              currentValue={formData.quantity}
              placeholder={t('placeholders.quantity', {minimum: minimumOrderQuantity})}
              onSetValue={(value) => handleInputChange('quantity', value)}
              onBlur={() => handleInputBlur('quantity')}
              theme='newWhite'
              inputType='number'
              errorValue={getFieldError('quantity')}
            />
          </div>
        </div>

        {priceCalculation.selectedPrice && (
          <div className={styles.priceSection}>
            <div className={styles.priceInfo}>
              {/* Показываем диапазон только если from !== to */}
              {priceCalculation.selectedPrice.from !== priceCalculation.selectedPrice.to && (
                <div className={styles.priceRange}>
                  {t('priceInfo.range')}: {priceCalculation.selectedPrice.from}
                  {!isNullPrice && priceCalculation.selectedPrice.to === 999999
                    ? '+'
                    : `-${priceCalculation.selectedPrice.to}`}{' '}
                  {isNullPrice && t2('priceOnRequest')}
                  {priceCalculation.selectedPrice.unit}
                </div>
              )}

              <div className={styles.unitPrice}>
                <span className={styles.priceLabel}>{t('priceInfo.unitPrice')}:</span>
                <div className={styles.priceValue}>
                  {priceCalculation.hasDiscount && (
                    <span className={styles.originalPrice}>
                      {!isNullPrice && priceCalculation.selectedPrice.originalPrice.toString()}
                      {isNullPrice && t2('priceOnRequest')}
                    </span>
                  )}
                  <span className={styles.currentPrice}>
                    {!isNullPrice && priceCalculation.unitPrice.toString()}
                    {isNullPrice && t2('priceOnRequest')}
                  </span>
                  <span className={styles.currency}>
                    {!isNullPrice && priceCalculation.selectedPrice.currency}/{priceCalculation.selectedPrice.unit}
                  </span>
                </div>
              </div>

              <div className={styles.totalPrice}>
                <span className={styles.totalLabel}>{t('priceInfo.totalPrice')}:</span>
                <span className={styles.totalValue}>
                  {!isNullPrice && priceCalculation.totalPrice.toString()} {isNullPrice && t2('priceOnRequest')}
                  {!isNullPrice && priceCalculation.selectedPrice.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            {t('buttons.cancel')}
          </button>
          <button className={styles.submitButton} onClick={handleSubmit}>
            {t('buttons.submit')}
          </button>
        </div>
      </div>
    </ModalWindowDefault>
  )
}

export default PurchaseModal
