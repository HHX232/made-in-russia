import {ValidationErrors} from '@/components/pages/CreateCard/CreateCard.types'
import {FormState} from '@/types/CreateCard.extended.types'
import {validateField} from '@/utils/createCardHelpers'
import {useCallback, useMemo, useRef} from 'react'

export const useFormValidation = (
  formState: FormState,
  getCurrentMainDescription: () => string | undefined,
  translations: (val: string) => string
) => {
  // Кэшируем последний результат валидации
  const lastValidationResult = useRef<{
    validationErrors: ValidationErrors
    isFormValid: boolean
  } | null>(null)

  // Мемоизируем текущее описание только когда оно действительно изменилось
  const currentMainDescription = useMemo(() => {
    return getCurrentMainDescription() || ''
  }, [getCurrentMainDescription])

  // Получаем актуальное значение title для текущего языка
  const currentTitle = useMemo(() => {
    const langData = formState.cardObjectForOthers?.[formState.currentLangState]
    return langData?.title || formState.cardTitle || ''
  }, [formState.cardObjectForOthers, formState.currentLangState, formState.cardTitle])

  // Функция для выполнения полной валидации (вызывается только при необходимости)
  const performValidation = useCallback((): ValidationErrors => {
    return {
      cardTitle: validateField(
        'cardTitle',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,
        formState.faqMatrix,
        translations
      ),
      uploadedFiles: validateField(
        'uploadedFiles',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,
        formState.faqMatrix,
        translations
      ),
      pricesArray: validateField(
        'pricesArray',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,
        formState.faqMatrix,
        translations
      ),
      description: validateField(
        'description',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,

        formState.faqMatrix,
        translations
      ),
      descriptionMatrix: validateField(
        'descriptionMatrix',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,

        formState.faqMatrix,
        translations
      ),
      faqMatrix: validateField(
        'faqMatrix',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,

        formState.faqMatrix,
        translations
      ),
      descriptionImages: '' // Добавляем недостающее поле
    }
  }, [
    currentTitle,
    formState.uploadedFiles,
    formState.remainingInitialImages,
    formState.pricesArray,
    currentMainDescription,
    formState.descriptionMatrix,

    formState.faqMatrix,
    translations
  ])

  // Функция для валидации всех полей (вызывается при сабмите)
  const validateAllFields = useCallback((): {validationErrors: ValidationErrors; isFormValid: boolean} => {
    const validationErrors = performValidation()
    const isFormValid = !Object.values(validationErrors).some((error) => error !== '')

    // Кэшируем результат
    lastValidationResult.current = {validationErrors, isFormValid}

    return {validationErrors, isFormValid}
  }, [performValidation])

  // Функция для валидации отдельного поля (для быстрой проверки при изменении)
  const validateSingleField = useCallback(
    (fieldName: keyof ValidationErrors): string => {
      return validateField(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fieldName as any,
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,
        formState.faqMatrix,
        translations
      )
    },
    [
      currentTitle,
      formState.uploadedFiles,
      formState.remainingInitialImages,
      formState.pricesArray,
      currentMainDescription,
      formState.descriptionMatrix,
      formState.faqMatrix,
      translations
    ]
  )

  // Возвращаем легковесный объект с функциями валидации
  return {
    validateAllFields,
    validateSingleField,
    // Для обратной совместимости возвращаем последний кэшированный результат
    validationErrors: lastValidationResult.current?.validationErrors || {
      cardTitle: '',
      uploadedFiles: '',
      pricesArray: '',
      description: '',
      descriptionImages: '',
      descriptionMatrix: '',
      faqMatrix: ''
    },
    isFormValid: lastValidationResult.current?.isFormValid ?? true
  }
}
