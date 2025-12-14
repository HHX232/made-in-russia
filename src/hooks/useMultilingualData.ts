/* eslint-disable @typescript-eslint/no-explicit-any */
import {ICurrentLanguage} from '@/components/pages/CreateCard/CreateCard.types'
import {useCallback} from 'react'

export const useMultilingualData = (
  currentLangState: ICurrentLanguage,
  cardObjectForOthers: any,
  companyDataForOthers: any,
  faqMatrixForOthers: any,
  descriptionMatrixForOthers: any,
  currentLang: string,
  companyData: any,
  faqMatrix: string[][],
  descriptionMatrix: string[][]
) => {
  const getValueForLang = useCallback(
    (state: any, objectValue: string): any => {
      const langData = cardObjectForOthers[currentLangState]
      return langData?.[objectValue] !== undefined ? langData[objectValue] : state
    },
    [currentLangState, cardObjectForOthers]
  )

  const getCurrentMainDescription = useCallback(() => {
    return cardObjectForOthers[currentLangState]?.mainDescription
  }, [cardObjectForOthers, currentLangState])

  const getCurrentFurtherDescription = useCallback(() => {
    return cardObjectForOthers[currentLangState]?.furtherDescription
  }, [cardObjectForOthers, currentLangState])

  const getCompanyDataForLang = useCallback(() => {
    if (currentLangState === currentLang) {
      return companyData
    }
    return companyDataForOthers[currentLangState] || companyData
  }, [currentLangState, currentLang, companyData, companyDataForOthers])

  const getFaqMatrixForLang = useCallback((): string[][] => {
    if (currentLangState === currentLang) {
      return faqMatrix
    }
    return faqMatrixForOthers[currentLangState] || faqMatrix
  }, [currentLangState, currentLang, faqMatrix, faqMatrixForOthers])

  const getDescriptionMatrixForLang = useCallback((): string[][] => {
    if (currentLangState === currentLang) {
      return descriptionMatrix
    }
    return descriptionMatrixForOthers[currentLangState] || descriptionMatrix
  }, [currentLangState, currentLang, descriptionMatrix, descriptionMatrixForOthers])

  return {
    getValueForLang,
    getCurrentMainDescription,
    getCurrentFurtherDescription,
    getCompanyDataForLang,
    getFaqMatrixForLang,
    getDescriptionMatrixForLang
  }
}
