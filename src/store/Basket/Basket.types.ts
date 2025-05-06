import {Product} from '@/services/products/product.types'
export interface IProductInBasket extends Product {
  countInBasket: number
}
export interface IBasketState {
  productsInBasket: IProductInBasket[]
  basketIsEmpty: boolean
}
