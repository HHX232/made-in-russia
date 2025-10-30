import React, {useRef} from 'react'
import styles from './RadioButtonUI.module.scss'

export interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  useRect?: boolean
  extraClassName?: string
  textColor?: 'dark' | 'white'
  extraStyle?: React.CSSProperties
  /**
   * Whether the input is checked
   */
  checked?: boolean
  /**
   * Callback fired when the state is changed
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * Name attribute for the input element
   */
  name?: string
  /**
   * Value attribute for the input element
   */
  value?: string
  /**
   * Whether the input is disabled
   */
  disabled?: boolean
  /**
   * Required attribute for the input element
   */
  required?: boolean
  /**
   * Allow unchecking by clicking on the same radio button
   */
  allowUnchecked?: boolean
  /**
   * Custom click handler for label
   */
  onCustomClick?: () => void
}

/**
 * Custom radio button component with green fill and check mark
 */
const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  extraClassName = '',
  extraStyle,
  useRect,
  checked = false,
  onChange,
  name,
  value,
  disabled = false,
  required = false,
  allowUnchecked = false,
  onCustomClick,
  id,
  textColor = 'white',
  ...rest
}) => {
  // Generate unique ID if not provided
  const inputId = id || `radio-${Math.random().toString(36).substring(2, 9)}`
  const inputRef = useRef<HTMLInputElement>(null)

  // Обработчик клика по всему компоненту вместо стандартного onChange
  const handleLabelClick = (e: React.MouseEvent) => {
    // Предотвращаем стандартное поведение радио-кнопки
    if (allowUnchecked && checked) {
      e.preventDefault()

      // Если кнопка уже выбрана и разрешено снятие выбора,
      // вызываем пользовательский обработчик с событием, сигнализирующим снятие выбора
      if (inputRef.current && onChange) {
        const syntheticEvent = {
          target: {
            name: inputRef.current.name,
            value: '',
            checked: false,
            type: 'radio'
          },
          currentTarget: inputRef.current,
          preventDefault: () => {},
          stopPropagation: () => {}
        } as unknown as React.ChangeEvent<HTMLInputElement>

        onChange(syntheticEvent)
      }

      // Дополнительный пользовательский обработчик (если есть)
      if (onCustomClick) {
        onCustomClick()
      }
    }
  }

  return (
    <div className={`${styles.radioButtonContainer} ${extraClassName}`} style={extraStyle}>
      <div className={styles.radioButtonWrapper}>
        <input
          ref={inputRef}
          type='radio'
          id={inputId}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={styles.hiddenInput}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={`${styles.radioButtonLabel} ${disabled ? styles.disabled : ''}`}
          onClick={allowUnchecked && checked ? handleLabelClick : undefined}
        >
          <span
            className={`
            ${styles.radioButtonCheckmark} 
            ${checked ? styles.checked : ''}
            ${useRect ? styles.rect__chekMark : ''}
          `}
          >
            {checked && (
              <svg
                width='16'
                height='12'
                viewBox='0 0 16 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className={styles.checkIcon}
              >
                <path
                  d='M14.225 0.537476L5.37498 9.38748L1.77498 5.78748L0.724976 6.87498L5.37498 11.4875L15.275 1.58748L14.225 0.537476Z'
                  fill='white'
                />
              </svg>
            )}
          </span>
          {label && (
            <span style={{color: textColor === 'dark' ? '#2A2E46' : '#fff'}} className={styles.labelText}>
              {label}
            </span>
          )}
        </label>
      </div>
    </div>
  )
}

export default RadioButton
