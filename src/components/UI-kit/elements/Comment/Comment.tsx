import {FC, useId, useState} from 'react'
import styles from './Comment.module.scss'
import {ICommentProps} from './Comment.types'
import Image from 'next/image'
import ModalWindowDefault from '../../modals/ModalWindowDefault/ModalWindowDefault'
import SlickCardSlider from '../CardSlider/CardSlider'
import formatDateToDayMonth from '@/utils/formatedDateToMonth'
const yellowStars = '/comments/yellow__start.svg'
const grayStars = '/comments/gray__start.svg'
const Comment: FC<ICommentProps> = ({
  commentID,
  // userId,
  images,
  userName,
  userImage,
  commentText,
  createdAt,
  starsCount
}) => {
  const id = useId()
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const closeModal = () => {
    setModalIsOpen(false)
  }

  return (
    <div key={commentID + '___' + id} className={`${styles.comment__box}`}>
      <ModalWindowDefault isOpen={modalIsOpen} onClose={closeModal}>
        {images.length <= 1 ? (
          <>
            <Image
              src={images[0]}
              width={600}
              height={600}
              alt='image'
              style={{
                borderRadius: '20px',
                width: '600px',
                height: 'auto',
                aspectRatio: '1 / 1',
                maxWidth: '600px',
                maxHeight: '600px'
              }}
            />
            <p className={`${styles.modal__text}`}>{commentText}</p>
          </>
        ) : (
          <>
            {' '}
            <SlickCardSlider isLoading={false} imagesCustom={images}></SlickCardSlider>
            <p className={`${styles.modal__text}`}>{commentText}</p>
          </>
        )}
      </ModalWindowDefault>
      <div className={`${styles.comment__user__data}`}>
        <Image className={`${styles.user__image}`} src={userImage} alt='userImage' width={28} height={28} />
        <div className={`${styles.comment__user__data__name}`}>{userName}</div>
        <div className={`${styles.comment__user__data__date}`}>{formatDateToDayMonth(createdAt)}</div>
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
            <li
              onClick={() => {
                console.log('modal is open')
                setModalIsOpen(true)
              }}
              style={{cursor: 'pointer'}}
              className={`${styles.images__item__box}`}
              key={i}
            >
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
