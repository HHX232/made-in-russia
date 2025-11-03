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
  // Изменяем тип для поддержки массива массивов
  dropdownPricesOptions?: string[][]
  // Добавляем новый пропс для управления возможностью создания новых опций
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
    // RTK actions
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

    // RTK selectors
    const currentData = useTypedSelector((state) => state.multiLanguageCardPriceData[currentLanguage])
    const currentErrors = useTypedSelector((state) => state.multiLanguageCardPriceData.errors[currentLanguage])
    const storeCurrentLanguage = useTypedSelector((state) => state.multiLanguageCardPriceData.currentLanguage)

    // Локальное состояние только для списка цен (так как он не в слайсе)
    const [pricesMatrix, setPricesMatrix] = useState<string[][]>(
      (pricesArray || []).map((row) => {
        const newRow = [...row]
        if (newRow[0]) {
          const match = newRow[0].match(/^\d+/)
          newRow[0] = match ? match[0] : ''
        }
        return newRow
      })
    )

    // Добавляем ключи для принудительного ре-рендера RowsInputs при смене языка
    const [characteristicsKey, setCharacteristicsKey] = useState(0)
    const [deliveryKey, setDeliveryKey] = useState(0)
    const [packagingKey, setPackagingKey] = useState(0)

    const t = useTranslations('CreateCardPriceElementsText')

    // Функция для преобразования dropdownPricesOptions в нужный формат для RowsInputs
    const prepareDropdownOptions = () => {
      if (!inputType || dropdownPricesOptions.length === 0) {
        return []
      }

      const result: string[][] = []
      let dropdownIndex = 0

      inputType.forEach((type, index) => {
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

    // Функция для подготовки массива canCreateNewOption в нужном формате
    const prepareCanCreateNewOption = () => {
      if (!inputType || canCreateNewOption.length === 0) {
        return []
      }

      const result: boolean[] = []
      let dropdownIndex = 0

      inputType.forEach((type, index) => {
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

    // Устанавливаем текущий язык в store при изменении пропса
    useEffect(() => {
      if (currentLanguage !== storeCurrentLanguage) {
        setCurrentLanguage(currentLanguage)
      }
    }, [currentLanguage, storeCurrentLanguage, setCurrentLanguage])

    // Принудительно обновляем ключи при смене языка для ре-рендера компонентов
    useEffect(() => {
      setCharacteristicsKey((prev) => prev + 1)
      setDeliveryKey((prev) => prev + 1)
      setPackagingKey((prev) => prev + 1)
    }, [currentLanguage])

    // Обработчик для матрицы цен (остается локальным, так как не в слайсе)
    const handlePriceSetValue = (rowIndex: number, inputIndex: number, value: string) => {
      const newMatrix = [...pricesMatrix]

      if (!newMatrix[rowIndex]) {
        newMatrix[rowIndex] = new Array(5).fill('')
      }

      let sanitizedValue = value

      // Если это первая колонка (quantity), фильтруем ввод
      if (inputIndex === 0) {
        // Оставляем только цифры перед любым дефисом
        const match = sanitizedValue.match(/^\d+/)
        sanitizedValue = match ? match[0] : ''
      }

      newMatrix[rowIndex][inputIndex] = sanitizedValue
      setPricesMatrix(newMatrix)

      // Преобразуем в формат для родительского компонента
      const formattedPrices = newMatrix
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => ({
          quantity: row[0] || '',
          priceWithoutDiscount: row[1] || '',
          priceWithDiscount: row[2] || '',
          currency: row[3] || '',
          unit: row[4] || '',
          value: parseFloat(row[2] || row[1] || '0')
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
          priceWithDiscount: row[2] || '',
          currency: row[3] || '',
          unit: row[4] || '',
          value: parseFloat(row[2] || row[1] || '0')
        }))

      onSetPricesArray(formattedPrices)
    }

    // Обработчики для характеристик
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

    // Обработчики для доставки
    const handleDeliverySetValue = (rowIndex: number, inputIndex: number, value: string) => {
      const field = inputIndex === 0 ? 'title' : 'daysDelivery'
      updateDelivery({
        language: currentLanguage,
        index: rowIndex,
        field: field as 'title' | 'daysDelivery',
        value
      })
    }

    const handleDeliveryRowsChange = (newRows: string[][]) => {
      const delivery = newRows.map((row) => ({
        title: row[0] || '',
        daysDelivery: row[1] || ''
      }))
      setDelivery({
        language: currentLanguage,
        delivery
      })
    }

    // Обработчики для упаковки
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

    // Валидация и обработчики для информации о ценах
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

    // Синхронизация с внешними изменениями для цен
    useEffect(() => {
      if (pricesArray && JSON.stringify(pricesArray) !== JSON.stringify(pricesMatrix)) {
        setPricesMatrix(pricesArray)
      }
    }, [pricesArray])

    // Преобразование данных из store в формат для RowsInputs
    const characteristicsMatrix = currentData.characteristics.map((item) => [item.title, item.characteristic])
    const deliveryMatrix = currentData.delivery.map((item) => [item.title, item.daysDelivery])
    const packagingMatrix = currentData.packaging.map((item) => [item.title, item.price])

    const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
    const windowWidth = useWindowWidth()

    useEffect(() => {
      console.log('currentData', currentData)
    }, [currentData])

    // Подготавливаем данные для dropdown опций
    const preparedDropdownOptions = prepareDropdownOptions()
    const preparedCanCreateNewOption = prepareCanCreateNewOption()

    return (
      <div className={styles.create__prices__box}>
        {/* Left */}
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
            </div>
            <RowsInputs
              useNewTheme
              inputsInRowCount={5}
              maxRows={1}
              extra__rows__grid={styles.extra__rows__grid}
              extraButtonPlusClass={styles.extra__plus__button__class}
              extraGlobalClass={styles.delete__minus__button}
              dropdownOptions={preparedDropdownOptions}
              canCreateNewOption={preparedCanCreateNewOption}
              inputType={inputType}
              initialRowsCount={1}
              idNames={['elementCount', 'originalPrice', 'priceWithDiscount', 'currency', 'unit']}
              titles={[t('elementCount'), t('originalPrice'), t('priceWithDiscount'), t('currency'), t('unit')]}
              rowsInitialValues={pricesMatrix}
              onSetValue={handlePriceSetValue}
              onRowsChange={handlePriceRowsChange}
              errorMessage={pricesError}
              minFilledRows={1}
            />
            <div className={styles.seller__date__box}>
              <div className={styles.seller__title}>
                <p className={styles.seller__title__text}>{t('infoAboutPrices')} </p>
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
            </div>
          </div>
          <div className={`${styles.rows__inputs__box__inner} ${styles.rows__inputs__box__inner__description}`}>
            <div className={`${styles.create__label__title__box}`}>
              <p className={`${styles.create__label__title}`}>{t('characteristickTable')}</p>
              {/* <DropList
                direction={windowWidth && windowWidth < 768 ? 'left' : 'right'}
                safeAreaEnabled
                positionIsAbsolute={false}
                trigger='hover'
                useNewTheme
                arrowClassName={`${styles.arrow__none}`}
                title={<Image src={vopros} alt='vopros' width={27} height={27} />}
                items={[
                  <Image
                    onClick={() => openModal(HELP_IMAGES.charactersTable)}
                    src={HELP_IMAGES.charactersTable}
                    alt='question'
                    width={300}
                    height={300}
                    key={1}
                  />
                ]}
              /> */}
            </div>
            <RowsInputs
              key={`characteristics-${characteristicsKey}`}
              inputsInRowCount={2}
              maxRows={20}
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
                <DropList
                  direction={windowWidth && windowWidth < 768 ? 'bottom' : 'left'}
                  safeAreaEnabled
                  extraClass={`${styles.drop__extra}`}
                  positionIsAbsolute={false}
                  trigger='hover'
                  arrowClassName={`${styles.arrow__none}`}
                  title={<Image src={vopros} alt='question' width={27} height={27} />}
                  items={[
                    <Image
                      onClick={() => openModal(HELP_IMAGES.delivery)}
                      src={HELP_IMAGES.delivery}
                      alt='question'
                      width={300}
                      height={300}
                      key={1}
                    />
                  ]}
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
                canCreateNewOption={[true]}
                showClearButton={[true]}
                inputType={['dropdown', 'numbersWithSpec']}
                dropdownOptions={[[t('rail'), t('auto'), t('sea'), t('air')]]}
                idNames={['title-delivery', 'daysDelivery-delivery']}
                rowsInitialValues={deliveryMatrix}
                onSetValue={handleDeliverySetValue}
                onRowsChange={handleDeliveryRowsChange}
                titles={[t('title'), t('daysDelivery')]}
                errorMessage={currentErrors.deliveryError}
                minFilledRows={1}
              />
            </div>
          </div>
        </div>
        {/* Right */}
      </div>
    )
  }
)
CreateCardPriceElements.displayName = 'CreateCardPriceElements'

export default CreateCardPriceElements
