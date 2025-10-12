/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
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
      await instance.delete('/me/verify-delete-account', {data: {code: otp}})
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
      <button className='delete-btn' onClick={handleDeleteAccount} disabled={isLoading}>
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M21 5.97998C17.67 5.64998 14.32 5.47998 10.98 5.47998C9 5.47998 7.02 5.57998 5.04 5.77998L3 5.97998'
            stroke='#E1251B'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97'
            stroke='#E1251B'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M18.8504 9.14014L18.2004 19.2101C18.0904 20.7801 18.0004 22.0001 15.2104 22.0001H8.79039C6.00039 22.0001 5.91039 20.7801 5.80039 19.2101L5.15039 9.14014'
            stroke='#E1251B'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M10.3301 16.5H13.6601'
            stroke='#E1251B'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path d='M9.5 12.5H14.5' stroke='#E1251B' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
        <span>{isLoading ? t('loading') : buttonText}</span>
      </button>

      {error && <div style={{color: '#E1251B', marginTop: '10px', fontSize: '14px'}}>{error}</div>}

      <ModalWindowDefault isOpen={wantQuite} onClose={() => setWantQuite(false)}>
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h3 style={{marginBottom: '20px'}}>{t('modalTitle')}</h3>
          <p style={{marginBottom: '20px'}}>{t('modalDescription')}</p>

          <InputOtp length={4} onComplete={handleOtpComplete} />

          {error && <div style={{color: '#E1251B', marginTop: '15px', fontSize: '14px'}}>{error}</div>}
          {isLoading && <div style={{marginTop: '15px', fontSize: '14px'}}>{t('checkingCode')}</div>}
        </div>
      </ModalWindowDefault>

      <style jsx>{`
        .delete-btn {
          display: inline-flex;
          align-items: center;
          gap: 15px;
          color: #e1251b;
          font-size: 15px;
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .delete-btn:hover:not(:disabled) {
          opacity: 0.8;
        }

        .delete-btn svg {
          flex-shrink: 0;
        }
      `}</style>
    </>
  )
}

export default DeleteAccountButton
