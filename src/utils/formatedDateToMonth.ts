function formatDateToDayMonth(inputDate: string, lang: 'ru' | 'en' | 'zh' = 'en'): string {
  const date = new Date(inputDate)

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }

  const day = date.getDate().toString().padStart(2, '0')
  const monthIndex = date.getMonth()

  const monthNames: {[key: string]: string[]} = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  }

  if (!monthNames[lang]) {
    throw new Error('Unsupported language')
  }

  const monthName = monthNames[lang][monthIndex]
  return `${day} ${monthName}.`
}

// Example usage:
// const inputDate = '2023-05-16T14:45:00Z';
// const formattedDateEn = formatDateToDayMonth(inputDate, 'en'); // "16 May."
// const formattedDateRu = formatDateToDayMonth(inputDate, 'ru'); // "16 мая."
// const formattedDateZh = formatDateToDayMonth(inputDate, 'zh'); // "16 五月."

export default formatDateToDayMonth
