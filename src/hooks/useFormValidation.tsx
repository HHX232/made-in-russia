import {ValidationErrors} from '@/components/pages/CreateCard/CreateCard.types'
import {FormState} from '@/types/CreateCard.extended.types'
import {validateField} from '@/utils/createCardHelpers'
import {useCallback, useMemo} from 'react'

export const useFormValidation = (
  formState: FormState,
  getCurrentMainDescription: () => string | undefined,
  translations: (val: string) => string
) => {
  // Мемоизируем текущее описание
  const currentMainDescription = useMemo(() => {
    return getCurrentMainDescription() || ''
  }, [getCurrentMainDescription])

  // Получаем актуальное значение title для текущего языка
  const currentTitle = useMemo(() => {
    const langData = formState.cardObjectForOthers?.[formState.currentLangState]
    return langData?.title || formState.cardTitle || ''
  }, [formState.cardObjectForOthers, formState.currentLangState, formState.cardTitle])

  // Мемоизируем ошибки валидации
  const validationErrors = useMemo((): ValidationErrors => {
    return {
      cardTitle: validateField(
        'cardTitle',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,
        formState.companyData,
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
        formState.companyData,
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
        formState.companyData,
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
        formState.companyData,
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
        formState.companyData,
        formState.faqMatrix,
        translations
      ),
      companyData: validateField(
        'companyData',
        currentTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription,
        formState.descriptionMatrix,
        formState.companyData,
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
        formState.companyData,
        formState.faqMatrix,
        translations
      )
    }
  }, [
    currentTitle, // Заменяем formState.cardTitle на currentTitle
    formState.uploadedFiles,
    formState.remainingInitialImages,
    formState.pricesArray,
    currentMainDescription,
    formState.descriptionMatrix,
    formState.companyData,
    formState.faqMatrix
  ])

  // Мемоизируем результат валидации
  const isFormValid = useMemo(() => {
    return !Object.values(validationErrors).some((error) => error !== '')
  }, [validationErrors])

  const validateAllFields = useCallback((): boolean => {
    return isFormValid
  }, [isFormValid])

  // Возвращаем также ошибки для использования в компоненте
  return {
    validateAllFields,
    validationErrors,
    isFormValid
  }
}
