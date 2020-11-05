const Filter = require('./filters')

module.exports = async (user, stream) => {
  let isUsed = true
  const { relation } = stream
  let filters = stream.filters || []
  if (!filters.length) {
    return false
  }
  filters = filters.sort((a, b) => (a.position > b.position ? 1 : -1))
  const filter = new Filter(user)
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < filters.length; i++) {
    const { name } = filters[i]
    const { action } = filters[i]
    const result = filter.filtration(name, action)
    if (!relation && result) {
      return true
    }
    if (relation && !result) {
      return false
    }
    if (relation) {
      isUsed = result && isUsed
    } else {
      isUsed = false
    }
  }
  return isUsed
}
