import {FC, useId} from 'react'
import styles from './Comment.module.scss'
import {ICommentProps} from './Comment.types'
import Image from 'next/image'
const yellowStars = '/comments/yellow__start.svg'
const grayStars = '/comments/gray__start.svg'
const Comment: FC<ICommentProps> = ({
  commentID,
  userId,
  images,
  userName,
  userImage,
  commentText,
  createdAt,
  starsCount
}) => {
  const id = useId()
  return (
    <div key={commentID + '___' + id} className={`${styles.comment__box}`}>
      <div className={`${styles.comment__user__data}`}>
        <Image className={`${styles.user__image}`} src={userImage} alt='userImage' width={28} height={28} />
        <div className={`${styles.comment__user__data__name}`}>{userName}</div>
        <div className={`${styles.comment__user__data__date}`}>{createdAt}</div>
        <div className={`${styles.start__box}`}>
          <p className={`${styles.start__count}`}>{starsCount}</p>
          <ul className={`${styles.start__list__images}`}>
            {Array.from({length: starsCount}, (_, i) => i + 1).map((el, i) => {
              return (
                <li key={i}>
                  <Image className={`${styles.stars__image}`} src={yellowStars} alt='star' width={20} height={20} />
                </li>
              )
            })}
            {Array.from({length: 5 - starsCount}, (_, i) => i + 1).map((el, i) => {
              return (
                <li key={i}>
                  <Image className={`${styles.stars__image}`} src={grayStars} alt='star' width={20} height={20} />
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <ul className={`${styles.images__content__list}`}>
        {images.map((el, i) => {
          return (
            <li style={{cursor: 'pointer'}} className={`${styles.images__item__box}`} key={i}>
              <Image src={el} alt='image' width={70} height={75} />
            </li>
          )
        })}
      </ul>
      <p className={`${styles.comment__text}`}>{commentText}</p>
    </div>
  )
}

export default Comment
