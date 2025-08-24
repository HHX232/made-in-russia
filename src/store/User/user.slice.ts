// store/slices/userSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

export interface User {
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
  avatarUrl: string
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false
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
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatarUrl = action.payload
      }
    }
  }
})

export default userSlice
