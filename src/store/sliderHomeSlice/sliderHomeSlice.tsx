import {createSlice, PayloadAction} from '@reduxjs/toolkit'

// Интерфейс состояния
interface SliderState {
  currentSlide: number
}

// Начальное состояние
const initialState: SliderState = {
  currentSlide: 0
}

// Создание slice
const sliderHomeSlice = createSlice({
  name: 'sliderHomeSlice',
  initialState,
  reducers: {
    // Устанавливаем текущий слайд
    setCurrentSlide: (state, action: PayloadAction<number>) => {
      state.currentSlide = action.payload
    },

    // Сброс до первого слайда
    resetSlide: (state) => {
      state.currentSlide = 0
    }
  }
})

// Экспорт reducer
export default sliderHomeSlice
