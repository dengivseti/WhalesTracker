const path = require('path')
const redis = require('./redis')
const readFiles = require('./readFiles.utils')
const clearIp = require('./ip.utils')

async function setArray(key, arr) {
  const multi = redis.multi()
  multi.del(key)
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < arr.length; i++) {
    multi.rpush(key, arr[i])
  }
  multi.exec()
}

const getBlackIps = async () => {
  const ips = await readFiles(
    path.join(__dirname, '../', 'dist', 'ips.dat'),
  )
  const blackIps = clearIp(ips)
  await setArray('blackIps', blackIps)
  return blackIps
}

const getBlackSignature = async () => {
  const signatures = await readFiles(
    path.join(__dirname, '../', 'dist', 'signature.dat'),
  )
  const blackSignatures = signatures.filter((str) => str.trim())
  await setArray('blackSignatures', blackSignatures)
  return blackSignatures
}

const getUrls = async () => {
  const urls = await readFiles(
    path.join(__dirname, '../', 'dist', 'remote.dat'),
  )
  const listUrl = urls.filter((str) => str.trim())
  await setArray('listUrl', listUrl)
  return listUrl
}

async function getCountArray(key) {
  try {
    return await redis.llen(key)
  } catch (e) {
    return 0
  }
}

async function getArray(key) {
  try {
    const arr = await redis.lrange(key, 0, -1)
    if (arr && arr.length) {
      return arr
    }
    let arrays = []
    switch (key) {
      case 'blackIps':
        arrays = await getBlackIps()
        break
      case 'blackSignatures':
        arrays = await getBlackSignature()
        break
      case 'listUrl':
        arrays = await getUrls()
        break
      default:
        break
    }
    return arrays
  } catch (e) {
    return []
  }
}

async function readArrays() {
  await getBlackIps()
  await getBlackSignature()
  await getUrls()
}

module.exports = {
  setArray,
  getArray,
  readArrays,
  getCountArray,
}
