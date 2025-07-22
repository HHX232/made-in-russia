import {ValidationErrors} from '@/components/pages/CreateCard/CreateCard.types'
import {FormState} from '@/types/CreateCard.extended.types'
import {validateField} from '@/utils/createCardHelpers'
import {useCallback, useMemo} from 'react'

export const useFormValidation = (formState: FormState, getCurrentMainDescription: () => string | undefined) => {
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
        formState.faqMatrix
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
        formState.faqMatrix
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
        formState.faqMatrix
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
        formState.faqMatrix
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
        formState.faqMatrix
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
        formState.faqMatrix
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
        formState.faqMatrix
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
