function formatDateToDayMonth(inputDate: string): string {
  const date = new Date(inputDate)

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }

  const day = date.getDate().toString().padStart(2, '0')
  const monthIndex = date.getMonth()

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const monthName = monthNames[monthIndex]

  return `${day} ${monthName}.`
}

// Пример использования
const inputDate = '2023-05-16T14:45:00Z'
const formattedDate = formatDateToDayMonth(inputDate) // "16 May."
console.log(formattedDate)

export default formatDateToDayMonth
