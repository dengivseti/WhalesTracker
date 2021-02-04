const { Router } = require('express')
const DateFnsUtils = require('date-fns')
const auth = require('../middleware/auth.middleware')
const Group = require('../models/Group')
const Offer = require('../models/Offer')
const Statistic = require('../models/Statistic')
const { getSetting } = require('../utils/settings.utils')

const router = Router()

const checkType = (type, item) => {
  switch (type) {
    case 'day':
      return DateFnsUtils.format(item.date, 'yyyy-MM-dd')
    case 'country':
      return item.country
    case 'query':
      return item.keyword
    case 'device':
      return item.device
    default:
      return item.device
  }
}

router.get('/groups', auth, async (req, res) => {
  try {
    const groups = await Group.find().populate('streams')
    if (!groups) {
      return res.json([])
    }
    return res.json(groups)
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/offers', auth, async (req, res) => {
  try {
    const offers = await Offer.find()
    if (!offers) {
      return res.json([])
    }
    return res.json(offers)
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const time = new Date()
    if (!req.query.type) {
      res.status(500).json({ message: 'Something went wrong' })
    }
    const obj = {}
    const { type } = req.query
    if (req.query.groups) {
      const groups = req.query.groups.toString().split('|')
      obj.group = { $in: groups }
    }
    if (req.query.streams) {
      const streams = req.query.streams.toString().split('|')
      obj.stream = { $in: streams }
    }
    if (req.query.country) {
      const country = req.query.country.toString().split('|')
      obj.country = { $in: country }
    }
    const ignoreBot = req.query.ignoreBot || false
    let startDate
    let endDate
    let interval
    let startDateOld
    const rezObj = {}
    if (type === 'day') {
      startDate = DateFnsUtils.startOfDay(time)
      startDateOld = DateFnsUtils.subDays(startDate, 1)
      endDate = DateFnsUtils.endOfDay(time)
      interval = DateFnsUtils.eachHourOfInterval({
        start: startDate,
        end: endDate,
      })
    } else {
      startDate = DateFnsUtils.startOfWeek(time, { weekStartsOn: 1 })
      startDateOld = DateFnsUtils.subWeeks(startDate, 1)
      endDate = DateFnsUtils.endOfWeek(time, { weekStartsOn: 1 })
      interval = DateFnsUtils.eachDayOfInterval({
        start: startDate,
        end: endDate,
      })
    }
    obj.date = {
      $gte: startDateOld,
      $lt: endDate,
    }
    const items = await Statistic.find(
      obj,
      'date group stream keyword device country city unique isBot amount useragent ip out',
    )
      .populate({
        path: 'stream',
        select: 'name',
      })
      .populate({ path: 'group', select: 'name' })
      .lean()
    const sortedList = items.sort((a, b) =>
      a.date > b.date ? -1 : 1,
    )
    const filterAmount = sortedList
      .filter((item) => item.amount > 0)
      .slice(0, await getSetting('logLimitAmount'))
    const lastClick = sortedList
      .slice(0, await getSetting('logLimitClick'))
      .map((item) => {
        return {
          date: DateFnsUtils.format(
            item.date,
            'dd/MM/yyyy, hh:mm:ss',
          ),
          group: item.group ? item.group.name : '',
          stream: item.stream ? item.stream.name : '',
          device: item.device,
          country: item.country,
          city: item.city,
          ip: item.ip,
          useragent: item.useragent.substr(0, 500),
          unique: item.unique,
          isBot: item.isBot,
          out: item.out.substr(0, 50),
        }
      })
    const lastAmout = filterAmount.map((item) => {
      return {
        date: DateFnsUtils.format(item.date, 'dd/MM/yyyy, hh:mm:ss'),
        group: item.group ? item.group.name : '',
        stream: item.stream ? item.stream.name : '',
        device: item.device,
        country: item.country,
        city: item.city,
        ip: item.ip,
        amount: item.amount,
        useragent: item.useragent.substr(0, 500),
      }
    })
    interval.forEach((i) => {
      let value
      if (type === 'day') {
        value = DateFnsUtils.getHours(i)
      } else {
        value = DateFnsUtils.getDay(i)
      }
      rezObj[value] = {
        value,
        hits: 0,
        uniques: 0,
        sales: 0,
        amount: 0,
        hits_last: 0,
        uniques_last: 0,
        sales_last: 0,
        amount_last: 0,
      }
    })
    items.forEach((item) => {
      let value
      let last
      if (ignoreBot && item.isBot) {
        return
      }
      if (type === 'day') {
        value = DateFnsUtils.getHours(item.date)
        last = !DateFnsUtils.isToday(item.date)
      } else {
        const day = DateFnsUtils.getDay(item.date) - 1
        value = day === -1 ? 6 : day
        last = !DateFnsUtils.isThisWeek(item.date, {
          weekStartsOn: 1,
        })
      }

      if (last) {
        rezObj[value] = {
          ...rezObj[value],
          hits_last: rezObj[value].hits_last + 1,
          uniques_last:
            rezObj[value].uniques_last + (item.unique ? 1 : 0),
          sales_last:
            rezObj[value].sales_last + (item.amount ? 1 : 0),
          amount_last:
            rezObj[value].amount_last +
            (item.amount ? item.amount : 0),
        }
      } else {
        rezObj[value] = {
          ...rezObj[value],
          hits: rezObj[value].hits + 1,
          uniques: rezObj[value].uniques + (item.unique ? 1 : 0),
          sales: rezObj[value].sales + (item.amount ? 1 : 0),
          amount:
            rezObj[value].amount + (item.amount ? item.amount : 0),
        }
      }
    })
    const stats = []
    Object.keys(rezObj).forEach((key) => stats.push(rezObj[key]))
    res.json({ stats, last_click: lastClick, last_amount: lastAmout })
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

router.get('/stats', auth, async (req, res) => {
  try {
    const time = new Date()
    const obj = {}
    if (
      !req.query.startDate ||
      !req.query.endDate ||
      !req.query.type
    ) {
      res.status(500).json({ message: 'Something went wrong' })
    }
    const { type } = req.query
    if (req.query.groups) {
      const groups = req.query.groups.toString().split('|')
      obj.group = { $in: groups }
    }
    if (req.query.streams) {
      const streams = req.query.streams.toString().split('|')
      obj.stream = { $in: streams }
    }
    if (req.query.country) {
      const country = req.query.country.toString().split('|')
      obj.country = { $in: country }
    }
    const startDate = DateFnsUtils.parse(
      req.query.startDate,
      'yyyy-MM-dd',
      time,
    )
    const endDate = DateFnsUtils.endOfDay(
      DateFnsUtils.parseISO(req.query.endDate),
    )
    obj.date = {
      $gte: startDate,
      $lt: endDate,
    }
    const items = await Statistic.find(
      obj,
      'date group stream keyword device country unique isBot amount',
    ).lean()
    const rezObj = {}
    items.forEach((item) => {
      const value = checkType(type, item)
      if (rezObj[value]) {
        rezObj[value] = {
          ...rezObj[value],
          hits: rezObj[value].hits + 1,
          uniques: rezObj[value].uniques + (item.unique ? 1 : 0),
          sales: rezObj[value].sales + (item.amount ? 1 : 0),
          amount:
            rezObj[value].amount + (item.amount ? item.amount : 0),
        }
      } else {
        rezObj[value] = {
          hits: 1,
          uniques: item.unique ? 1 : 0,
          sales: item.amount ? 1 : 0,
          amount: item.amount ? item.amount : 0,
          value,
        }
      }
    })
    const stats = []
    Object.keys(rezObj).forEach((key) => stats.push(rezObj[key]))
    res.json({ stats })
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

module.exports = router
