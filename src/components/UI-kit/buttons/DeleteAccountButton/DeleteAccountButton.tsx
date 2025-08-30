/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState} from 'react'
import {useRouter} from '@/i18n/navigation'
import instance from '@/api/api.interceptor'
import InputOtp from '../../inputs/inputOTP/inputOTP'
import ModalWindowDefault from '../../modals/ModalWindowDefault/ModalWindowDefault'
import {useLogout} from '@/hooks/useUserApi'
import {useTranslations} from 'next-intl'

interface DeleteAccountButtonProps {
  buttonText: string
}

const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({buttonText}) => {
  const [wantQuite, setWantQuite] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const {mutate: logout} = useLogout()

  const t = useTranslations('DeleteButton')

  const handleDeleteAccount = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError('')

      await instance.delete('/me/delete-account')
      setWantQuite(true)
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorDelete'))
      console.error('Delete account error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpComplete = async (otp: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError('')

      await instance.delete('/me/verify-delete-account', {
        data: {code: otp}
      })
      logout()
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.message || t('errorOtp'))
      console.error('Verify delete account error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='buttons__logouts__box'>
        <div className='buttons__logouts__box__item'>
          <button className='buttons__logouts__box__button' onClick={handleDeleteAccount} disabled={isLoading}>
            {isLoading ? t('loading') : buttonText}
          </button>
        </div>
      </div>

      {error && <div style={{color: '#ac2525', marginTop: '10px', fontSize: '14px'}}>{error}</div>}

      <ModalWindowDefault
        isOpen={wantQuite}
        onClose={() => {
          setWantQuite(false)
        }}
      >
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h3 style={{marginBottom: '20px'}}>{t('modalTitle')}</h3>
          <p style={{marginBottom: '20px'}}>{t('modalDescription')}</p>

          <InputOtp length={4} onComplete={handleOtpComplete} />

          {error && <div style={{color: '#ac2525', marginTop: '15px', fontSize: '14px'}}>{error}</div>}
          {isLoading && <div style={{marginTop: '15px', fontSize: '14px'}}>{t('checkingCode')}</div>}
        </div>
      </ModalWindowDefault>

      <style jsx>{`
        .buttons__logouts__box {
          display: flex;
          margin-top: 25px;
          margin-bottom: 35px;
          gap: 30px;
        }

        .buttons__logouts__box__item {
          width: fit-content;
        }

        .buttons__logouts__box__button {
          padding: 11px 18px;
          border: 2px solid #ac2525;
          border-radius: 10px;
          font-size: 15px;
          background: transparent;
          color: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .buttons__logouts__box__button:hover:not(:disabled) {
          padding: 11px 17px;
          color: #ac2525;
          font-weight: 500;
        }

        .buttons__logouts__box__button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}

export default DeleteAccountButton
