/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useState, useEffect} from 'react'
import styles from './CreateCardPriceElements.module.scss'
import RowsInputs from '@/components/UI-kit/RowsInputs/RowsInputs'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import Image from 'next/image'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import {HELP_IMAGES} from '../../CreateCard'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import getDatesDifference from '@/utils/getDatesDifference'
import useWindowWidth from '@/hooks/useWindoWidth'
const vopros = '/vopros.svg'

interface PriceData {
  quantity: string
  priceWithoutDiscount: string
  priceWithDiscount: string
  currency: string
  value?: number // Для валидации
  unit?: string
}
type TInputType = 'text' | 'number' | 'password'

interface CreateCardPriceElementsProps {
  pricesArray?: string[][]
  descriptionArray?: string[][]
  minimalValue?: string
  saleDateInitial?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSetPricesArray: (pricesArray: any[]) => void
  onSetDescriptionArray?: (descriptionArray: string[][]) => void
  pricesError?: string
  descriptionMatrixError?: string
  deliveryError?: string
  packagingError?: string
  initialDelieveryMatrix?: string[][]
  initialPackagingMatrix?: string[][]
  inputType?: TInputType[]
  onSetPackagingMatrix?: (packagingMatrix: string[][]) => void
  onSetSaleDate?: (saleDate: string) => void
}

const CreateCardPriceElements: FC<CreateCardPriceElementsProps> = ({
  pricesArray,
  descriptionArray,
  onSetPricesArray,
  onSetDescriptionArray,
  pricesError = '',
  descriptionMatrixError = '',
  deliveryError = '',
  packagingError = '',
  minimalValue,
  saleDateInitial,
  initialDelieveryMatrix,
  initialPackagingMatrix,
  inputType,
  onSetPackagingMatrix,
  onSetSaleDate
}) => {
  const [pricesMatrix, setPricesMatrix] = useState<string[][]>(pricesArray || [])
  const [descriptionMatrix, setDescriptionMatrix] = useState<string[][]>(descriptionArray || [])
  const [deliveryMatrix, setDeliveryMatrix] = useState<string[][]>(initialDelieveryMatrix || [])
  const [packagingMatrix, setPackagingMatrix] = useState<string[][]>(initialPackagingMatrix || [])

  const [saleDate, setSaleDate] = useState<string>(saleDateInitial || '')
  const [minVolume, setMinVolume] = useState<string>(minimalValue || '')

  useEffect(() => {
    console.log('saleDate', saleDate)
    console.log('initialPackagingMatrix', initialPackagingMatrix)
    console.log('packagingMatrix', packagingMatrix)
  }, [saleDate, initialPackagingMatrix, packagingMatrix])
  // Локальные ошибки для полей справа
  const [saleDateError, setSaleDateError] = useState<string>('')
  const [minVolumeError, setMinVolumeError] = useState<string>('')

  // Обработчик для матрицы цен
  const handlePriceSetValue = (rowIndex: number, inputIndex: number, value: string) => {
    const newMatrix = [...pricesMatrix]

    if (!newMatrix[rowIndex]) {
      newMatrix[rowIndex] = new Array(5).fill('')
    }

    newMatrix[rowIndex][inputIndex] = value
    setPricesMatrix(newMatrix)

    // Преобразуем в формат для родительского компонента
    const formattedPrices = newMatrix
      .filter((row) => row.some((cell) => cell.trim())) // Фильтруем пустые строки
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

    // Преобразуем в формат для родительского компонента
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

  // Обработчик для матрицы описания
  const handleDescriptionSetValue = (rowIndex: number, inputIndex: number, value: string) => {
    const newMatrix = [...descriptionMatrix]

    if (!newMatrix[rowIndex]) {
      newMatrix[rowIndex] = new Array(2).fill('') // 2 колонки для описания
    }

    newMatrix[rowIndex][inputIndex] = value
    setDescriptionMatrix(newMatrix)

    if (onSetDescriptionArray) {
      onSetDescriptionArray(newMatrix)
    }
  }

  const handleDescriptionRowsChange = (newRows: string[][]) => {
    setDescriptionMatrix(newRows)

    if (onSetDescriptionArray) {
      onSetDescriptionArray(newRows)
    }
  }

  // Обработчики для доставки и упаковки
  const handleDeliveryRowsChange = (newRows: string[][]) => {
    setDeliveryMatrix(newRows)
  }

  const handlePackagingRowsChange = (newRows: string[][]) => {
    setPackagingMatrix(newRows)
    onSetPackagingMatrix?.(newRows)
  }

  // Валидация полей справа
  const validateSaleDate = (value: string) => {
    if (!value.trim()) {
      setSaleDateError('Укажите количество дней до окончания акции')
      return false
    }
    const days = parseInt(value)
    if (isNaN(days) || days <= 0) {
      setSaleDateError('Количество дней должно быть положительным числом')
      return false
    }
    setSaleDateError('')
    return true
  }

  const validateMinVolume = (value: string) => {
    if (!value.trim()) {
      setMinVolumeError('Укажите минимальный объем заказа')
      return false
    }
    setMinVolumeError('')
    return true
  }

  // Обработчики изменений с валидацией
  const handleSaleDateChange = (value: string) => {
    setSaleDate(value)
    onSetSaleDate?.(value)
    if (saleDateError) {
      validateSaleDate(value)
    }
  }

  const handleMinVolumeChange = (value: string) => {
    setMinVolume(value)
    if (minVolumeError) {
      validateMinVolume(value)
    }
  }

  // Синхронизация с внешними изменениями для цен
  useEffect(() => {
    if (pricesArray && JSON.stringify(pricesArray) !== JSON.stringify(pricesMatrix)) {
      setPricesMatrix(pricesArray)
    }
  }, [pricesArray])

  // Синхронизация с внешними изменениями для описания
  useEffect(() => {
    if (descriptionArray && JSON.stringify(descriptionArray) !== JSON.stringify(descriptionMatrix)) {
      setDescriptionMatrix(descriptionArray)
    }
  }, [descriptionArray])

  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const windowWidth = useWindowWidth()
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
          <div className={`${styles.create__label__title__box}`}>
            <p className={`${styles.create__label__title}`}>Список цен на товар</p>
            <DropList
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
              safeAreaEnabled
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='vopros' width={27} height={27} />}
              items={[
                <Image
                  onClick={() => openModal(HELP_IMAGES.prices)}
                  src={HELP_IMAGES.prices}
                  alt='vopros'
                  width={300}
                  height={300}
                  key={1}
                />
              ]}
            />
          </div>
          <RowsInputs
            inputsInRowCount={5}
            maxRows={5}
            inputType={inputType}
            initialRowsCount={3}
            titles={['количество единиц', 'Цена без скидки', 'Цена со скидкой', 'Валюта', 'Единица измерения']}
            rowsInitialValues={pricesMatrix}
            onSetValue={handlePriceSetValue}
            onRowsChange={handlePriceRowsChange}
            errorMessage={pricesError}
            minFilledRows={1}
          />
        </div>
        <div className={`${styles.rows__inputs__box__inner} ${styles.rows__inputs__box__inner__description}`}>
          <div className={`${styles.create__label__title__box}`}>
            <p className={`${styles.create__label__title}`}>Таблица описания и характеристик</p>
            <DropList
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
              safeAreaEnabled
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='vopros' width={27} height={27} />}
              items={[
                <Image
                  onClick={() => openModal(HELP_IMAGES.charactersTable)}
                  src={HELP_IMAGES.charactersTable}
                  alt='vopros'
                  width={300}
                  height={300}
                  key={1}
                />
              ]}
            />
          </div>
          <RowsInputs
            inputsInRowCount={2}
            maxRows={20}
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
            initialRowsCount={5}
            titles={['Название', 'Характеристика']}
            rowsInitialValues={descriptionMatrix}
            onSetValue={handleDescriptionSetValue}
            onRowsChange={handleDescriptionRowsChange}
            errorMessage={descriptionMatrixError}
            minFilledRows={1}
          />
        </div>
      </div>
      {/* Right */}
      <div className={styles.right__box}>
        <div className={styles.seller__date__box}>
          <div className={styles.seller__title}>
            <p className={styles.seller__title__text}>Информация о ценах </p>
            <DropList
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'left'}
              safeAreaEnabled
              extraClass={`${styles.drop__extra}`}
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='vopros' width={27} height={27} />}
              items={[
                <Image
                  src={HELP_IMAGES.saleDate}
                  className={styles.drop__extra__image__modal__second}
                  alt='vopros'
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
              <p className={styles.seller__date__box__inner__date__text}>До окончания акции</p>
              <TextInputUI
                inputType='number'
                currentValue={saleDate}
                onSetValue={handleSaleDateChange}
                theme='lightBlue'
                placeholder='До окончания ... дней'
                errorValue={saleDateError}
              />
            </div>
            <div className={styles.seller__date__box__inner__date}>
              <p className={styles.seller__date__box__inner__date__text}>Минимальный объем</p>
              <TextInputUI
                inputType='number'
                currentValue={minVolume.split(' ')[0] !== 'undefined' ? minVolume : ''}
                onSetValue={handleMinVolumeChange}
                theme='lightBlue'
                placeholder='Минимальный объем заказа ...'
                errorValue={minVolumeError}
              />
            </div>
          </div>
        </div>
        <div className={styles.del__box}>
          <div className={styles.seller__title}>
            <p className={styles.seller__title__text}>Информация о доставке</p>
            <DropList
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'left'}
              safeAreaEnabled
              extraClass={`${styles.drop__extra}`}
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='vopros' width={27} height={27} />}
              items={[
                <Image
                  onClick={() => openModal(HELP_IMAGES.delivery)}
                  src={HELP_IMAGES.delivery}
                  alt='vopros'
                  width={300}
                  height={300}
                  key={1}
                />
              ]}
            />
          </div>
          <RowsInputs
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
            initialRowsCount={2}
            maxRows={5}
            rowsInitialValues={deliveryMatrix}
            onSetValue={() => {}}
            onRowsChange={handleDeliveryRowsChange}
            titles={['Название', 'Сроки']}
            errorMessage={deliveryError}
            minFilledRows={1}
          />
        </div>
        <div className={styles.package__box}>
          <div className={styles.seller__title}>
            <p className={styles.seller__title__text}>Варианты упаковки</p>
            <DropList
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'left'}
              safeAreaEnabled
              extraClass={`${styles.drop__extra}`}
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='vopros' width={27} height={27} />}
              items={[
                <Image
                  onClick={() => openModal(HELP_IMAGES.delivery)}
                  src={HELP_IMAGES.delivery}
                  alt='vopros'
                  width={300}
                  height={300}
                  key={1}
                />
              ]}
            />
          </div>
          <RowsInputs
            inputType={['text', 'number']}
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
            initialRowsCount={2}
            maxRows={5}
            onSetValue={() => {}}
            rowsInitialValues={packagingMatrix}
            onRowsChange={handlePackagingRowsChange}
            titles={['Название', 'Цена']}
            errorMessage={packagingError}
            minFilledRows={1}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateCardPriceElements
