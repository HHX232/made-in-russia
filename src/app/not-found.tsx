import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import Link from 'next/link'
import styles from '@/scss/notFound.module.scss' // Путь к вашему CSS файлу

export default function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Иконка ошибки */}
          <div className={styles.iconCircle}>
            <svg className={styles.errorIcon} fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>

          {/* Контент */}
          <h1 className={styles.heading}>404 - Страница не найдена</h1>

          <p className={styles.description}>
            Возможно, эта страница была перемещена или удалена. Проверьте правильность URL или вернитесь на главную.
          </p>

          {/* Кнопка */}
          <Link href='/' className={styles.homeButton}>
            Вернуться на главную
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
