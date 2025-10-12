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

const yellowStars = '/iconsNew/newStarY.svg'
const grayStars = '/iconsNew/newStarG.svg'
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

  const displayedMedia = media?.slice(0, 3) || []

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
    <div key={commentID + '___' + id} className={`${styles['review-acc']}`}>
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
            <SlickCardSlider
              extraClass={styles.extra__class__slick__slider}
              isLoading={false}
              imagesCustom={media?.map((el) => el.url)}
            />
            <p className={`${styles.modal__text}`}>{text}</p>
          </>
        )}
      </ModalWindowDefault>

      {/* Header */}
      <div className={`${styles['review-acc-header']}`}>
        {/* Left Group */}
        <div className={`${styles['review-acc-header__group']}`}>
          <div className={`${styles['review-acc-header__avatar']}`}>
            <Image src={author.avatarUrl || avatar1} alt='userImage' width={71} height={71} />
          </div>

          <div className={`${styles['review-acc-header__info']}`}>
            <div className={`${styles['review-acc-header__info-group']}`}>
              <span className={`${styles['info-group__title']}`}>{author.login}</span>
            </div>

            <div className={`${styles['review-acc-header__info-group']}`}>
              <div className={`${styles['rating-stars']} ${styles['review-acc-header__rating']}`}>
                {Array.from({length: rating}, (_, i) => i + 1).map((el, i) => (
                  <div key={i} className={`${styles['rating-stars__item']}`}>
                    <Image src={yellowStars} alt='star' width={24} height={24} />
                  </div>
                ))}
                {Array.from({length: 5 - rating}, (_, i) => i + 1).map((el, i) => (
                  <div key={i} className={`${styles['rating-stars__item']}`}>
                    <Image src={grayStars} alt='star' width={24} height={24} />
                  </div>
                ))}
              </div>
              <span className={`${styles['info-group__date']}`}>
                {formatDateToDayMonth(creationDate || Date.now().toString(), currentLang)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Group - Delete Button */}
        {isForAdmin && (
          <div className={`${styles['review-acc-header__group']}`}>
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
                      stroke='#28a745'
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
                      stroke='#dc3545'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`${styles['review-acc-body']}`}>
        {displayedMedia.length > 0 && (
          <div className={`${styles['review-acc-body__collection']}`}>
            {displayedMedia.map((el, i) => (
              <a
                key={i}
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  openModal()
                }}
                style={{cursor: 'pointer', borderRadius: '0'}}
              >
                {el.url.includes('mp4') ? (
                  <video
                    src={el.url}
                    autoPlay
                    loop
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Image style={{borderRadius: '0'}} src={el.url} alt={`review-${i}`} width={52} height={52} />
                )}
              </a>
            ))}
          </div>
        )}
        <div className={`${styles['review-acc-body__text']}`}>{text}</div>
      </div>
    </div>
  )
}

export default Comment
