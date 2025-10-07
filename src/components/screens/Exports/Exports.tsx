import React from 'react'
import styles from './Exports.module.scss'
export default function Exports() {
  return (
    <section className={`section ${styles.exporteru}`}>
      <h2 className='visually-hidden'>Экспортеры по всей стране</h2>
      <div className='container'>
        <div className={styles.exporteru__block}>
          <div className={styles.exporteru__title}>Экспортеры по всей стране</div>
          <p className={styles.exporteru__description}>
            Вам больше не нужно искать поставщиков в каждом регионе отдельно. Мы собрали для вас проверенных экспортеров
            со всей России
          </p>
        </div>
      </div>
    </section>
  )
}
