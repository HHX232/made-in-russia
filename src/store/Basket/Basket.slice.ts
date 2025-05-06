import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {IBasketState, IProductInBasket} from './Basket.types'
import {Product} from '@/services/products/product.types'

const initialState: IBasketState = {
  productsInBasket: [],
  basketIsEmpty: true
}

export const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    addToBasket: (state, action: PayloadAction<Product>) => {
      const existingProduct = state.productsInBasket.find((p) => p.id === action.payload.id)

      if (existingProduct) {
        existingProduct.countInBasket += 1
      } else {
        state.productsInBasket.push({
          ...action.payload,
          countInBasket: 1
        })
      }
      state.basketIsEmpty = false
    },

    removeFromBasket: (state, action: PayloadAction<string>) => {
      state.productsInBasket = state.productsInBasket.filter(
        (product) => product.id.toString() !== action.payload.toString()
      )
      state.basketIsEmpty = state.productsInBasket.length === 0
    },

    // Увеличение количества товара
    increaseCount: (state, action: PayloadAction<string>) => {
      const product = state.productsInBasket.find((p) => p.id.toString() === action.payload.toString())
      if (product) {
        product.countInBasket += 1
      }
    },

    decreaseCount: (state, action: PayloadAction<string>) => {
      const index = state.productsInBasket.findIndex((p) => p.id.toString() === action.payload.toString())
      if (index !== -1) {
        if (state.productsInBasket[index].countInBasket > 1) {
          state.productsInBasket[index].countInBasket -= 1
        } else {
          state.productsInBasket.splice(index, 1)
        }
      }
      state.basketIsEmpty = state.productsInBasket.length === 0
    },

    setProductCount: (state, action: PayloadAction<{id: string; count: number}>) => {
      const product = state.productsInBasket.find((p) => p.id.toString() === action.payload.id.toString())
      if (product) {
        if (action.payload.count > 0) {
          product.countInBasket = action.payload.count
        } else {
          state.productsInBasket = state.productsInBasket.filter(
            (p) => p.id.toString() !== action.payload.id.toString()
          )
        }
      } else if (action.payload.count > 0) {
        // Если товара нет в корзине, но count > 0, можно добавить
        // Здесь нужно получить полный Product из хранилища
      }
      state.basketIsEmpty = state.productsInBasket.length === 0
    },

    clearBasket: (state) => {
      state.productsInBasket = []
      state.basketIsEmpty = true
    },

    setBasket: (state, action: PayloadAction<IProductInBasket[]>) => {
      state.productsInBasket = action.payload
      state.basketIsEmpty = action.payload.length === 0
    },

    // Переключение товара в корзине (добавить/удалить)
    toggleProductInBasket: (state, action: PayloadAction<Product>) => {
      const existingIndex = state.productsInBasket.findIndex((p) => p.id === action.payload.id)

      if (existingIndex >= 0) {
        state.productsInBasket.splice(existingIndex, 1)
      } else {
        state.productsInBasket.push({
          ...action.payload,
          countInBasket: 1
        })
      }
      state.basketIsEmpty = state.productsInBasket.length === 0
    }
  }
})
