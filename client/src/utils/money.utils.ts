export const toCurrency = (price: number) => {
  const money = new Intl.NumberFormat('en-US', {
    currency: 'usd',
    style: 'currency',
  }).format(price)
  return money.toString()
}
