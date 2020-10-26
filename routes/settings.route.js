const { Router } = require('express')
const { validationResult } = require('express-validator')
const DateFnsUtils = require('date-fns')
const path = require('path')
const auth = require('../middleware/auth.middleware')
const { editSetting } = require('../utils/validators.utils')
const Setting = require('../models/Setting')
const Statistic = require('../models/Statistic')
const clearIp = require('../utils/ip.utils')
const writeFiles = require('../utils/writeFiles.utils')
const { setSetting, getSetting } = require('../utils/settings.utils')
const {
  getCountArray,
  getArray,
  setArray,
} = require('../utils/arrayRedis.utils')

const router = Router()
const arrays = ['blackIps', 'blackSignatures', 'listUrl']

router.get('/info', auth, async (req, res) => {
  try {
    const general = {}
    const options = await Setting.find()
    options.forEach((option) => {
      general[option.key] = option.value
    })
    const data = {
      general: general || null,
      intBlackIp: await getCountArray('blackIps'),
      intBlackSignature: await getCountArray('blackSignatures'),
      intRemoteUrl: await getCountArray('listUrl'),
    }
    return res.json({
      ...data,
    })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/info/list', auth, async (req, res) => {
  try {
    const typeList = req.query.type
    if (arrays.includes(typeList)) {
      const list = await getArray(typeList)
      return res.json({
        type: typeList,
        data: list ? list.filter((str) => str.trim()) : [],
      })
    }
    return res.status(500).json({ message: 'Something went wrong' })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/edit/general', auth, editSetting, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }
    Object.keys(req.body).forEach(async (key) => {
      await setSetting(key, req.body[key])
      await Setting.where({ key }).updateOne({
        value: req.body[key],
      })
    })
    if (
      req.body &&
      req.body.clearDayStatistic &&
      req.body.clearDayStatistic <
        (await getSetting('clearDayStatistic'))
    ) {
      const date = DateFnsUtils.startOfDay(
        DateFnsUtils.subDays(new Date(), +req.body.clearDayStatistic),
      )
      await Statistic.deleteMany({ date: { $lt: date } })
    }
    return res.json({ status: 'OK' })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('/edit/list', auth, async (req, res) => {
  try {
    const { action, typeList, data } = req.body
    let newList
    let file
    const lst = await getArray(typeList)
    switch (action) {
      case 'clear':
        newList = []
        break
      case 'edit':
        newList = [...data]
        break
      case 'add':
        newList = [...lst, ...data]
        break
      case 'delete':
        newList = lst.filter((el) => !data.includes(el))
        break
      default:
        newList = lst
    }
    if (newList && newList.length) {
      if (typeList === 'blackIps') {
        newList = await clearIp(newList)
      }
    }
    await setArray(typeList, newList)
    switch (typeList) {
      case 'blackIps':
        file = path.join(__dirname, '..', 'dist', 'ips.dat')
        break
      case 'listUrl':
        file = path.join(__dirname, '..', 'dist', 'remote.dat')
        break
      default:
        file = path.join(__dirname, '..', 'dist', 'signature.dat')
    }
    await writeFiles(file, newList)
    const result = {
      intBlackIp: await getCountArray('blackIps'),
      intBlackSignature: await getCountArray('blackSignatures'),
      intRemoteUrl: await getCountArray('listUrl'),
    }
    return res.json({ ...result })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.post('statistics/clear', auth, async (req, res) => {
  try {
    // TODO clear day_start day_finish
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

module.exports = router
