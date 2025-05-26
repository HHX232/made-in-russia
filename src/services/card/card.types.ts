interface Category {
  id: number
  name: string
  creationDate: string
  lastModificationDate: string
}

interface ICardFull {
  id: number
  deliveryMethods: string
  category: Category
  title: string
  price: number
  discount: number
  discountedPrice: number
  imageUrl: string
  creationDate: string // или Date
  lastModificationDate: string // или Date
}
export default ICardFull
