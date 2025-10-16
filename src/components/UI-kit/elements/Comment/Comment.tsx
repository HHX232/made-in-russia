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
  isForVendor?: boolean
  isForOwner?: boolean
}

const Comment: FC<CommentProps> = ({
  id: commentID,
  media,
  author,
  text,
  rating,
  creationDate,
  approveStatus,
  isForAdmin = false,
  isForVendor = false,
  product,
  isForOwner = false
}) => {
  const id = useId()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentLang: any = useLocale()
  const [approveStatusState, setApproveStatusState] = useState(approveStatus)

  const handleDeleteComm = ({id}: {id: string}) => {
    const innerF = async () => {
      try {
        await instance.delete(`/me/reviews/${id}`)
        toast.success('Success')
      } catch {
        toast.success('Error')
      }
    }
    innerF()
  }

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
            <Image
              src={isForVendor ? product.previewImageUrl : author.avatarUrl || avatar1}
              alt='userImage'
              width={71}
              height={71}
            />
          </div>

          <div className={`${styles['review-acc-header__info']}`}>
            <div className={`${styles['review-acc-header__info-group']}`}>
              <span className={`${styles['info-group__title']}`}>{isForVendor ? product.title : author.login}</span>
              <span className={`${styles['info-group__date']}`}>
                {formatDateToDayMonth(creationDate || Date.now().toString(), currentLang)}
              </span>
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
            </div>
          </div>
        </div>

        {/* Right Group - Delete Button */}
        {isForOwner && (
          <div
            onClick={() => {
              handleDeleteComm({id: commentID.toString()})
            }}
            className={styles.delete__owner__com}
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M21 5.97998C17.67 5.64998 14.32 5.47998 10.98 5.47998C9 5.47998 7.02 5.57998 5.04 5.77998L3 5.97998'
                stroke='white'
                stroke-width='1.5'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
              <path
                d='M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97'
                stroke='white'
                stroke-width='1.5'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
              <path
                d='M18.8504 9.14014L18.2004 19.2101C18.0904 20.7801 18.0004 22.0001 15.2104 22.0001H8.79039C6.00039 22.0001 5.91039 20.7801 5.80039 19.2101L5.15039 9.14014'
                stroke='white'
                stroke-width='1.5'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
              <path
                d='M10.3301 16.5H13.6601'
                stroke='white'
                stroke-width='1.5'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
              <path
                d='M9.5 12.5H14.5'
                stroke='white'
                stroke-width='1.5'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
            </svg>
          </div>
        )}
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
