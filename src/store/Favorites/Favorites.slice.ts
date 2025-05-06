import {Product} from '@/services/products/product.types'

export interface IFavoritesState {
  favoritesIsEmpty: boolean
  productInFavorites: Product[]
}
