import {FC, useId, useState} from 'react'
import styles from './Comment.module.scss'
import Image from 'next/image'
import ModalWindowDefault from '../../modals/ModalWindowDefault/ModalWindowDefault'
import SlickCardSlider from '../CardSlider/CardSlider'
import formatDateToDayMonth from '@/utils/formatedDateToMonth'
import {Review} from '@/services/card/card.types'
import {useLocale} from 'next-intl'
import instance from '@/api/api.interceptor'
import {toast} from 'sonner'
const yellowStars = '/comments/yellow__start.svg'
const grayStars = '/comments/gray__start.svg'

const avatar1 = '/avatars/avatar-v-1.svg'
interface CommentProps extends Review {
  isForAdmin?: boolean
}

const Comment: FC<CommentProps> = ({
  id: commentID,
  media,
  author,
  text,
  rating,
  creationDate,
  approveStatus,
  isForAdmin = false
}) => {
  const id = useId()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentLang: any = useLocale()
  const [approveStatusState, setApproveStatusState] = useState(approveStatus)

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const openModal = () => {
    setModalIsOpen(true)
  }

  const displayedMedia = media?.slice(0, 4) || []
  const remainingCount = (media?.length || 0) - 4

  const handleApprove = () => {
    try {
      const res = instance.post(`/moderation/product-review/${commentID}`, {status: 'APPROVED'})
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>Успех</strong>
          <span>Статус изменен</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
      console.log(res)
      setApproveStatusState('APPROVED')
    } catch {
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>Ошибка</strong>
          <span>Статус не изменен</span>
        </div>,
        {
          style: {background: '#AC2525'}
        }
      )
    }
  }

  const handleReject = () => {
    try {
      const res = instance.post(`/moderation/product-review/${commentID}`, {status: 'REJECTED'})
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>Успех</strong>
          <span>Статус изменен</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
      setApproveStatusState('REJECTED')
      console.log(res)
    } catch {
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>Ошибка</strong>
          <span>Статус не изменен</span>
        </div>,
        {
          style: {background: '#AC2525'}
        }
      )
    }
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
                width: '100%',
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
            <SlickCardSlider
              extraClass={styles.extra__class__slick__slider}
              isLoading={false}
              imagesCustom={media?.map((el) => el.url)}
            ></SlickCardSlider>
            <p className={`${styles.modal__text}`}>{text}</p>
          </>
        )}
      </ModalWindowDefault>
      <div className={`${styles.comment__user__data}`}>
        <Image
          className={`${styles.user__image}`}
          src={author.avatarUrl || avatar1}
          alt='userImage'
          width={28}
          height={28}
        />
        <div className={`${styles.comment__user__data__name}`}>{author.login}</div>
        <div className={`${styles.comment__user__data__date}`}>
          {formatDateToDayMonth(creationDate || Date.now().toString(), currentLang)}
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
        {displayedMedia.map((el, i) => {
          return (
            <li onClick={openModal} style={{cursor: 'pointer'}} className={`${styles.images__item__box}`} key={i}>
              {el.url.includes('mp4') ? (
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '10px',
                    width: '70px',
                    height: '75px',
                    overflow: 'hidden'
                  }}
                >
                  <video
                    src={el.url}
                    autoPlay
                    loop
                    muted
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  ></video>
                </div>
              ) : (
                <div
                  style={{backgroundImage: `url(${el.url})`}}
                  className={`${styles.images__item__image__comment__content}`}
                ></div>
              )}
            </li>
          )
        })}
        {remainingCount > 0 && media && media[4] && (
          <li
            onClick={openModal}
            style={{cursor: 'pointer'}}
            className={`${styles.images__item__box} ${styles.more__images__overlay}`}
            key='more-images'
          >
            {media[4].url.includes('mp4') ? (
              <div
                style={{
                  position: 'relative',
                  borderRadius: '10px',
                  width: '70px',
                  height: '75px',
                  overflow: 'hidden'
                }}
              >
                <video
                  src={media[4].url}
                  autoPlay
                  loop
                  muted
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                ></video>
                <div className={`${styles.more__images__blur}`}>
                  <div className={`${styles.more__images__text}`}>+{remainingCount}</div>
                </div>
              </div>
            ) : (
              <div
                style={{backgroundImage: `url(${media[4].url})`}}
                className={`${styles.images__item__image__comment__content}`}
              >
                <div className={`${styles.more__images__blur}`}>
                  <div className={`${styles.more__images__text}`}>+{remainingCount}</div>
                </div>
              </div>
            )}
          </li>
        )}
      </ul>
      <div style={{display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
        {' '}
        <p className={`${styles.comment__text}`}>{text}</p>
        {isForAdmin && (
          <div
            className={`${styles.status__box} ${
              approveStatusState === 'APPROVED'
                ? styles.approved
                : approveStatusState === 'PENDING'
                  ? styles.pending
                  : styles.rejected
            }`}
          >
            {approveStatusState}
            <div className={styles.status__buttons__box}>
              <button onClick={handleApprove} className={styles.status__buttons__box__button__approve}>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M4 12.6111L8.92308 17.5L20 6.5'
                    stroke='#ffffff'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
              <button onClick={handleReject} className={styles.status__buttons__box__button__reject}>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M16 8L8 16M8.00001 8L16 16'
                    stroke='#ffffff'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Comment
