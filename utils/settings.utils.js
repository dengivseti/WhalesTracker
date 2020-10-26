const shortid = require('shortid')
const Redis = require('ioredis')
const Setting = require('../models/Setting')
const { readArrays } = require('./arrayRedis.utils')

const redis = new Redis()

const objSetting = {
  postbackKey: shortid.generate().toLowerCase(),
  clearDayStatistic: '30',
  theme: 'light',
  language: 'English',
  trash: 'url',
  trashUrl: 'http://example.com',
  logLimitClick: '150',
  logLimitAmount: '50',
  getKey: 'q',
  protect: '0',
  sendTelegram: '0',
  telegramBotToken: '',
  telegramChatId: '',
  clearRemote: '30',
}

exports.getStartValueSettings = async () => {
  const mongoSettings = await Setting.find()
  const settings = {}
  await readArrays()
  // eslint-disable-next-line no-return-assign
  mongoSettings.map((item) => (settings[item.key] = item.value))
  const keys = Object.keys(objSetting)
  keys.forEach((key) => {
    if (settings[key]) {
      redis.set(key, settings[key])
    } else {
      redis.set(key, objSetting[key])
      if (objSetting[key]) {
        new Setting({
          key,
          value: objSetting[key],
        }).save()
      }
    }
  })
}

exports.getSetting = async (key) => {
  const value = await redis.get(key)
  if (value) {
    return value
  }
  const mongoValue = await Setting.findOne({ key })
  if (mongoValue && mongoValue.value) {
    await redis.set(key, mongoValue.value)
    return mongoValue.value
  }
  await redis.set(key, objSetting[key])
  return objSetting[key]
}

exports.delSetting = async (key) => {
  await redis.del(key)
}

exports.setSetting = async (key, value) => {
  await redis.set(key, value)
}
