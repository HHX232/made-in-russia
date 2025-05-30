import {FC, useId, useState} from 'react'
import styles from './Comment.module.scss'
import Image from 'next/image'
import ModalWindowDefault from '../../modals/ModalWindowDefault/ModalWindowDefault'
import SlickCardSlider from '../CardSlider/CardSlider'
import formatDateToDayMonth from '@/utils/formatedDateToMonth'
import {Review} from '@/services/card/card.types'
const yellowStars = '/comments/yellow__start.svg'
const grayStars = '/comments/gray__start.svg'

const avatar1 = '/avatars/avatar-v-1.svg'
const avatar2 = '/avatars/avatar-v-2.svg'

const Comment: FC<Review> = ({id: commentID, media, author, text, rating, creationDate}) => {
  const id = useId()
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const closeModal = () => {
    setModalIsOpen(false)
  }

  return (
    <div key={commentID + '___' + id} className={`${styles.comment__box}`}>
      <ModalWindowDefault isOpen={modalIsOpen} onClose={closeModal}>
        {media?.length === 1 ? (
          <>
            <Image
              src={media[0].url}
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
            <p className={`${styles.modal__text}`}>{text}</p>
          </>
        ) : (
          <>
            {' '}
            <SlickCardSlider isLoading={false} imagesCustom={media?.map((el) => el.url)}></SlickCardSlider>
            <p className={`${styles.modal__text}`}>{text}</p>
          </>
        )}
      </ModalWindowDefault>
      <div className={`${styles.comment__user__data}`}>
        <Image
          className={`${styles.user__image}`}
          src={author.avatar || (Math.random() > 0.5 ? avatar1 : avatar2)}
          alt='userImage'
          width={28}
          height={28}
        />
        <div className={`${styles.comment__user__data__name}`}>{author.login}</div>
        <div className={`${styles.comment__user__data__date}`}>
          {formatDateToDayMonth(creationDate || Date.now().toString())}
        </div>
        <div className={`${styles.start__box}`}>
          <p className={`${styles.start__count}`}>{rating}</p>
          <ul className={`${styles.start__list__images}`}>
            {Array.from({length: rating}, (_, i) => i + 1).map((el, i) => {
              return (
                <li key={i}>
                  <Image className={`${styles.stars__image}`} src={yellowStars} alt='star' width={20} height={20} />
                </li>
              )
            })}
            {Array.from({length: 5 - rating}, (_, i) => i + 1).map((el, i) => {
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
        {media?.map((el, i) => {
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
              <Image src={el.url} alt='image' width={70} height={75} />
            </li>
          )
        })}
      </ul>
      <p className={`${styles.comment__text}`}>{text}</p>
    </div>
  )
}

export default Comment
