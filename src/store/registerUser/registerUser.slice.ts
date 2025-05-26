import {createSlice, PayloadAction} from '@reduxjs/toolkit'

interface IInitialState {
  region: string
  name: string
  password: string
  number: string
  email: string
}

const initialState: IInitialState = {
  region: '',
  name: '',
  password: '',
  number: '',
  email: ''
}

export const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      state.region = action.payload
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload
    },
    setNumber: (state, action: PayloadAction<string>) => {
      state.number = action.payload
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    // Для сброса формы к начальным значениям
    resetRegistration: () => initialState
  }
})

// Экспорт действий
export const {setRegion, setName, setPassword, setNumber, setEmail, resetRegistration} = registrationSlice.actions

export default registrationSlice.reducer
