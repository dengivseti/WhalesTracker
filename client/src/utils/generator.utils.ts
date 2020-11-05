import shortid from 'shortid'
// shortid.characters('0123456789abcdefghijklmnopqrstuvwxyz')

export const generateId = () => {
  return shortid.generate()
}
