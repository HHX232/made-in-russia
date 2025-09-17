import React, {useState, useEffect, useMemo} from 'react'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {createPriceWithDot} from '@/utils/createPriceWithDot'
import styles from './PurchaseModal.module.scss'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {useTypedSelector} from '@/hooks/useTypedSelector'

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
  prices: DiscountPriceRange[]
  minimumOrderQuantity: number
  onSubmit: (data: {
    name: string
    email: string
    phone: string
    quantity: number
    selectedPrice: DiscountPriceRange
    totalPrice: number
  }) => void
}

const PurchaseModal: React.FC<IPurchaseModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  prices,
  minimumOrderQuantity,
  onSubmit
}) => {
  const {user} = useTypedSelector((state) => state.user)
  // Отладочная информация
  useEffect(() => {
    if (isOpen) {
      console.log('PurchaseModal открыт:', {
        productTitle,
        prices,
        minimumOrderQuantity
      })
    }
  }, [isOpen, productTitle, prices, minimumOrderQuantity])

  const [formData, setFormData] = useState({
    name: user?.login || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    quantity: minimumOrderQuantity.toString()
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    quantity: ''
  })

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
      name: '',
      email: '',
      quantity: ''
    }

    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email'
      isValid = false
    }

    const quantity = parseInt(formData.quantity)
    if (!quantity || quantity < minimumOrderQuantity) {
      newErrors.quantity = `Минимальное количество: ${minimumOrderQuantity}`
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Проверка валидности формы в реальном времени
  const isFormValid = useMemo(() => {
    const quantity = parseInt(formData.quantity)
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      quantity >= minimumOrderQuantity &&
      priceCalculation.selectedPrice
    )
  }, [formData, minimumOrderQuantity, priceCalculation.selectedPrice])

  const handleSubmit = () => {
    if (validateForm() && priceCalculation.selectedPrice) {
      onSubmit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
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

  return (
    <ModalWindowDefault isOpen={isOpen} onClose={onClose} extraClass={styles.purchaseModal}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Оформить заказ</h2>

        <div className={styles.productInfo}>
          <h3 className={styles.productTitle}>{productTitle}</h3>
        </div>

        <div className={styles.formSection}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Имя <span className={styles.required}>*</span>
            </label>
            <TextInputUI
              currentValue={formData.name}
              placeholder='Введите ваше имя'
              onSetValue={(value) => handleInputChange('name', value)}
              theme='superWhite'
              inputType='text'
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <TextInputUI
              currentValue={formData.email}
              placeholder='example@email.com'
              onSetValue={(value) => handleInputChange('email', value)}
              theme='superWhite'
              inputType='email'
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Номер телефона</label>
            <TextInputUI
              currentValue={formData.phone}
              placeholder='+7 (999) 123-45-67'
              onSetValue={(value) => handleInputChange('phone', value)}
              theme='superWhite'
              inputType='text'
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Количество <span className={styles.required}>*</span>
            </label>
            <TextInputUI
              currentValue={formData.quantity}
              placeholder={`Минимум ${minimumOrderQuantity}`}
              onSetValue={(value) => handleInputChange('quantity', value)}
              theme='superWhite'
              inputType='number'
            />
            {errors.quantity && <span className={styles.error}>{errors.quantity}</span>}
          </div>
        </div>

        {priceCalculation.selectedPrice && (
          <div className={styles.priceSection}>
            <div className={styles.priceInfo}>
              <div className={styles.priceRange}>
                Диапазон: {priceCalculation.selectedPrice.from}
                {priceCalculation.selectedPrice.to === 999999 ? '+' : `-${priceCalculation.selectedPrice.to}`}{' '}
                {priceCalculation.selectedPrice.unit}
              </div>

              <div className={styles.unitPrice}>
                <span className={styles.priceLabel}>Цена за единицу:</span>
                <div className={styles.priceValue}>
                  {priceCalculation.hasDiscount && (
                    <span className={styles.originalPrice}>
                      {createPriceWithDot(priceCalculation.selectedPrice.originalPrice.toString())}
                    </span>
                  )}
                  <span className={styles.currentPrice}>
                    {createPriceWithDot(priceCalculation.unitPrice.toString())}
                  </span>
                  <span className={styles.currency}>
                    {priceCalculation.selectedPrice.currency}/{priceCalculation.selectedPrice.unit}
                  </span>
                </div>
              </div>

              <div className={styles.totalPrice}>
                <span className={styles.totalLabel}>Общая сумма:</span>
                <span className={styles.totalValue}>
                  {createPriceWithDot(priceCalculation.totalPrice.toString())} {priceCalculation.selectedPrice.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            Отмена
          </button>
          <button className={styles.submitButton} onClick={handleSubmit} disabled={!isFormValid}>
            Отправить заявку
          </button>
        </div>
      </div>
    </ModalWindowDefault>
  )
}

export default PurchaseModal
