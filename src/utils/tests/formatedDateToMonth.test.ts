import formatDateToDayMonth from '../formatedDateToMonth'
import {expect, describe, it} from '@jest/globals'

describe('formatDateToDayMonth', () => {
  const dateStr = '2023-05-16T14:45:00Z'

  it('formats date correctly in English by default', () => {
    expect(formatDateToDayMonth(dateStr)).toBe('16 May.')
  })

  it('formats date correctly in English explicitly', () => {
    expect(formatDateToDayMonth(dateStr, 'en')).toBe('16 May.')
  })

  it('formats date correctly in Russian', () => {
    expect(formatDateToDayMonth(dateStr, 'ru')).toBe('16 мая.')
  })

  it('formats date correctly in Chinese', () => {
    expect(formatDateToDayMonth(dateStr, 'zh')).toBe('16 五月.')
  })

  it('throws error on invalid date string', () => {
    expect(() => formatDateToDayMonth('invalid-date')).toThrow('Invalid date format')
  })

  it('throws error on unsupported language', () => {
    // @ts-expect-error testing invalid lang param
    expect(() => formatDateToDayMonth(dateStr, 'de')).toThrow('Unsupported language')
  })

  it('pads day with zero if day < 10', () => {
    const earlyDate = '2023-01-05T00:00:00Z'
    expect(formatDateToDayMonth(earlyDate, 'en')).toBe('05 Jan.')
  })
})
