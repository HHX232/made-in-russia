export type SupportedLanguage = 'ru' | 'en' | 'zh'

export interface IDescription {
  description: string
  additionalDescription: string
  furtherDescription: string
}

export interface IMultilingualDescriptions {
  [key: string]: IDescription
}

export interface IMultilingualDescriptionsState {
  descriptions: IMultilingualDescriptions
  currentLanguage: SupportedLanguage
  availableLanguages: SupportedLanguage[]
}
