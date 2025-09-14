import {FC} from 'react'
import styles from './CreateFaqCard.module.scss'
import Image from 'next/image'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import RowsInputs from '@/components/UI-kit/RowsInputs/RowsInputs'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {useImageModal} from '@/hooks/useImageModal'
import {HELP_IMAGES} from '../CreateCard'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'

const vopros = '/vopros.svg'

interface CreateFaqCardProps {
  values?: string[][]
  onChange?: (values: string[][]) => void
}

const CreateFaqCard: FC<CreateFaqCardProps> = ({values, onChange}) => {
  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  const windowWidth = useWindowWidth()
  const t = useTranslations('CreateFaqCard')

  return (
    <div className={`${styles.create}`}>
      <ModalWindowDefault isOpen={isModalOpen} onClose={closeModal}>
        {modalImage && (
          <Image
            className={`${styles.drop__extra__image} ${styles.drop__extra__image__modal}`}
            src={modalImage}
            alt='Help image'
            width={1000}
            height={1000}
          />
        )}
      </ModalWindowDefault>
      <div className={`${styles.descr__el__title} ${styles.descr__el__title__right}`}>
        <p className={`${styles.descr__title}`}>{t('faqTitle')}</p>
        <DropList
          direction={windowWidth && windowWidth < 768 ? 'bottom' : 'right'}
          safeAreaEnabled
          extraClass={`${styles.drop__extra}`}
          positionIsAbsolute={false}
          trigger='hover'
          arrowClassName={`${styles.arrow__none}`}
          title={<Image src={vopros} alt='vopros' width={27} height={27} />}
          items={[
            <Image
              onClick={() => {
                openModal(HELP_IMAGES.faq)
              }}
              src={HELP_IMAGES.faq}
              alt='vopros'
              width={300}
              height={300}
              key={1}
            />
          ]}
        />
      </div>
      <RowsInputs
        idNames={['cy-question', 'cy-answer']}
        inputsInRowCount={2}
        maxRows={15}
        initialRowsCount={1}
        titles={[t('question'), t('answer')]}
        controlled={true}
        externalValues={values}
        onSetValue={(rowIndex, inputIndex, value) => {
          if (!onChange) return

          const newValues = values ? values.map((row) => [...row]) : []

          if (!newValues[rowIndex]) {
            newValues[rowIndex] = []
          }
          newValues[rowIndex][inputIndex] = value
          console.log('newValues', newValues)
          onChange(newValues)
        }}
        onRowsChange={onChange}
      />
    </div>
  )
}
export default CreateFaqCard
