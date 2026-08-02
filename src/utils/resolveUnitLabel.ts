export const VALID_UNIT_SLUGS = new Set([
  'mg',
  'g',
  'kg',
  'c',
  't',
  'ml',
  'l',
  'hl',
  'm3',
  'm2',
  'cm2',
  'pcs',
  'pack',
  'm',
  'cm',
  'pair',
  'set',
  'box',
  'bag'
])

const hasLatinLetters = (value: string) => /[a-zA-Z]/.test(value)

/**
 * Backend can send `unit` either already localized (e.g. "шт") or as a raw
 * English/slug value (e.g. "pcs"). If the active locale is Russian and the
 * value still contains Latin letters, fall back to the `unitSlug` translation
 * from the `ReviewsToNumber` i18n namespace instead of showing it as-is.
 */
export const resolveUnitLabel = (
  unit: string | undefined | null,
  unitSlug: string | undefined | null,
  locale: string,
  translateUnitSlug: (slug: string) => string
): string => {
  if (!unit) return ''

  if (locale !== 'ru') {
    return unit
  }

  if (!hasLatinLetters(unit)) {
    return unit
  }

  if (unitSlug && VALID_UNIT_SLUGS.has(unitSlug)) {
    return translateUnitSlug(unitSlug)
  }

  return unit
}
