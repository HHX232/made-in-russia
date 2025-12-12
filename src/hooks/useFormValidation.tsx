/* eslint-disable @typescript-eslint/no-explicit-any */
import {ValidationErrors} from '@/components/pages/CreateCard/CreateCard.types'
import {FormState} from '@/types/CreateCard.extended.types'
import {validateField} from '@/utils/createCardHelpers'
import {useCallback, useMemo, useRef} from 'react'

export const useFormValidation = (
  formState: FormState,
  getCurrentMainDescription: () => string | undefined,
  translations: (val: string) => string
) => {
  // Кэшируем результаты валидации для каждого поля отдельно
  const fieldValidationCache = useRef<ValidationErrors>({
    cardTitle: '',
    uploadedFiles: '',
    pricesArray: '',
    description: '',
    descriptionImages: '',
    descriptionMatrix: '',
    selectedCategory: '',
    deliveryTerms: ''
  })

  // Кэшируем значения для отслеживания изменений
  const valuesCache = useRef<{
    currentTitle: string
    uploadedFilesLength: number
    remainingImagesLength: number
    pricesArrayLength: number
    currentMainDescription: string
    descriptionMatrixString: string
    selectedDeliveryIdsLength: number
    selectedCategoryId: number | null // Добавлено
  }>({
    currentTitle: '',
    uploadedFilesLength: 0,
    remainingImagesLength: 0,
    pricesArrayLength: 0,
    currentMainDescription: '',
    descriptionMatrixString: '',
    selectedDeliveryIdsLength: 0,
    selectedCategoryId: null // Добавлено
  })

  // Получаем актуальные значения
  const currentMainDescription = getCurrentMainDescription() || ''
  const currentTitle = useMemo(() => {
    const langData = formState.cardObjectForOthers?.[formState.currentLangState]
    return langData?.title || formState.cardTitle || ''
  }, [formState.cardObjectForOthers, formState.currentLangState, formState.cardTitle])

  // Создаем строковое представление descriptionMatrix для сравнения
  const descriptionMatrixString = JSON.stringify(formState.descriptionMatrix)

  // Функция для проверки, изменилось ли значение для конкретного поля
  const hasFieldChanged = useCallback(
    (fieldName: keyof ValidationErrors): boolean => {
      const current = valuesCache.current

      switch (fieldName) {
        case 'cardTitle':
          return current.currentTitle !== currentTitle
        case 'pricesArray':
          return current.pricesArrayLength !== (formState.pricesArray?.length || 0)
        case 'description':
          return current.currentMainDescription !== currentMainDescription
        case 'descriptionMatrix':
          return current.descriptionMatrixString !== descriptionMatrixString
        case 'deliveryTerms':
          return current.selectedDeliveryIdsLength !== (formState.selectedDeliveryIds?.length || 0)
        case 'selectedCategory': // Добавлено
          return current.selectedCategoryId !== (formState.selectedCategory?.id || null)
        default:
          return false
      }
    },
    [
      currentTitle,
      formState.uploadedFiles,
      formState.remainingInitialImages,
      formState.pricesArray,
      currentMainDescription,
      descriptionMatrixString,
      formState.selectedDeliveryIds,
      formState.selectedCategory // Добавлено в зависимости
    ]
  )

  // Функция для обновления кэша значений
  const updateValuesCache = useCallback(() => {
    valuesCache.current = {
      currentTitle,
      uploadedFilesLength: formState.uploadedFiles?.length || 0,
      remainingImagesLength: formState.remainingInitialImages?.length || 0,
      pricesArrayLength: formState.pricesArray?.length || 0,
      currentMainDescription,
      descriptionMatrixString,
      selectedDeliveryIdsLength: formState.selectedDeliveryIds?.length || 0,
      selectedCategoryId: formState.selectedCategory?.id || null // Добавлено
    }
  }, [
    currentTitle,
    formState.uploadedFiles,
    formState.remainingInitialImages,
    formState.pricesArray,
    currentMainDescription,
    descriptionMatrixString,
    formState.selectedDeliveryIds,
    formState.selectedCategory // Добавлено в зависимости
  ])

  // Функция для валидации отдельного поля с кэшированием
  const validateSingleField = useCallback(
    (fieldName: keyof ValidationErrors, forceUpdate: boolean = false): string => {
      console.log('Хай - validateSingleField called for:', fieldName, 'forceUpdate:', forceUpdate)
      console.log('Хай - formState.selectedDeliveryIds:', formState.selectedDeliveryIds)
      console.log('Хай - formState.selectedCategory:', formState.selectedCategory)

      if (!forceUpdate && !hasFieldChanged(fieldName)) {
        console.log('Хай - using cached result for:', fieldName)
        return fieldValidationCache.current[fieldName] || ''
      }

      console.log('currentMainDescription', currentMainDescription)
      const validationResult = validateField(
        fieldName as any,
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,
        translations,
        formState.selectedDeliveryIds,
        formState.selectedCategory // Добавлен параметр
      )

      console.log('Хай - validation result for', fieldName, ':', validationResult)

      fieldValidationCache.current[fieldName] = validationResult

      return validationResult
    },
    [
      hasFieldChanged,
      currentTitle,
      formState.uploadedFiles,
      formState.remainingInitialImages,
      formState.pricesArray,
      currentMainDescription,
      formState.descriptionMatrix,
      translations,
      formState.selectedDeliveryIds,
      formState.selectedCategory // Добавлено в зависимости
    ]
  )

  // Функция для валидации всех полей (используется при сабмите)
  const validateAllFields = useCallback((): {validationErrors: ValidationErrors; isFormValid: boolean} => {
    console.log('Хай - validateAllFields called')
    console.log('Хай - formState at validation:', formState)

    updateValuesCache()

    const validationErrors: ValidationErrors = {
      cardTitle: validateSingleField('cardTitle', true),
      uploadedFiles: validateSingleField('uploadedFiles', true),
      pricesArray: validateSingleField('pricesArray', true),
      description: validateSingleField('description', true),
      descriptionMatrix: validateSingleField('descriptionMatrix', true),
      descriptionImages: '',
      deliveryTerms: validateSingleField('deliveryTerms', true),
      selectedCategory: validateSingleField('selectedCategory', true) // Добавлено
    }

    console.log('Хай - all validation errors:', validationErrors)

    const isFormValid = !Object.values(validationErrors).some((error) => error !== '')

    console.log('Хай - isFormValid:', isFormValid)

    return {validationErrors, isFormValid}
  }, [validateSingleField, updateValuesCache])

  // Функция для получения текущего состояния валидации (без пересчета)
  const getCurrentValidationErrors = useCallback((): ValidationErrors => {
    return {...fieldValidationCache.current}
  }, [])

  // Функция для проверки валидности формы на основе текущего кэша
  const isCurrentFormValid = useCallback((): boolean => {
    return !Object.values(fieldValidationCache.current).some((error) => error !== '')
  }, [])

  // Обновляем кэш значений при каждом рендере
  updateValuesCache()

  return {
    validateAllFields,
    validateSingleField: (fieldName: keyof ValidationErrors) => validateSingleField(fieldName, false),
    getCurrentValidationErrors,
    isCurrentFormValid,
    // Для обратной совместимости
    validationErrors: fieldValidationCache.current,
    isFormValid: isCurrentFormValid()
  }
}
