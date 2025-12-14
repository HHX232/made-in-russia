'use client'
import {FC, useEffect, useState} from 'react'
import styles from './CreateSimilarProducts.module.scss'
import CardsCatalog from '@/components/screens/Catalog/CardsCatalog/CardsCatalog'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {Product} from '@/services/products/product.types'
import Card from '@/components/UI-kit/elements/card/card'

interface CreateSimilarProductsProps {
  /**
   * Начальный набор продуктов для отображения
   */
  initialProducts?: Set<Product> | Product[]
  /**
   * Колбэк для обновления родительского компонента при изменении набора продуктов
   */
  onUpdateProductsSet?: (products: Set<Product>) => void
  /**
   * Максимальное количество продуктов, которое можно выбрать
   * @default 10
   */
  maxProducts?: number
  /**
   * Возможность отключить добавление новых продуктов
   * @default false
   */
  disabled?: boolean
  /**
   * Кастомный текст на кнопке удаления
   * @default 'Убрать'
   */
  removeButtonText?: string
  /**
   * Показывать ли кнопку добавления продукта
   * @default true
   */
  showAddButton?: boolean
}

const CreateSimilarProducts: FC<CreateSimilarProductsProps> = ({
  initialProducts,
  onUpdateProductsSet,
  maxProducts = 10,
  disabled = false,
  removeButtonText = 'Убрать',
  showAddButton = true
}) => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [activeProductsFromModal, setActiveProductsFromModal] = useState<Set<Product>>(() => {
    if (!initialProducts) return new Set<Product>()

    // Если передан массив, конвертируем в Set
    if (Array.isArray(initialProducts)) {
      return new Set(initialProducts)
    }

    // Если уже Set, создаем новый Set из переданного
    return new Set(initialProducts)
  })

  // Обновляем внутреннее состояние при изменении initialProducts
  useEffect(() => {
    if (initialProducts) {
      const newSet = Array.isArray(initialProducts) ? new Set(initialProducts) : new Set(initialProducts)
      setActiveProductsFromModal(newSet)
    }
  }, [initialProducts])

  // Уведомляем родительский компонент об изменениях
  useEffect(() => {
    onUpdateProductsSet?.(activeProductsFromModal)
  }, [activeProductsFromModal, onUpdateProductsSet])

  useEffect(() => {
    console.log('activeProductsFromModal', activeProductsFromModal)
  }, [activeProductsFromModal])

  const addProduct = (item: Product) => {
    if (disabled) return

    setActiveProductsFromModal((prev) => {
      // Проверяем, не превышен ли лимит
      if (prev.size >= maxProducts) {
        console.warn(`Максимальное количество продуктов: ${maxProducts}`)
        return prev
      }

      // Проверяем, не добавлен ли уже этот продукт
      const exists = Array.from(prev).some((product) => product.id === item.id)
      if (exists) {
        return prev
      }

      return new Set([...prev, item])
    })
  }

  const removeProduct = (productToRemove: Product) => {
    if (disabled) return

    setActiveProductsFromModal((prev) => {
      const newSet = new Set(prev)
      for (const product of newSet) {
        if (product.id === productToRemove.id) {
          newSet.delete(product)
          break
        }
      }
      return newSet
    })
  }

  const handleOpenCatalog = () => {
    if (disabled || activeProductsFromModal.size >= maxProducts) return
    setIsCatalogOpen(true)
  }

  const canAddMore = activeProductsFromModal.size < maxProducts && !disabled
  const showPlusButton = showAddButton && canAddMore

  return (
    <div className={styles.create__similar__products__box}>
      <ModalWindowDefault
        extraClass={styles.drop__extra__modal__catalog}
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      >
        <CardsCatalog
          onPreventCardClick={addProduct}
          canCreateNewProduct={false}
          specialRoute={'/me/products-summary'}
        />
      </ModalWindowDefault>

      <ul id='cy-create-similar-products-list' className={`${styles.list__items}`}>
        {showPlusButton && (
          <li
            id='cy-create-similar-products-plus-button'
            onClick={handleOpenCatalog}
            className={`${styles.cardsCatalog__create} ${disabled ? styles.disabled : ''}`}
          >
            <div className={`${styles.cardsCatalog__create__image}`}>+</div>
            <div className={`${styles.cardsCatalog__create__text}`}></div>
            <div className={`${styles.cardsCatalog__create__text}`}></div>
            <div className={`${styles.cardsCatalog__create__button}`}></div>
          </li>
        )}

        {Array.from(activeProductsFromModal).map((product) => (
          <Card
            specialButtonText={removeButtonText}
            key={product.id}
            isLoading={false}
            id={product.id}
            onPreventCardClick={() => removeProduct(product)}
            title={product.title}
            price={product.originalPrice}
            discount={product.discount}
            previewImageUrl={product.previewImageUrl}
            discountedPrice={product.discountedPrice}
            deliveryMethod={product.deliveryMethod}
            fullProduct={product}
          />
        ))}
      </ul>
    </div>
  )
}

export default CreateSimilarProducts
