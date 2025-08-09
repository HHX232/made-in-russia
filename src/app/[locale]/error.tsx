'use client'

import {useLocale} from 'next-intl'

const translations = {
  ru: {
    title: 'Произошла ошибка!',
    description: 'К сожалению, что-то пошло не так. Мы уже работаем над решением этой проблемы.',
    button: 'Попробовать снова',
    technical: 'Техническая информация',
    contact: 'Если проблема повторяется, свяжитесь с нами:',
    phone: 'Телефон:',
    email: 'Email:'
  },
  en: {
    title: 'Something went wrong!',
    description: 'Unfortunately, an error occurred. We are already working on fixing this issue.',
    button: 'Try again',
    technical: 'Technical information',
    contact: 'If the problem persists, contact us:',
    phone: 'Phone:',
    email: 'Email:'
  },
  zh: {
    title: '出现错误！',
    description: '很抱歉，出现了问题。我们正在努力解决这个问题。',
    button: '重试',
    technical: '技术信息',
    contact: '如果问题持续存在，请联系我们：',
    phone: '电话：',
    email: '邮箱：'
  }
}

export default function ErrorPage({error, reset}: {error: Error; reset: () => void}) {
  const locale = useLocale() as keyof typeof translations
  const t = translations[locale] || translations.en

  const telephone = process.env.NEXT_PUBLIC_TELEPHONE
  const email = process.env.NEXT_PUBLIC_EMAIL

  const handleReset = () => {
    try {
      reset()
      if (typeof window !== 'undefined') {
        window?.location.reload()
      }
    } catch (err) {
      console.error('Reset failed:', err)
    }
  }

  console.log(error)

  return (
    <>
      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .error-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 60px 40px;
          text-align: center;
          max-width: 500px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .error-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #ac2525, #17469d);
        }

        .error-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ac2525, #17469d);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(172, 37, 37, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 15px rgba(172, 37, 37, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(172, 37, 37, 0);
          }
        }

        .error-icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .error-title {
          color: #ac2525;
          font-size: 2.2em;
          font-weight: 700;
          margin: 0 0 20px;
          line-height: 1.2;
        }

        .error-description {
          color: #666;
          font-size: 1.1em;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .retry-button {
          background: linear-gradient(135deg, #17469d, #ac2525);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 1.1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(23, 70, 157, 0.3);
          margin-bottom: 30px;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(23, 70, 157, 0.4);
        }

        .retry-button:active {
          transform: translateY(0);
        }

        .technical-details {
          margin-top: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 4px solid #17469d;
        }

        .technical-title {
          color: #17469d;
          font-size: 0.9em;
          font-weight: 600;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .error-message {
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          color: #ac2525;
          word-break: break-all;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .contact-info {
          margin-top: 20px;
          color: #888;
          font-size: 0.9em;
        }

        .contact-text {
          margin-bottom: 15px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 8px 0;
        }

        .contact-label {
          font-weight: 600;
          color: #17469d;
        }

        .contact-link {
          color: #ac2525;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .contact-link:hover {
          color: #17469d;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .error-card {
            padding: 40px 20px;
          }

          .error-title {
            font-size: 1.8em;
          }

          .retry-button {
            width: 100%;
          }
        }
      `}</style>

      <div className='error-container'>
        <div className='error-card'>
          <div className='error-icon'>
            <svg fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>

          <h1 className='error-title'>{t.title}</h1>
          <p className='error-description'>{t.description}</p>

          <button className='retry-button' onClick={handleReset}>
            {t.button}
          </button>

          <div className='contact-info'>
            <div className='contact-text'>{t.contact}</div>
            {telephone && (
              <div className='contact-item'>
                <span className='contact-label'>{t.phone}</span>
                <a href={`tel:${telephone}`} className='contact-link'>
                  {telephone}
                </a>
              </div>
            )}
            {email && (
              <div className='contact-item'>
                <span className='contact-label'>{t.email}</span>
                <a href={`mailto:${email}`} className='contact-link'>
                  {email}
                </a>
              </div>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className='technical-details'>
              <div className='technical-title'>{t.technical}</div>
              <div className='error-message'>{error.message || 'Unknown error'}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
