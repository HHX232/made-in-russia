/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {useState, useEffect, memo} from 'react'
import styles from './CreateCardPriceElements.module.scss'
import RowsInputs from '@/components/UI-kit/RowsInputs/RowsInputs'
import Image from 'next/image'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {HELP_IMAGES} from '../../CreateCard'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {Language} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'

const vopros = '/vopros.svg'

type TInputType = 'text' | 'number' | 'password' | 'dropdown'

interface CreateCardPriceElementsProps {
  pricesArray?: string[][]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSetPricesArray: (pricesArray: any[]) => void
  pricesError?: string
  inputType?: TInputType[]
  currentLanguage: Language
  dropdownPricesOptions?: string[][]
  canCreateNewOption?: boolean[]
  extra__rows__grid?: string
  charMatrixError?: string
  minVolumeError?: string
}

const CreateCardPriceElements = memo<CreateCardPriceElementsProps>(
  ({
    pricesArray,
    onSetPricesArray,
    pricesError = '',
    inputType,
    currentLanguage,
    dropdownPricesOptions = [],
    canCreateNewOption = [],
    extra__rows__grid,
    minVolumeError = '',
    charMatrixError
  }) => {
    const {
      updateCharacteristic,
      setCharacteristics,
      addCharacteristic,
      removeCharacteristic,
      updateDelivery,
      setDelivery,
      addDelivery,
      removeDelivery,
      updatePackaging,
      setPackaging,
      addPackaging,
      removePackaging,
      updatePriceInfo,
      setError,
      clearErrors,
      setCurrentLanguage
    } = useActions()

    const currentData = useTypedSelector((state) => state.multiLanguageCardPriceData[currentLanguage])
    const currentErrors = useTypedSelector((state) => state.multiLanguageCardPriceData.errors[currentLanguage])
    const storeCurrentLanguage = useTypedSelector((state) => state.multiLanguageCardPriceData.currentLanguage)

    // Функция для определения начального значения цены со скидкой
    const getInitialDiscountPrice = () => {
      if (pricesArray && pricesArray.length > 0) {
        const originalPrice = pricesArray[0][1]
        const discountPriceFromArray = pricesArray[0][2]

        // Если цены равны, возвращаем пустую строку
        if (originalPrice === discountPriceFromArray) {
          return ''
        }
        return discountPriceFromArray || ''
      }
      return ''
    }

    // Состояние для цены со скидкой (отдельный инпут)
    const [discountPrice, setDiscountPrice] = useState(getInitialDiscountPrice())

    // Локальное состояние для списка цен (БЕЗ quantity - только price, currency, unit)
    const [pricesMatrix, setPricesMatrix] = useState<string[][]>(
      (pricesArray || []).map((row) => {
        // Берем только индексы 1, 3, 4 (priceWithoutDiscount, currency, unit)
        return [row[1], row[3], row[4]]
      })
    )

    const [characteristicsKey, setCharacteristicsKey] = useState(0)
    const [deliveryKey, setDeliveryKey] = useState(0)
    const [packagingKey, setPackagingKey] = useState(0)
    const [isInitialized, setIsInitialized] = useState(false)

    const t = useTranslations('CreateCardPriceElementsText')

    // Инициализация цены со скидкой и срока акции при монтировании
    useEffect(() => {
      if (!isInitialized && pricesArray && pricesArray.length > 0) {
        const originalPrice = pricesArray[0][1]
        const discountPriceFromArray = pricesArray[0][2]

        // Если цены равны, очищаем цену со скидкой и срок акции
        if (originalPrice === discountPriceFromArray) {
          setDiscountPrice('')
          // Очищаем срок акции в store
          updatePriceInfo({
            language: currentLanguage,
            field: 'daysBeforeSale',
            value: ''
          })
        } else {
          setDiscountPrice(discountPriceFromArray || '')
        }

        setIsInitialized(true)
      }
    }, [pricesArray, isInitialized, currentLanguage, updatePriceInfo])

    const prepareDropdownOptions = () => {
      if (!inputType || dropdownPricesOptions.length === 0) {
        return []
      }

      const result: string[][] = []
      let dropdownIndex = 0

      // Корректируем для нового набора inputType (только 3 поля: price, currency, unit)
      const adjustedInputType = [inputType[1], inputType[3], inputType[4]] // берем индексы для price, currency, unit

      adjustedInputType.forEach((type, index) => {
        if (type === 'dropdown') {
          if (dropdownIndex < dropdownPricesOptions.length) {
            result[index] = dropdownPricesOptions[dropdownIndex]
            dropdownIndex++
          } else {
            result[index] = []
          }
        } else {
          result[index] = []
        }
      })

      return result
    }

    const prepareCanCreateNewOption = () => {
      if (!inputType || canCreateNewOption.length === 0) {
        return []
      }

      const result: boolean[] = []
      let dropdownIndex = 0

      const adjustedInputType = [inputType[1], inputType[3], inputType[4]]

      adjustedInputType.forEach((type, index) => {
        if (type === 'dropdown') {
          if (dropdownIndex < canCreateNewOption.length) {
            result[index] = canCreateNewOption[dropdownIndex]
            dropdownIndex++
          } else {
            result[index] = false
          }
        } else {
          result[index] = false
        }
      })

      return result
    }

    useEffect(() => {
      if (currentLanguage !== storeCurrentLanguage) {
        setCurrentLanguage(currentLanguage)
      }
    }, [currentLanguage, storeCurrentLanguage, setCurrentLanguage])

    useEffect(() => {
      setCharacteristicsKey((prev) => prev + 1)
      setDeliveryKey((prev) => prev + 1)
      setPackagingKey((prev) => prev + 1)
    }, [currentLanguage])

    // Обработчик для матрицы цен (теперь с 3 колонками: price, currency, unit)
    const handlePriceSetValue = (rowIndex: number, inputIndex: number, value: string) => {
      const newMatrix = [...pricesMatrix]

      if (!newMatrix[rowIndex]) {
        newMatrix[rowIndex] = new Array(3).fill('')
      }

      newMatrix[rowIndex][inputIndex] = value
      setPricesMatrix(newMatrix)

      // Преобразуем в формат для родительского компонента, ВСЕГДА добавляя quantity: '1'
      const formattedPrices = newMatrix
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => ({
          quantity: '1', // ВСЕГДА единица
          priceWithoutDiscount: row[0] || '',
          priceWithDiscount: discountPrice || '',
          currency: row[1] || '',
          unit: row[2] || '',
          value: parseFloat(discountPrice || row[0] || '0')
        }))

      onSetPricesArray(formattedPrices)
    }

    const handlePriceRowsChange = (newRows: string[][]) => {
      setPricesMatrix(newRows)

      const formattedPrices = newRows
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => ({
          quantity: '1', // ВСЕГДА единица
          priceWithoutDiscount: row[0] || '',
          priceWithDiscount: discountPrice || '',
          currency: row[1] || '',
          unit: row[2] || '',
          value: parseFloat(discountPrice || row[0] || '0')
        }))

      onSetPricesArray(formattedPrices)
    }

    // Обработчик для отдельного инпута цены со скидкой
    const handleDiscountPriceChange = (value: string) => {
      setDiscountPrice(value)

      // Обновляем родительский компонент
      const formattedPrices = pricesMatrix
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => ({
          quantity: '1', // ВСЕГДА единица
          priceWithoutDiscount: row[0] || '',
          priceWithDiscount: value || '',
          currency: row[1] || '',
          unit: row[2] || '',
          value: parseFloat(value || row[0] || '0')
        }))

      onSetPricesArray(formattedPrices)
    }

    const handleCharacteristicSetValue = (rowIndex: number, inputIndex: number, value: string) => {
      const field = inputIndex === 0 ? 'title' : 'characteristic'
      updateCharacteristic({
        language: currentLanguage,
        index: rowIndex,
        field: field as 'title' | 'characteristic',
        value
      })
    }

    const handleCharacteristicRowsChange = (newRows: string[][]) => {
      const characteristics = newRows.map((row) => ({
        title: row[0] || '',
        characteristic: row[1] || ''
      }))
      setCharacteristics({
        language: currentLanguage,
        characteristics
      })
    }

    const handleDeliverySetValue = (rowIndex: number, inputIndex: number, value: string) => {
      updateDelivery({
        language: currentLanguage,
        index: rowIndex,
        field: 'title',
        value
      })
    }

    const handleDeliveryRowsChange = (newRows: string[][]) => {
      const delivery = newRows.map((row) => ({
        title: row[0] || '',
        daysDelivery: '100'
      }))
      setDelivery({
        language: currentLanguage,
        delivery
      })
    }

    const handlePackagingSetValue = (rowIndex: number, inputIndex: number, value: string) => {
      const field = inputIndex === 0 ? 'title' : 'price'
      updatePackaging({
        language: currentLanguage,
        index: rowIndex,
        field: field as 'title' | 'price',
        value
      })
    }

    const handlePackagingRowsChange = (newRows: string[][]) => {
      const packaging = newRows.map((row) => ({
        title: row[0] || '',
        price: row[1] || ''
      }))
      setPackaging({
        language: currentLanguage,
        packaging
      })
    }

    const validateSaleDate = (value: string) => {
      if (!value.trim()) {
        setError({
          language: currentLanguage,
          errorType: 'saleDateError',
          error: t('daysBeforeSale')
        })
        return false
      }
      const days = parseInt(value)
      if (isNaN(days) || days <= 0) {
        setError({
          language: currentLanguage,
          errorType: 'saleDateError',
          error: t('daysBeforeSaleNotMinus')
        })
        return false
      }
      setError({
        language: currentLanguage,
        errorType: 'saleDateError',
        error: ''
      })
      return true
    }

    const validateMinVolume = (value: string) => {
      if (!value.trim()) {
        setError({
          language: currentLanguage,
          errorType: 'minVolumeError',
          error: t('minimalVolume')
        })
        return false
      }
      setError({
        language: currentLanguage,
        errorType: 'minVolumeError',
        error: ''
      })
      return true
    }

    const handleSaleDateChange = (value: string) => {
      updatePriceInfo({
        language: currentLanguage,
        field: 'daysBeforeSale',
        value
      })
      if (currentErrors.saleDateError) {
        validateSaleDate(value)
      }
    }

    const handleMinVolumeChange = (value: string) => {
      updatePriceInfo({
        language: currentLanguage,
        field: 'minimalVolume',
        value
      })
      if (currentErrors.minVolumeError) {
        validateMinVolume(value)
      }
    }

    useEffect(() => {
      if (pricesArray && JSON.stringify(pricesArray) !== JSON.stringify(pricesMatrix)) {
        // Преобразуем с учетом новой структуры (без quantity, берем только price, currency, unit)
        const newMatrix = pricesArray.map((row) => [row[1], row[3], row[4]])
        setPricesMatrix(newMatrix)

        // Проверяем, равны ли цены, и обновляем discountPrice и daysBeforeSale
        if (pricesArray.length > 0) {
          const originalPrice = pricesArray[0][1]
          const discountPriceFromArray = pricesArray[0][2]

          if (originalPrice === discountPriceFromArray) {
            setDiscountPrice('')
            // Также очищаем срок акции
            updatePriceInfo({
              language: currentLanguage,
              field: 'daysBeforeSale',
              value: ''
            })
          } else {
            setDiscountPrice(discountPriceFromArray || '')
          }
        }
      }
    }, [pricesArray, currentLanguage, updatePriceInfo])

    const characteristicsMatrix = currentData.characteristics.map((item) => [item.title, item.characteristic])
    const deliveryMatrix = currentData.delivery.map((item) => [item.title])
    const packagingMatrix = currentData.packaging.map((item) => [item.title, item.price])

    const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
    const windowWidth = useWindowWidth()

    useEffect(() => {
      console.log('currentData', currentData)
    }, [currentData])

    const preparedDropdownOptions = prepareDropdownOptions()
    const preparedCanCreateNewOption = prepareCanCreateNewOption()

    // Корректируем inputType для 3 полей: price, currency, unit
    const adjustedInputType: TInputType[] | undefined = inputType
      ? [inputType[1], inputType[3], inputType[4]]
      : undefined

    return (
      <div className={styles.create__prices__box}>
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
        <div className={styles.rows__inputs__box}>
          <div className={styles.rows__inputs__box__inner}>
            <div style={{zIndex: '66666666'}} className={`${styles.create__label__title__box}`}>
              <p className={`${styles.create__label__title}`}>{t('pricesList')}</p>
              {HELP_IMAGES.prices.length !== 0 && (
                <Image
                  onClick={() => openModal(HELP_IMAGES.prices)}
                  src={vopros}
                  style={{cursor: 'pointer'}}
                  alt='vopros'
                  width={27}
                  height={27}
                />
              )}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', width: '100%', gap: '20px'}}>
              <RowsInputs
                useNewTheme
                inputsInRowCount={3}
                maxRows={1}
                extra__rows__grid={styles.extra__rows__grid}
                extraButtonPlusClass={styles.extra__plus__button__class}
                extraGlobalClass={styles.delete__minus__button}
                dropdownOptions={preparedDropdownOptions}
                canCreateNewOption={preparedCanCreateNewOption}
                inputType={adjustedInputType}
                initialRowsCount={1}
                idNames={['originalPrice', 'currency', 'unit']}
                titles={[t('originalPrice'), t('currency'), t('unit')]}
                rowsInitialValues={pricesMatrix}
                onSetValue={handlePriceSetValue}
                onRowsChange={handlePriceRowsChange}
                errorMessage={pricesError}
                minFilledRows={1}
              />
              <div className={styles.seller__date__box__inner__date}>
                <p className={styles.seller__date__box__inner__date__text}>{t('minimalVolumeTitle')}</p>
                <TextInputUI
                  idForLabel='cy-minimalVolume'
                  inputType='number'
                  extraClass={minVolumeError && styles.extra__error_class}
                  currentValue={currentData.priceInfo.minimalVolume}
                  onSetValue={handleMinVolumeChange}
                  theme='newWhite'
                  placeholder={t('minimalVolumePlaceholder')}
                  errorValue={minVolumeError}
                />
                <p className={styles.seller__date__box__inner__date__text}>{pricesMatrix?.[0]?.[2]}</p>
              </div>
            </div>
            <div className={styles.seller__date__box}>
              <div className={styles.seller__title}>
                <p className={styles.seller__title__text}>{t('infoAboutPrices')} </p>
                {HELP_IMAGES.saleDate.length !== 0 && (
                  <Image
                    onClick={() => openModal(HELP_IMAGES.saleDate)}
                    src={vopros}
                    style={{cursor: 'pointer'}}
                    alt='vopros'
                    width={27}
                    height={27}
                  />
                )}
              </div>
              <div className={styles.seller__date__box__inner}>
                <div className={styles.seller__date__box__inner__date}>
                  <p className={styles.seller__date__box__inner__date__text}>{t('priceWithDiscount')}</p>
                  <TextInputUI
                    idForLabel='cy-priceWithDiscount'
                    inputType='number'
                    currentValue={discountPrice}
                    onSetValue={handleDiscountPriceChange}
                    theme='newWhite'
                    placeholder={t('priceWithDiscount')}
                  />
                </div>
                <div className={styles.seller__date__box__inner__date}>
                  <p className={styles.seller__date__box__inner__date__text}>{t('daysCountBeforeSale')}</p>
                  <TextInputUI
                    idForLabel='cy-daysBeforeSale'
                    inputType='number'
                    currentValue={currentData.priceInfo.daysBeforeSale}
                    onSetValue={handleSaleDateChange}
                    theme='newWhite'
                    placeholder={t('daysCountBeforeSalePlaceholder')}
                    errorValue={currentErrors.saleDateError}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.rows__inputs__box__inner} ${styles.rows__inputs__box__inner__description}`}>
            <div className={`${styles.create__label__title__box}`}>
              <p className={`${styles.create__label__title}`}>{t('characteristickTable')}</p>
              <Image
                onClick={() => openModal(HELP_IMAGES.charactersTable)}
                src={vopros}
                style={{cursor: 'pointer'}}
                alt='vopros'
                width={27}
                height={27}
              />
            </div>
            <RowsInputs
              key={`characteristics-${characteristicsKey}`}
              inputsInRowCount={2}
              maxRows={6}
              extraButtonPlusClass={styles.extra__plus__button__class}
              useNewTheme
              maxLength={50}
              inputType={['text', 'textarea']}
              extraTextareaClass={styles.textarea__extra__padding}
              textAreaProps={{
                minRows: 1,
                maxRows: 5,
                autoResize: true
              }}
              extra__rows__grid={styles.extra__rows__grid__descr}
              extraClasses={[
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra,
                styles.rows__inputs__box__inner__description__extra
              ]}
              initialRowsCount={1}
              idNames={['title-characteristic', 'characteristic-characteristic']}
              titles={[t('characteristicTitle'), t('characteristicPlaceholder')]}
              rowsInitialValues={characteristicsMatrix}
              onSetValue={handleCharacteristicSetValue}
              onRowsChange={handleCharacteristicRowsChange}
              errorMessage={charMatrixError}
              minFilledRows={1}
            />
            <div style={{zIndex: '7777'}} className={styles.del__box}>
              <div className={styles.seller__title}>
                <p className={styles.seller__title__text}>{t('deliveryInfo')}</p>
                <Image
                  onClick={() => openModal(HELP_IMAGES.deliveryCars)}
                  src={vopros}
                  style={{cursor: 'pointer'}}
                  alt='vopros'
                  width={27}
                  height={27}
                />
              </div>
              <RowsInputs
                key={`delivery-${deliveryKey}`}
                useNewTheme
                extraButtonPlusClass={styles.extra__plus__button__class}
                extraButtonMinusClass={styles.minus__extra}
                extraClasses={[
                  styles.rows__extra__del,
                  styles.rows__extra__del,
                  styles.rows__extra__del,
                  styles.rows__extra__del,
                  styles.rows__extra__del,
                  styles.rows__extra__del,
                  styles.rows__extra__del,
                  styles.rows__extra__del
                ]}
                initialRowsCount={1}
                maxRows={5}
                inputsInRowCount={1}
                canCreateNewOption={[true]}
                showClearButton={[true]}
                inputType={['dropdown']}
                dropdownOptions={[[t('rail'), t('auto'), t('sea'), t('air')]]}
                idNames={['title-delivery']}
                rowsInitialValues={deliveryMatrix}
                onSetValue={handleDeliverySetValue}
                onRowsChange={handleDeliveryRowsChange}
                titles={[t('title')]}
                errorMessage={currentErrors.deliveryError}
                minFilledRows={1}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
)
CreateCardPriceElements.displayName = 'CreateCardPriceElements'

export default CreateCardPriceElements
