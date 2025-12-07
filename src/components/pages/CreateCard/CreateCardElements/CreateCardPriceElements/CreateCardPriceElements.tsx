/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {useState, useEffect, memo} from 'react'
import styles from './CreateCardPriceElements.module.scss'
import RowsInputs from '@/components/UI-kit/RowsInputs/RowsInputs'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
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
}

const sanitizeQuantity = (value: string) => {
  const match = value.match(/^\d+/)
  return match ? match[0] : ''
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
    extra__rows__grid
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

    // Состояние для цены со скидкой (отдельный инпут)
    const [discountPrice, setDiscountPrice] = useState('')

    // Локальное состояние для списка цен (теперь БЕЗ priceWithDiscount)
    const [pricesMatrix, setPricesMatrix] = useState<string[][]>(
      (pricesArray || []).map((row) => {
        const newRow = [row[0], row[1], row[3], row[4]] // убираем индекс 2 (priceWithDiscount)
        if (newRow[0]) {
          const match = newRow[0].match(/^\d+/)
          newRow[0] = match ? match[0] : ''
        }
        return newRow
      })
    )

    const [characteristicsKey, setCharacteristicsKey] = useState(0)
    const [deliveryKey, setDeliveryKey] = useState(0)
    const [packagingKey, setPackagingKey] = useState(0)

    const t = useTranslations('CreateCardPriceElementsText')

    // Инициализация цены со скидкой из pricesArray
    useEffect(() => {
      if (pricesArray && pricesArray.length > 0 && pricesArray[0][2]) {
        setDiscountPrice(pricesArray[0][2])
      }
    }, [])

    const prepareDropdownOptions = () => {
      if (!inputType || dropdownPricesOptions.length === 0) {
        return []
      }

      const result: string[][] = []
      let dropdownIndex = 0

      // Корректируем для нового набора inputType (без priceWithDiscount)
      const adjustedInputType = inputType.filter((_, index) => index !== 2)

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

      const adjustedInputType = inputType.filter((_, index) => index !== 2)

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

    // Обработчик для матрицы цен (теперь с 4 колонками вместо 5)
    const handlePriceSetValue = (rowIndex: number, inputIndex: number, value: string) => {
      const newMatrix = [...pricesMatrix]

      if (!newMatrix[rowIndex]) {
        newMatrix[rowIndex] = new Array(4).fill('')
      }

      let sanitizedValue = value

      if (inputIndex === 0) {
        const match = sanitizedValue.match(/^\d+/)
        sanitizedValue = match ? match[0] : ''
      }

      newMatrix[rowIndex][inputIndex] = sanitizedValue
      setPricesMatrix(newMatrix)

      // Преобразуем в формат для родительского компонента, добавляя discountPrice
      const formattedPrices = newMatrix
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => ({
          quantity: row[0] || '',
          priceWithoutDiscount: row[1] || '',
          priceWithDiscount: discountPrice || '', // Берем из отдельного состояния
          currency: row[2] || '',
          unit: row[3] || '',
          value: parseFloat(discountPrice || row[1] || '0')
        }))

      onSetPricesArray(formattedPrices)
    }

    const handlePriceRowsChange = (newRows: string[][]) => {
      setPricesMatrix(newRows)

      const formattedPrices = newRows
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => ({
          quantity: row[0] || '',
          priceWithoutDiscount: row[1] || '',
          priceWithDiscount: discountPrice || '',
          currency: row[2] || '',
          unit: row[3] || '',
          value: parseFloat(discountPrice || row[1] || '0')
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
          quantity: row[0] || '',
          priceWithoutDiscount: row[1] || '',
          priceWithDiscount: value || '',
          currency: row[2] || '',
          unit: row[3] || '',
          value: parseFloat(value || row[1] || '0')
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
        // Преобразуем с учетом новой структуры (без priceWithDiscount в матрице)
        const newMatrix = pricesArray.map((row) => [row[0], row[1], row[3], row[4]])
        setPricesMatrix(newMatrix)
        // Обновляем discountPrice из первой строки
        if (pricesArray.length > 0 && pricesArray[0][2]) {
          setDiscountPrice(pricesArray[0][2])
        }
      }
    }, [pricesArray])

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

    // Корректируем inputType, убирая третий элемент
    const adjustedInputType = inputType ? inputType.filter((_, index) => index !== 2) : undefined

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
                <DropList
                  direction={windowWidth && windowWidth < 768 ? 'left' : 'bottom'}
                  safeAreaEnabled
                  positionIsAbsolute={false}
                  trigger='hover'
                  arrowClassName={`${styles.arrow__none}`}
                  title={<Image src={vopros} alt='vopros' width={27} height={27} />}
                  items={[
                    <Image
                      onClick={() => openModal(HELP_IMAGES.prices)}
                      src={HELP_IMAGES.prices}
                      alt='question'
                      width={300}
                      height={300}
                      key={1}
                    />
                  ]}
                />
              )}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', width: '100%', gap: '20px'}}>
              <RowsInputs
                useNewTheme
                inputsInRowCount={4}
                maxRows={1}
                extra__rows__grid={styles.extra__rows__grid}
                extraButtonPlusClass={styles.extra__plus__button__class}
                extraGlobalClass={styles.delete__minus__button}
                dropdownOptions={preparedDropdownOptions}
                canCreateNewOption={preparedCanCreateNewOption}
                inputType={adjustedInputType}
                initialRowsCount={1}
                idNames={['elementCount', 'originalPrice', 'currency', 'unit']}
                titles={[t('elementCount'), t('originalPrice'), t('currency'), t('unit')]}
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
                  currentValue={currentData.priceInfo.minimalVolume}
                  onSetValue={handleMinVolumeChange}
                  theme='newWhite'
                  placeholder={t('minimalVolumePlaceholder')}
                  errorValue={currentErrors.minVolumeError}
                />
              </div>
            </div>
            <div className={styles.seller__date__box}>
              <div className={styles.seller__title}>
                <p className={styles.seller__title__text}>{t('infoAboutPrices')} </p>
                {HELP_IMAGES.saleDate.length !== 0 && (
                  <DropList
                    direction={windowWidth && windowWidth < 768 ? 'bottom' : 'left'}
                    safeAreaEnabled
                    extraClass={`${styles.drop__extra}`}
                    positionIsAbsolute={false}
                    trigger='hover'
                    useNewTheme
                    arrowClassName={`${styles.arrow__none}`}
                    title={<Image src={vopros} alt='question' width={27} height={27} />}
                    items={[
                      <Image
                        src={HELP_IMAGES.saleDate}
                        className={styles.drop__extra__image__modal__second}
                        alt='question'
                        width={600}
                        onClick={() => openModal(HELP_IMAGES.saleDate)}
                        height={600}
                        key={1}
                      />
                    ]}
                  />
                )}
              </div>
              <div className={styles.seller__date__box__inner}>
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
              </div>
            </div>
          </div>
          <div className={`${styles.rows__inputs__box__inner} ${styles.rows__inputs__box__inner__description}`}>
            <div className={`${styles.create__label__title__box}`}>
              <p className={`${styles.create__label__title}`}>{t('characteristickTable')}</p>
            </div>
            <RowsInputs
              key={`characteristics-${characteristicsKey}`}
              inputsInRowCount={2}
              maxRows={6}
              extraButtonPlusClass={styles.extra__plus__button__class}
              useNewTheme
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
              errorMessage={currentErrors.characteristicsError}
              minFilledRows={1}
            />
            <div style={{zIndex: '7777'}} className={styles.del__box}>
              <div className={styles.seller__title}>
                <p className={styles.seller__title__text}>{t('deliveryInfo')}</p>
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
