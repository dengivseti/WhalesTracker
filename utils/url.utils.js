const DateFnsUtils = require('date-fns')
const Remote = require('../models/Remote')
const Offer = require('../models/Offer')

const splitUrl = (data) => {
  let acc = 0
  const values = data.map((value) => value.url)
  const weights = data.map((value) => value.percent)
  const sum = weights.reduce((res, current) => res + current, 0)
  const weightsSum = weights.map((el) => {
    acc += el
    return acc
  })
  const rand = Math.random() * sum
  return values[weightsSum.filter((el) => el <= rand).length]
}

const evelyUrl = (data) => {
  const values = data.map((value) => value.url)
  return values[Math.floor(Math.random() * values.length)]
}

const rotatorUrl = (data, count) => {
  const urls = data.map((value) => value.url)
  return urls[count % urls.length]
}

const getUrlRemote = async (query) => {
  const time = new Date()
  if (!query) {
    return global.listUrl[
      Math.floor(Math.random() * global.listUrl.length)
    ]
  }
  const canditate = await Remote.findOne({ query })
  if (canditate) {
    return canditate.url
  }
  if (global.listUrl.length > 0) {
    const url =
      global.listUrl[
        Math.floor(Math.random() * global.listUrl.length)
      ]
    const remote = new Remote({
      query,
      url,
      expireAt: DateFnsUtils.addDays(time, global.clearRemote),
    })
    remote.save()
    return url
  }
  return global.trashUrl
}

const getUrlOffer = async (id, count) => {
  let url
  const findOffer = await Offer.findById(id)
  if (!findOffer) {
    return global.trashUrl
  }
  const { offers, type } = findOffer
  if (offers.length === 1) {
    return offers[0].url
  }
  switch (type) {
    case 'split':
      url = splitUrl(offers)
      break
    case 'evely':
      url = evelyUrl(offers)
      break
    case 'rotator':
      url = rotatorUrl(offers, count)
      break
    default:
      url = global.trashUrl
  }
  return url
}

module.exports = async (
  typeRedirect,
  value,
  subid,
  query = '',
  count = 0,
) => {
  let url = value
  url = url.replace('[subid]', subid)
  switch (typeRedirect) {
    case 'remote':
      url = await getUrlRemote(query)
      break
    case 'offer':
      url = await getUrlOffer(url, count)
      break
    default:
      break
  }
  return url
}
