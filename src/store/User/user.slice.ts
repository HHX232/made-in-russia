// store/slices/userSlice.ts - обновленный интерфейс
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

// Интерфейс для vendor данных (соответствует PATCH API)
export interface VendorDetails {
  phoneNumber?: string
  region?: string
  inn?: string
  description?: string
  sites?: string[]
  countries?: {name: string; value: string}[]
  productCategories?: {id: string; name: string; icon?: string}[]
  phoneNumbers?: string[]
  emails?: string[]
}

export interface User {
  isEnabled?: boolean
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
  avatarUrl: string
  // Добавляем vendor-специфичные поля
  vendorDetails?: VendorDetails
}

// Тип для vendor данных (extends User)
export interface IVendorData extends User {
  vendorDetails: VendorDetails
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  // Дополнительные поля для vendor логики
  phoneNumberCode?: string
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  phoneNumberCode: undefined
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.phoneNumberCode = undefined
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatarUrl = action.payload
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload}
      }
    },
    setPhoneNumberCode: (state, action: PayloadAction<string>) => {
      state.phoneNumberCode = action.payload
    },
    updateVendorDetails: (state, action: PayloadAction<Partial<VendorDetails>>) => {
      if (state.user && state.user.vendorDetails) {
        state.user.vendorDetails = {...state.user.vendorDetails, ...action.payload}
      } else if (state.user) {
        state.user.vendorDetails = action.payload
      }
    }
  }
})

export default userSlice
