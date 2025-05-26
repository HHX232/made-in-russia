export function createPriceWithDot(numStr: string): string {
  const cleanStr = numStr.replace(/\./g, '')

  const number = Number(cleanStr)

  if (isNaN(number)) {
    throw new Error('Invalid number input')
  }

  return number.toLocaleString('de-DE')
}

export function createPriceWithDotAlternative(numStr: string): string {
  const cleanStr = numStr.replace(/\./g, '')

  const parts = cleanStr.split(',')
  const integerPart = parts[0]
  const decimalPart = parts[1] ? `,${parts[1]}` : ''

  let formatted = ''
  let count = 0

  for (let i = integerPart.length - 1; i >= 0; i--) {
    formatted = integerPart[i] + formatted
    count++
    if (count % 3 === 0 && i !== 0) {
      formatted = '.' + formatted
    }
  }

  return formatted + decimalPart
}
