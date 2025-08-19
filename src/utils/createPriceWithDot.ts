export function createPriceWithDot(numStr: string): string {
  const cleanStr = numStr.replace(/\./g, '')

  const number = Number(cleanStr)

  if (isNaN(number)) {
    throw new Error('Invalid number input')
  }

  // форматируем с разделителями "de-DE", потом заменяем обычный пробел
  return number.toLocaleString('de-DE').replace(/\./g, '\.\u00AD') // заменяем точки на soft hyphen
}

export function createPriceWithDotAlternative(numStr: string): string {
  const cleanStr = numStr.replace(/\./g, '')

  const parts = cleanStr.split(',')
  const integerPart = parts[0]
  const decimalPart = parts[1] ? `,&shy;${parts[1]}` : ''

  let formatted = ''
  let count = 0

  for (let i = integerPart.length - 1; i >= 0; i--) {
    formatted = integerPart[i] + '&shy;' + formatted
    count++
    if (count % 3 === 0 && i !== 0) {
      formatted = '.&shy;' + formatted
    }
  }

  return formatted + decimalPart
}
