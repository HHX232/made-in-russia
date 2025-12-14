import getDatesDifference from '../getDatesDifference'
import {expect, describe, it} from '@jest/globals'

describe('getDatesDifference', () => {
  it('should return correct difference in days for valid Date objects', () => {
    const result = getDatesDifference({
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-10')
    })

    expect(result).toBe(9)
  })

  it('should return correct difference for string date inputs', () => {
    const result = getDatesDifference({
      startDate: '2023-01-01',
      endDate: '2023-01-05'
    })
    expect(result).toBe(4)
  })

  it('should return correct difference for timestamp inputs', () => {
    const start = new Date('2023-01-01').getTime()
    const end = new Date('2023-01-03').getTime()
    const result = getDatesDifference({startDate: start, endDate: end})
    expect(result).toBe(2)
  })

  it('should return null if endDate is null', () => {
    const result = getDatesDifference({startDate: '2023-01-01', endDate: null})
    expect(result).toBeNull()
  })

  it('should return null if endDate is undefined', () => {
    const result = getDatesDifference({startDate: '2023-01-01', endDate: undefined})
    expect(result).toBeNull()
  })

  it('should return null if startDate is invalid', () => {
    const result = getDatesDifference({startDate: 'invalid-date', endDate: '2023-01-10'})
    expect(result).toBeNull()
  })

  it('should return null if endDate is invalid', () => {
    const result = getDatesDifference({startDate: '2023-01-01', endDate: 'invalid-date'})
    expect(result).toBeNull()
  })

  it('should return 0 if startDate and endDate are the same day', () => {
    const result = getDatesDifference({startDate: '2023-01-01', endDate: '2023-01-01'})
    expect(result).toBe(0)
  })

  it('should return negative number if endDate is before startDate', () => {
    const result = getDatesDifference({
      startDate: '2023-01-10',
      endDate: '2023-01-01'
    })
    expect(result).toBe(-9)
  })
})
