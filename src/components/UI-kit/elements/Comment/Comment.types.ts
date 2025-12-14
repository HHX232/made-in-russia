import {Author} from '@/services/card/card.types'

export interface ICommentProps {
  commentID: string
  userId: string
  author: Author
  userName: string
  userImage: string
  commentText: string
  creationDate: string
  starsCount: number
  images: string[]
}
