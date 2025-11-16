import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {
  IMultilingualDescriptionsState,
  IMultilingualDescriptions,
  IDescription,
  SupportedLanguage
} from './multilingualDescriptions.types'

const initialState: IMultilingualDescriptionsState = {
  descriptions: {
    ru: {description: '## Основное описание', additionalDescription: '', furtherDescription: ''},
    en: {description: '## Main description', additionalDescription: '', furtherDescription: ''},
    zh: {description: '## 主要描述', additionalDescription: '', furtherDescription: ''},
    hi: {description: '## मुख्य विवरण', additionalDescription: '', furtherDescription: ''}
  },
  currentLanguage: 'ru',
  availableLanguages: ['ru', 'en', 'zh', 'hi']
}

export const multilingualDescriptionsSlice = createSlice({
  name: 'multilingualDescriptions',
  initialState,
  reducers: {
    // Установить все описания сразу
    setDescriptions: (state, action: PayloadAction<IMultilingualDescriptions>) => {
      state.descriptions = action.payload
    },

    // Обновить описание для конкретного языка
    updateDescriptionForLanguage: (
      state,
      action: PayloadAction<{language: SupportedLanguage; description: Partial<IDescription>}>
    ) => {
      const {language, description} = action.payload
      if (state.descriptions[language]) {
        state.descriptions[language] = {
          ...state.descriptions[language],
          ...description
        }
      } else {
        state.descriptions[language] = {
          description: description.description || '',
          additionalDescription: description.additionalDescription || '',
          furtherDescription: description.furtherDescription || ''
        }
      }
    },

    // Установить основное описание для языка
    setDescriptionOne: (state, action: PayloadAction<{language: SupportedLanguage; description: string}>) => {
      const {language, description} = action.payload
      if (description.length === 0 && state.descriptions[language].description.length !== 1) return
      if (description.length === 0 && state.descriptions[language].description.length === 1) {
        state.descriptions[language].description = ''
        return
      }
      if (
        description === state.descriptions['ru'].description ||
        description === state.descriptions['en'].description ||
        description === state.descriptions['zh'].description ||
        description === state.descriptions['hi'].description
      )
        return
      if (!state.descriptions[language]) {
        state.descriptions[language] = {description: '', additionalDescription: '', furtherDescription: ''}
      }
      state.descriptions[language].description = description
    },

    // Установить дополнительное описание для языка
    setAdditionalDescription: (
      state,
      action: PayloadAction<{language: SupportedLanguage; additionalDescription: string}>
    ) => {
      const {language, additionalDescription} = action.payload
      if (additionalDescription.length === 0 && state.descriptions[language].additionalDescription.length !== 1) return
      if (additionalDescription.length === 0 && state.descriptions[language].additionalDescription.length === 1) {
        state.descriptions[language].additionalDescription = ''
        return
      }
      if (
        additionalDescription === state.descriptions['ru'].additionalDescription ||
        additionalDescription === state.descriptions['en'].additionalDescription ||
        additionalDescription === state.descriptions['zh'].additionalDescription ||
        additionalDescription === state.descriptions['hi'].additionalDescription
      )
        return
      if (!state.descriptions[language]) {
        state.descriptions[language] = {description: '', additionalDescription: '', furtherDescription: ''}
      }
      state.descriptions[language].additionalDescription = additionalDescription
    },

    // Установить текущий язык
    setCurrentLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      if (state.availableLanguages.includes(action.payload)) {
        state.currentLanguage = action.payload
      }
    },

    // Добавить новый язык
    addLanguage: (state, action: PayloadAction<{language: SupportedLanguage; description?: IDescription}>) => {
      const {language, description} = action.payload

      if (!state.availableLanguages.includes(language)) {
        state.availableLanguages.push(language)
      }

      state.descriptions[language] = description || {
        description: '',
        additionalDescription: '',
        furtherDescription: ''
      }
    },

    // Удалить язык
    removeLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      const languageToRemove = action.payload

      // Нельзя удалить последний язык
      if (state.availableLanguages.length <= 1) {
        return
      }

      state.availableLanguages = state.availableLanguages.filter((lang) => lang !== languageToRemove)
      delete state.descriptions[languageToRemove]

      // Если удаляется текущий язык, переключиться на первый доступный
      if (state.currentLanguage === languageToRemove) {
        state.currentLanguage = state.availableLanguages[0]
      }
    },

    // Очистить все описания
    clearAllDescriptions: (state) => {
      state.availableLanguages.forEach((lang) => {
        state.descriptions[lang] = {description: '', additionalDescription: '', furtherDescription: ''}
      })
    },

    // Очистить описания для конкретного языка
    clearDescriptionForLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      const language = action.payload
      if (state.descriptions[language]) {
        state.descriptions[language] = {description: '', additionalDescription: '', furtherDescription: ''}
      }
    },

    // Копировать описание с одного языка на другой
    copyDescriptionBetweenLanguages: (
      state,
      action: PayloadAction<{fromLanguage: SupportedLanguage; toLanguage: SupportedLanguage}>
    ) => {
      const {fromLanguage, toLanguage} = action.payload

      if (state.descriptions[fromLanguage] && state.descriptions[toLanguage]) {
        state.descriptions[toLanguage] = {...state.descriptions[fromLanguage]}
      }
    },

    // Массовое обновление описаний
    bulkUpdateDescriptions: (
      state,
      action: PayloadAction<Array<{language: SupportedLanguage; description: Partial<IDescription>}>>
    ) => {
      action.payload.forEach(({language, description}) => {
        if (!state.descriptions[language]) {
          state.descriptions[language] = {description: '', additionalDescription: '', furtherDescription: ''}
        }
        state.descriptions[language] = {
          ...state.descriptions[language],
          ...description
        }
      })
    },

    // Сбросить состояние к начальному
    resetToInitialState: (state) => {
      Object.assign(state, initialState)
    }
  }
})

export default multilingualDescriptionsSlice
