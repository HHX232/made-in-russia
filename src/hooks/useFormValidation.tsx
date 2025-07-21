import {ValidationErrors} from '@/components/pages/CreateCard/CreateCard.types'
import {FormState} from '@/types/CreateCard.extended.types'
import {validateField} from '@/utils/createCardHelpers'
import {useCallback} from 'react'

export const useFormValidation = (formState: FormState, getCurrentMainDescription: () => string | undefined) => {
  const validateAllFields = useCallback((): boolean => {
    const currentMainDescription = getCurrentMainDescription()
    const newErrors: ValidationErrors = {
      cardTitle: validateField(
        'cardTitle',
        formState.cardTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription || '',
        formState.descriptionMatrix,
        formState.companyData,
        formState.faqMatrix
      ),
      uploadedFiles: validateField(
        'uploadedFiles',
        formState.cardTitle,
        formState.uploadedFiles,
        formState.remainingInitialImages,
        formState.pricesArray,
        currentMainDescription || '',
        formState.descriptionMatrix,
        formState.companyData,
        formState.faqMatrix
      ),
      // ... остальные поля валидации
      pricesArray: '',
      description: '',
      descriptionMatrix: '',
      companyData: '',
      faqMatrix: ''
    }

    return !Object.values(newErrors).some((error) => error !== '')
  }, [formState, getCurrentMainDescription])

  return {validateAllFields}
}
