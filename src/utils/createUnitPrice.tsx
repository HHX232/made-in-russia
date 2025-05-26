const renderPriceUnit = (
  priceUnit: string,
  firstPartClassNames: string[] = [],
  secondPartClassNames: string[] = []
) => {
  const slashIndex = priceUnit.indexOf('/')

  if (slashIndex === -1) {
    return <span className={firstPartClassNames.join(' ')}>{priceUnit}</span>
  }

  const firstPart = priceUnit.substring(0, slashIndex)
  const secondPart = priceUnit.substring(slashIndex)

  return (
    <>
      <span className={firstPartClassNames.join(' ')}>{firstPart}</span>
      <span className={secondPartClassNames.join(' ')}>{secondPart}</span>
    </>
  )
}

export default renderPriceUnit
