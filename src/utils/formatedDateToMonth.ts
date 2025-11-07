function formatDateToDayMonth(inputDate: string, lang: 'ru' | 'en' | 'zh' = 'en'): string {
  const date = new Date(inputDate)

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }

  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  const monthNames: {[key: string]: string[]} = {
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    ru: [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря'
    ],
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  }

  if (!monthNames[lang]) {
    throw new Error('Unsupported language')
  }

  const monthName = monthNames[lang][monthIndex]

  if (lang === 'zh') {
    return `${year}年${monthName}${day}日`
  }

  return `${day} ${monthName} ${year}`
}
// Example usage:
// const inputDate = '2023-05-16T14:45:00Z';
// const formattedDateEn = formatDateToDayMonth(inputDate, 'en'); // "16 May."
// const formattedDateRu = formatDateToDayMonth(inputDate, 'ru'); // "16 мая."
// const formattedDateZh = formatDateToDayMonth(inputDate, 'zh'); // "16 五月."

export default formatDateToDayMonth
