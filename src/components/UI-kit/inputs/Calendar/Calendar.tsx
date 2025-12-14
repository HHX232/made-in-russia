import React, {useState, useEffect} from 'react'

interface CalendarProps {
  selectedDate?: string
  onDateSelect: (date: string) => void
  minDate?: string
  maxDate?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate = '',
  onDateSelect,
  minDate,
  maxDate,
  placeholder = 'Выберите дату',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(selectedDate ? new Date(selectedDate) : null)

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate)
      setSelectedDateObj(date)
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }, [selectedDate])

  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ]

  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Получаем день недели первого дня месяца (0 = воскресенье, преобразуем в 0 = понедельник)
    let startDay = firstDay.getDay()
    startDay = startDay === 0 ? 6 : startDay - 1

    const days = []

    // Добавляем пустые дни в начале
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return placeholder
    return date.toLocaleDateString('ru-RU')
  }

  const isDateDisabled = (date: Date) => {
    if (disabled) return true

    const dateStr = formatDate(date)

    if (minDate && dateStr < minDate) return true
    if (maxDate && dateStr > maxDate) return true

    return false
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return

    setSelectedDateObj(date)
    onDateSelect(formatDate(date))
    setIsOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setFullYear(newMonth.getFullYear() - 1)
      } else {
        newMonth.setFullYear(newMonth.getFullYear() + 1)
      }
      return newMonth
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDateObj && date.toDateString() === selectedDateObj.toDateString()
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className={`calendar-container ${className}`}>
      <div className={`calendar-input ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <span className={selectedDateObj ? 'selected' : 'placeholder'}>{formatDisplayDate(selectedDateObj)}</span>
        <svg
          className={`calendar-icon ${isOpen ? 'rotated' : ''}`}
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
        >
          <path
            d='M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>

      {isOpen && (
        <div className='calendar-dropdown'>
          <div className='calendar-header'>
            <div className='calendar-nav'>
              <button type='button' className='nav-button year-nav' onClick={() => navigateYear('prev')}>
                ‹‹
              </button>
              <button type='button' className='nav-button' onClick={() => navigateMonth('prev')}>
                ‹
              </button>
            </div>

            <div className='calendar-title'>
              <span className='month-year'>
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </div>

            <div className='calendar-nav'>
              <button type='button' className='nav-button' onClick={() => navigateMonth('next')}>
                ›
              </button>
              <button type='button' className='nav-button year-nav' onClick={() => navigateYear('next')}>
                ››
              </button>
            </div>
          </div>

          <div className='calendar-weekdays'>
            {weekdays.map((day) => (
              <div key={day} className='weekday'>
                {day}
              </div>
            ))}
          </div>

          <div className='calendar-days'>
            {days.map((date, index) => (
              <div key={index} className='day-cell'>
                {date && (
                  <button
                    type='button'
                    className={`day-button ${isSelected(date) ? 'selected' : ''} ${
                      isToday(date) ? 'today' : ''
                    } ${isDateDisabled(date) ? 'disabled' : ''}`}
                    onClick={() => handleDateClick(date)}
                    disabled={isDateDisabled(date)}
                  >
                    {date.getDate()}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          position: relative;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .calendar-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 48px;
          box-sizing: border-box;
        }

        .calendar-input:hover:not(.disabled) {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .calendar-input.disabled {
          background: #f8f9fa;
          border-color: #e9ecef;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .calendar-input .selected {
          color: #1a1a1a;
          font-weight: 500;
        }

        .calendar-input .placeholder {
          color: #6b7280;
        }

        .calendar-icon {
          color: #6b7280;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .calendar-icon.rotated {
          transform: rotate(180deg);
        }

        .calendar-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #ffffff;
          border: 1px solid #e1e5e9;
          border-radius: 16px;
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          margin-top: 8px;
          padding: 20px;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .calendar-nav {
          display: flex;
          gap: 4px;
        }

        .nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          color: #374151;
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .nav-button.year-nav {
          font-weight: bold;
          font-size: 14px;
        }

        .calendar-title {
          flex: 1;
          text-align: center;
        }

        .month-year {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }

        .weekday {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .day-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
        }

        .day-button {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .day-button:hover:not(.disabled) {
          background: #f3f4f6;
          color: #1f2937;
        }

        .day-button.today {
          background: #ddd6fe;
          color: #5b21b6;
          font-weight: 600;
        }

        .day-button.selected {
          background: #4f46e5;
          color: #ffffff;
          font-weight: 600;
        }

        .day-button.selected:hover {
          background: #4338ca;
        }

        .day-button.disabled {
          color: #d1d5db;
          cursor: not-allowed;
          background: transparent;
        }

        .day-button.disabled:hover {
          background: transparent;
          color: #d1d5db;
        }
      `}</style>
    </div>
  )
}

export default Calendar
