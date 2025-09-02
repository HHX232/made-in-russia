import {memo, useState, useCallback, useEffect} from 'react'
import styles from './VendorAdditionalContacts.module.scss'
import {useTranslations} from 'next-intl'
import Image from 'next/image'
import {useUpdateVendorDetails} from '@/api/useVendorApi'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {shallowEqual} from 'react-redux'
import {toast} from 'sonner'
import RowsInputs from '@/components/UI-kit/RowsInputs/RowsInputs'

const arrowDark = '/arrow-dark.svg'

export const VendorAdditionalContacts = memo(
  ({
    isOnlyShow = false,
    onlyShowEmails,
    onlyShowPhones,
    onlyShowWebsites
  }: {
    isOnlyShow?: boolean
    onlyShowEmails?: string[]
    onlyShowPhones?: string[]
    onlyShowWebsites?: string[]
  }) => {
    const [expanded, setExpanded] = useState(false)
    const t = useTranslations('VendorPage')
    const {mutate: updateVendorDetails} = useUpdateVendorDetails()
    const {updateVendorDetails: updateVendorDetailsAction} = useActions()

    const vendorDetails = useTypedSelector((s) => s.user.user?.vendorDetails, shallowEqual)
    const user = useTypedSelector((s) => s.user.user, shallowEqual)

    const [phoneRows, setPhoneRows] = useState<string[][]>([])
    const [emailRows, setEmailRows] = useState<string[][]>([])
    const [siteRows, setSiteRows] = useState<string[][]>([])

    useEffect(() => {
      console.log('phoneRows', phoneRows)
      console.log('emailRows', emailRows)
      console.log('siteRows', siteRows)
    }, [phoneRows, emailRows, siteRows])
    // Функция для преобразования массива строк в массив массивов для RowsInputs
    const convertToRows = (arr?: string[]): string[][] => {
      if (!arr || arr.length === 0) {
        return [['']] // Показываем 1 пустую строку если массив пустой
      }

      // Фильтруем только непустые значения
      const nonEmptyValues = arr.filter((value) => value && value.trim() !== '')

      if (nonEmptyValues.length === 0) {
        return [['']] // Если все значения пустые, показываем 1 пустую строку
      }

      // Возвращаем только непустые значения
      return nonEmptyValues.map((value) => [value])
    }

    // Функция для преобразования массива массивов обратно в массив строк
    const convertFromRows = (rows: string[][]): string[] => {
      return rows.map((row) => row[0] || '').filter((value) => value.trim() !== '')
    }

    useEffect(() => {
      if (isOnlyShow) {
        // Если режим только просмотра, используем переданные пропсы
        setPhoneRows(convertToRows(onlyShowPhones))
        setEmailRows(convertToRows(onlyShowEmails))
        setSiteRows(convertToRows(onlyShowWebsites))
      } else if (vendorDetails) {
        // Если обычный режим, используем данные из Redux
        setPhoneRows(convertToRows(vendorDetails.phoneNumbers))
        setEmailRows(convertToRows(vendorDetails.emails))
        setSiteRows(convertToRows(vendorDetails.sites))
      }
    }, [vendorDetails, isOnlyShow, onlyShowPhones, onlyShowEmails, onlyShowWebsites])

    const handlePhoneRowsChange = useCallback(
      (newRows: string[][]) => {
        if (isOnlyShow) return
        setPhoneRows(newRows)
      },
      [isOnlyShow]
    )

    const handleEmailRowsChange = useCallback(
      (newRows: string[][]) => {
        if (isOnlyShow) return
        setEmailRows(newRows)
      },
      [isOnlyShow]
    )

    const handleSiteRowsChange = useCallback(
      (newRows: string[][]) => {
        if (isOnlyShow) return
        setSiteRows(newRows)
      },
      [isOnlyShow]
    )

    const validateInputs = () => {
      const phones = convertFromRows(phoneRows)
      const emails = convertFromRows(emailRows)

      for (const phone of phones) {
        if (phone.trim() !== '' && phone.trim().length < 7) {
          toast.error(t('invalidPhone') || 'Phone number must be at least 7 characters long')
          return false
        }
      }

      for (const email of emails) {
        if (email.trim() !== '' && (!email.includes('@') || !email.includes('.'))) {
          toast.error(t('invalidEmail') || 'Email must contain @ and .')
          return false
        }
      }

      return true
    }

    const handleSave = useCallback(() => {
      if (isOnlyShow) return

      if (!validateInputs()) return

      const filteredPhoneNumbers = convertFromRows(phoneRows)
      const filteredEmails = convertFromRows(emailRows)
      const filteredSites = convertFromRows(siteRows)

      updateVendorDetailsAction({
        ...vendorDetails,
        phoneNumbers: filteredPhoneNumbers,
        emails: filteredEmails,
        sites: filteredSites
      })

      updateVendorDetails({
        categories:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vendorDetails?.productCategories?.map((cat) => cat.name) || (vendorDetails as any)?.categories || [],
        countries: vendorDetails?.countries?.map((country) => country) || [],
        description: vendorDetails?.description,
        inn: vendorDetails?.inn,
        phoneNumber: user?.phoneNumber,
        region: user?.region,
        phoneNumbers: filteredPhoneNumbers,
        emails: filteredEmails,
        sites: filteredSites
      })
    }, [
      phoneRows,
      emailRows,
      siteRows,
      vendorDetails,
      user,
      updateVendorDetails,
      updateVendorDetailsAction,
      isOnlyShow
    ])

    const handleOnBlur = useCallback(
      (type: 'phones' | 'emails' | 'sites') => {
        if (isOnlyShow) return

        switch (type) {
          case 'phones':
            updateVendorDetailsAction({...vendorDetails, phoneNumbers: convertFromRows(phoneRows)})
            break
          case 'emails':
            updateVendorDetailsAction({...vendorDetails, emails: convertFromRows(emailRows)})
            break
          case 'sites':
            updateVendorDetailsAction({...vendorDetails, sites: convertFromRows(siteRows)})
            break
        }
      },
      [vendorDetails, phoneRows, emailRows, siteRows, updateVendorDetailsAction, isOnlyShow]
    )

    return (
      <div className={`${styles.vendor__additional__contacts} ${expanded ? styles.expanded : ''}`}>
        <h3 className={styles.vendor__additional__contacts__title}>{t('additionalContacts')}</h3>
        {/* <p>Phones: {vendorDetails?.phoneNumbers?.join(', ')}</p>
        <p>Emails: {vendorDetails?.emails?.join(', ')}</p>
        <p>Sites: {vendorDetails?.sites?.join(', ')}</p> */}
        <div className={styles.additional__inner}>
          <div className={styles.additional__phones}>
            <h4 className={styles.additional__phones__title}>{t('phones')}</h4>
            <RowsInputs
              controlled={true}
              isOnlyShow={isOnlyShow}
              onBlur={() => handleOnBlur('phones')}
              externalValues={phoneRows}
              onSetValue={(rowIndex, inputIndex, value) => {
                if (isOnlyShow) return
                const newRows = [...phoneRows]
                newRows[rowIndex][inputIndex] = value
                setPhoneRows(newRows)
              }}
              onRowsChange={handlePhoneRowsChange}
              inputsTheme='superWhite'
              idNames={['phone']}
              maxRows={3}
              initialRowsCount={1}
              titles={['']}
              inputsInRowCount={1}
              buttonsSizes='small'
              showDnDButton={false}
              inputType={['text']}
            />
          </div>

          <div className={styles.additional__emails}>
            <h4 className={styles.additional__phones__title}>{t('emails')}</h4>
            <RowsInputs
              isOnlyShow={isOnlyShow}
              onBlur={() => handleOnBlur('emails')}
              controlled={true}
              externalValues={emailRows}
              idNames={['emails']}
              onSetValue={(rowIndex, inputIndex, value) => {
                if (isOnlyShow) return
                const newRows = [...emailRows]
                newRows[rowIndex][inputIndex] = value
                setEmailRows(newRows)
              }}
              onRowsChange={handleEmailRowsChange}
              inputsTheme='superWhite'
              maxRows={3}
              initialRowsCount={1}
              titles={['']}
              inputsInRowCount={1}
              buttonsSizes='small'
              showDnDButton={false}
              inputType={['text']}
            />
          </div>

          <div className={styles.additional__sites}>
            <h4 className={styles.additional__phones__title}>{t('sites')}</h4>
            <RowsInputs
              isOnlyShow={isOnlyShow}
              onBlur={() => handleOnBlur('sites')}
              controlled={true}
              externalValues={siteRows}
              idNames={['sites']}
              onSetValue={(rowIndex, inputIndex, value) => {
                if (isOnlyShow) return
                const newRows = [...siteRows]
                newRows[rowIndex][inputIndex] = value

                setSiteRows(newRows)
              }}
              onRowsChange={handleSiteRowsChange}
              inputsTheme='superWhite'
              maxRows={3}
              initialRowsCount={1}
              titles={['']}
              inputsInRowCount={1}
              buttonsSizes='small'
              showDnDButton={false}
              inputType={['text']}
            />
          </div>

          {!isOnlyShow && (
            <div className={styles.additional__buttons}>
              <button onClick={handleSave} className={styles.save__additional}>
                {t('save')}
              </button>
            </div>
          )}
        </div>

        {!expanded && (
          <div className={styles.expand__overlay} onClick={() => setExpanded(true)}>
            <Image className={styles.arrow} alt='' src={arrowDark} width={20} height={20} />
          </div>
        )}
      </div>
    )
  }
)

VendorAdditionalContacts.displayName = 'VendorAdditionalContacts'
