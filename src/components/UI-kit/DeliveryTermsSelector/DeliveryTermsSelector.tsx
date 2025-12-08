'use client'
import {useState, useEffect, useRef} from 'react'
import Image from 'next/image'
import styles from './DeliveryTermsSelector.module.scss'
import {axiosClassic} from '@/api/api.interceptor'
import {HELP_IMAGES} from '@/components/pages/CreateCard/CreateCard'
// import DropList from '../Texts/DropList/DropList'
import {useImageModal} from '@/hooks/useImageModal'
// import useWindowWidth from '@/hooks/useWindoWidth'
import ModalWindowDefault from '../modals/ModalWindowDefault/ModalWindowDefault'

const plusCircle = '/create-card/plus-circle.svg'
const minusCircle = '/create-card/minusCircle.svg'
const deliveryTermsImage = '/del.jpeg'
const vopros = '/vopros.svg'

export interface DeliveryTerm {
  id: string
  code: string
  name: string
  description: string
}

interface DeliveryTermsSelectorProps {
  title?: string
  availableTerms?: DeliveryTerm[]
  selectedTermIds?: string[]
  onChange?: (selectedIds: string[]) => void
  maxSelections?: number
  placeholder?: string
  errorMessage?: string
  useNewTheme?: boolean
  helpImageSrc?: string
}

const DEFAULT_DELIVERY_TERMS: DeliveryTerm[] = [
  {
    id: 'exw',
    code: 'EXW',
    name: 'Ex Works — Франко Завод',
    description:
      'Популярный термин, который можно упрощенно назвать «самовывоз». Продавец предоставляет товар в распоряжение покупателя в своем помещении — на складе, на предприятии или в другом оговоренном месте.'
  },
  {
    id: 'fca',
    code: 'FCA',
    name: 'Free Carrier — Франко Перевозчик',
    description:
      'Продавец передает товар перевозчику или другому лицу, которого выбрал покупатель. Передача происходит в помещениях продавца или в других ранее согласованных местах.'
  },
  {
    id: 'cpt',
    code: 'CPT',
    name: 'Carriage Paid to — Перевозка оплачена до',
    description:
      'Передача груза продавцом перевозчику или иному лицу, номинированному продавцом, осуществляется в согласованном сторонами месте. Продавец оформляет договор перевозки и берет на себя расходы.'
  },
  {
    id: 'cip',
    code: 'CIP',
    name: 'Carriage and Insurance Paid to — Фрахт/перевозка и страхование оплачены до',
    description:
      'Ответственность от продавца к покупателю переходит в терминале прибытия, при этом грузоперевозка оплачивается продавцом. Кроме перевозки на продавца возлагается страхование груза.'
  },
  {
    id: 'dat',
    code: 'DAT',
    name: 'Delivered at Terminal — Поставка на терминале',
    description:
      'Продавец обязан осуществить поставку только тогда, когда товары, которые разгрузили с прибывшего ТС, предоставлены покупателям в согласованном сторонами терминале поименованного порта.'
  },
  {
    id: 'dap',
    code: 'DAP',
    name: 'Delivered at Place — Поставка в месте назначения',
    description:
      'Продавец осуществляет поставку тогда, когда товар доставлен покупателю в заранее оговоренное сторонами место. Риски, которые связаны с транспортировкой груза, лежат на продавце.'
  },
  {
    id: 'ddp',
    code: 'DDP',
    name: 'Delivered Duty Paid — Поставка с оплатой пошлин',
    description:
      'Поставка, которую осуществляют продавцы, когда груз, очищенный от таможенных пошлин, необходимых для импорта, на ТС предоставлен покупателям. За риски и расходы несет ответственность продавец.'
  },
  {
    id: 'fas',
    code: 'FAS',
    name: 'Free Alongside Ship — Свободно вдоль борта судна',
    description:
      'Продавец будет считаться выполнившим свои обязательства, когда разместит товар вдоль борта судна, номинированного покупателем в согласованном порту.'
  },
  {
    id: 'fob',
    code: 'FOB',
    name: 'Free on Board — Свободно на борту',
    description:
      'Продавец поставляет товар на борт судна, которое номинировал покупатель, в заранее оговоренном порту отгрузки. Когда товар находится на борту судна, происходит переход рисков.'
  },
  {
    id: 'cfr',
    code: 'CFR',
    name: 'Cost and Freight — Стоимость и фрахт',
    description:
      'Продавец обязуется доставить товар на борт судна или предоставить товар таким образом. Фрахт и расходы, которые связаны с доставкой товара до оговоренного порта, оплачивает продавец.'
  },
  {
    id: 'cif',
    code: 'CIF',
    name: 'Cost Insurance and Freight — Стоимость, страхование и фрахт',
    description:
      'Продавец обязуется осуществить поставку товара на борт судна. Фрахт и расходы для транспортировки товара до порта назначения оплачивает продавец, который также оформляет договор страхования.'
  }
]

const DeliveryTermsSelector = ({
  title = 'Условия поставки инкотермс',
  availableTerms = DEFAULT_DELIVERY_TERMS,
  selectedTermIds = [],
  onChange,
  maxSelections = 11,
  placeholder = 'Выберите условия поставки',
  errorMessage = '',
  useNewTheme = true,
  helpImageSrc = deliveryTermsImage
}: DeliveryTermsSelectorProps) => {
  // Инициализируем с одним пустым элементом, если selectedTermIds пустой
  const initialSelectedIds = selectedTermIds.length > 0 ? selectedTermIds : ['']
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(initialSelectedIds)
  // Первый dropdown открыт по умолчанию, только если первый элемент пустой
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeTerms, setActiveTerms] = useState<DeliveryTerm[]>(availableTerms)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const {modalImage, isModalOpen: isHelpModalOpen, openModal, closeModal} = useImageModal()
  // const windowWidth = useWindowWidth()

  useEffect(() => {
    if (!isFirstRender) {
      setLocalSelectedIds(selectedTermIds.length > 0 ? selectedTermIds : [''])
    }
  }, [selectedTermIds, isFirstRender])

  useEffect(() => {
    const fetchTerms = async () => {
      const temsFromServer = await axiosClassic.get('/delivery-terms')
      console.log('temsFromServer', temsFromServer)
      setActiveTerms(temsFromServer.data as DeliveryTerm[])
    }
    fetchTerms()
    setIsFirstRender(false)
  }, [])

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownIndex !== null) {
        const currentRef = dropdownRefs.current[openDropdownIndex]
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setOpenDropdownIndex(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownIndex])

  const handleSelect = (rowIndex: number, termId: string) => {
    const newSelectedIds = [...localSelectedIds]
    newSelectedIds[rowIndex] = termId

    setLocalSelectedIds(newSelectedIds)
    setOpenDropdownIndex(null)

    if (onChange) {
      onChange(newSelectedIds)
    }
  }

  const handleAddRow = () => {
    if (localSelectedIds.length >= maxSelections) return

    const newSelectedIds = [...localSelectedIds, '']
    setLocalSelectedIds(newSelectedIds)
  }

  const handleRemoveRow = (rowIndex: number) => {
    if (localSelectedIds.length <= 1) return

    const newSelectedIds = localSelectedIds.filter((_, index) => index !== rowIndex)
    setLocalSelectedIds(newSelectedIds)

    if (onChange) {
      onChange(newSelectedIds)
    }
  }

  const getAvailableTermsForRow = (currentRowIndex: number): DeliveryTerm[] => {
    const selectedIdsExceptCurrent = localSelectedIds.filter((_, index) => index !== currentRowIndex)
    return activeTerms.filter((term) => !selectedIdsExceptCurrent.includes(term.id))
  }

  const getSelectedTerm = (termId: string): DeliveryTerm | undefined => {
    return activeTerms.find((term) => term.id === termId)
  }
  {
    /* <DropList
                    direction={windowWidth && windowWidth < 768 ? 'bottom' : 'left'}
                    safeAreaEnabled
                    extraClass={`${styles.drop__extra}`}
                    positionIsAbsolute={false}
                    trigger='hover'
                    arrowClassName={`${styles.arrow__none}`}
                    title={<Image src={vopros} alt='question' width={27} height={27} />}
                    items={[
                      <Image
                        onClick={() => openModal(HELP_IMAGES.delivery)}
                        src={HELP_IMAGES.delivery}
                        alt='question'
                        width={300}
                        height={300}
                        key={1}
                      />
                    ]}
                  /> */
  }
  return (
    <div className={styles.delivery__terms__wrapper}>
      <ModalWindowDefault isOpen={isHelpModalOpen} onClose={closeModal}>
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
      <div className={styles.delivery__terms__header}>
        {title && (
          <div className={styles.title__wrapper}>
            <h3 className={styles.delivery__terms__title}>{title}</h3>
            {/* <DropList
              direction={windowWidth && windowWidth < 768 ? 'bottom' : 'left'}
              safeAreaEnabled
              extraClass={`${styles.drop__extra}`}
              positionIsAbsolute={false}
              trigger='hover'
              arrowClassName={`${styles.arrow__none}`}
              title={<Image src={vopros} alt='question' width={27} height={27} />}
              items={[
                <Image
                  onClick={() => openModal(HELP_IMAGES.delivery)}
                  src={HELP_IMAGES.delivery}
                  alt='question'
                  width={300}
                  height={300}
                  key={1}
                />
              ]}
            /> */}
            <Image
              onClick={() => openModal(HELP_IMAGES.delivery)}
              src={vopros}
              style={{cursor: 'pointer'}}
              alt='vopros'
              width={27}
              height={27}
            />
          </div>
        )}
        <button type='button' className={styles.help__button} onClick={() => setIsModalOpen(true)}>
          Описание методов
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modal__overlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal__content} onClick={(e) => e.stopPropagation()}>
            <button
              type='button'
              className={styles.modal__close}
              onClick={() => setIsModalOpen(false)}
              aria-label='Закрыть'
            >
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path d='M18 6L6 18' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M6 6L18 18' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </button>
            <Image
              src={helpImageSrc}
              alt='Описание методов поставки'
              width={1200}
              height={800}
              className={styles.modal__image}
            />
          </div>
        </div>
      )}

      <div className={styles.delivery__terms__container}>
        {localSelectedIds.map((selectedId, rowIndex) => {
          const selectedTerm = getSelectedTerm(selectedId)
          const availableTermsForRow = getAvailableTermsForRow(rowIndex)
          const isOpen = openDropdownIndex === rowIndex

          return (
            <div key={rowIndex} className={styles.delivery__term__row}>
              <div
                className={styles.dropdown__wrapper}
                ref={(el) => {
                  dropdownRefs.current[rowIndex] = el
                }}
              >
                <div
                  className={`${styles.dropdown__trigger} ${!selectedId && errorMessage ? styles.dropdown__error : ''}`}
                  onClick={() => setOpenDropdownIndex(isOpen ? null : rowIndex)}
                >
                  {selectedTerm ? (
                    <div className={styles.selected__term}>
                      <span className={styles.selected__term__code}>{selectedTerm.code}</span>
                      <span className={styles.selected__term__name}>{selectedTerm.name}</span>
                    </div>
                  ) : (
                    <span className={styles.dropdown__placeholder}>{placeholder}</span>
                  )}
                  <svg
                    className={`${styles.dropdown__arrow} ${isOpen ? styles.dropdown__arrow__open : ''}`}
                    width='20'
                    height='20'
                    viewBox='0 0 20 20'
                    fill='none'
                  >
                    <path
                      d='M5 7.5L10 12.5L15 7.5'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>

                {isOpen && (
                  <div className={styles.dropdown__list}>
                    {availableTermsForRow.length === 0 ? (
                      <div className={styles.dropdown__no__options}>Все условия уже выбраны</div>
                    ) : (
                      availableTermsForRow.map((term) => (
                        <div
                          key={term.id}
                          className={`${styles.dropdown__option} ${selectedId === term.id ? styles.dropdown__option__selected : ''}`}
                          onClick={() => handleSelect(rowIndex, term.id)}
                        >
                          <div className={styles.option__code}>{term.code}</div>
                          <div className={styles.option__name}>{term.name}</div>
                          <div className={styles.option__description}>{term.description}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                className={`${styles.remove__button} ${useNewTheme ? styles.remove__button__new : ''}`}
                onClick={() => handleRemoveRow(rowIndex)}
                type='button'
                disabled={localSelectedIds.length === 1}
                aria-label='Удалить условие'
              >
                {useNewTheme ? (
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <path
                      d='M18 6L6 18'
                      stroke='#2F2F2F'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M6 6L18 18'
                      stroke='#2F2F2F'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                ) : (
                  <Image src={minusCircle} alt='minus' width={39} height={39} />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {localSelectedIds.length < maxSelections && (
        <button
          className={`${styles.add__button} ${useNewTheme ? styles.add__button__new : ''}`}
          onClick={handleAddRow}
          type='button'
          aria-label='Добавить условие'
        >
          {useNewTheme ? (
            <div className={styles.add__button__content}>
              <span>Добавить условие поставки</span>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path d='M6 12H18' stroke='#2F2F2F' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M12 18V6' stroke='#2F2F2F' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
          ) : (
            <Image src={plusCircle} alt='plus' width={39} height={39} />
          )}
        </button>
      )}

      {errorMessage && <div className={styles.error__message}>{errorMessage}</div>}
    </div>
  )
}

export default DeliveryTermsSelector
