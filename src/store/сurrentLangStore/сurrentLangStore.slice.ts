import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export type LangValue = 'en' | 'ru' | 'zh'

interface ICurrentLangState {
  currentLangValue: LangValue
  currentLabel: string
}

const labels: Record<LangValue, string> = {
  en: 'English',
  ru: 'Русский',
  zh: '中文'
}

const initialState: ICurrentLangState = {
  currentLangValue: 'en',
  currentLabel: labels['en']
}

export const currentLangSlice = createSlice({
  name: 'currentLang',
  initialState,
  reducers: {
    setCurrentLang: (state, action: PayloadAction<LangValue>) => {
      state.currentLangValue = action.payload
      state.currentLabel = labels[action.payload]
    }
  }
})
export default currentLangSlice
