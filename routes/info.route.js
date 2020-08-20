const {Router} = require('express')
const auth = require('../middleware/auth.middleware')
const Group = require('../models/Group')
const Statistic = require('../models/Statistic')
const DateFnsUtils = require('date-fns')

const router = Router()

const checkType = (type, item) => {
    switch (type) {
        case('day'):
            return item['date'].toISOString().substring(0, 10)
        case('country'):
            return item['country']
        case('query'):
            return item['keyword']
        case('device'):
            return item['device']
    }
}

router.get('/groups', auth, async (req, res) => {
    try{
        const groups = await Group.find().populate('streams')
        if (!groups){
            return res.json([])
        }
        return res.json(groups)
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})

router.get('/stats/dashboard', auth, async (req, res) => {
    try{
        const time = new Date()
        if (!req.query.type) {
            res.status(500).json({message: 'Something went wrong'})
        }
        const obj = {}
        const type = req.query.type
        if (req.query.groups) {
            const groups = req.query.groups.toString().split('|')
            obj['group'] = {"$in" : groups}
        }
        if (req.query.streams) {
            const streams = req.query.streams.toString().split('|')
            obj['stream'] = {"$in" : streams}
        }
        if (req.query.country) {
            const country = req.query.country.toString().split('|')
            obj['country'] = {"$in" : country}
        }
        const ignoreBot = req.query.ignoreBot || false
        let startDate, endDate, interval, startDateOld
        const rezObj = {}
        if (type === 'day') {
            startDate = DateFnsUtils.startOfDay(time)
            startDateOld = DateFnsUtils.subDays(startDate, 1)
            endDate = DateFnsUtils.endOfDay(time)
            interval = DateFnsUtils.eachHourOfInterval({
                start: startDate,
                end: endDate
            })
        }else{
            startDate = DateFnsUtils.startOfWeek(time, {weekStartsOn: 1})
            startDateOld = DateFnsUtils.subWeeks(startDate, 1)
            endDate = DateFnsUtils.endOfWeek(time, {weekStartsOn: 1})
            interval = DateFnsUtils.eachDayOfInterval({
                start: startDate,
                end: endDate
            })
        }
        obj['date'] = {"$gte": new Date(startDateOld.getTime()), "$lt": new Date(endDate.getTime())}
        const items = await Statistic.find(obj, 'date group stream keyword device country unique isBot amount').lean()
        console.log(`Mongo ${(new Date().getTime() - time.getTime())/1000}`)
        interval.forEach(i => {
            let value
            if (type === 'day'){
                value = DateFnsUtils.getHours(i)
            }else{
                value = DateFnsUtils.getDay(i)
            }
            rezObj[value] = {
                value: value,
                hits: 0,
                uniques: 0,
                sales: 0,
                amount: 0,
                hits_last: 0,
                uniques_last: 0,
                sales_last: 0,
                amount_last: 0
            }
        })
        items.forEach(item => {
            let value, last
            if (ignoreBot && item.isBot){
                return
            }
            if (type === 'day'){
                value = DateFnsUtils.getHours(item.date)
                DateFnsUtils.isToday(item.date) ? last = false : last = true
            }else{
                value = DateFnsUtils.getDay(item.date)
                DateFnsUtils.isThisWeek(item.date, {weekStartsOn: 1}) ? last=false : last=true
            }

            if (last){
                rezObj[value] = {
                    ...rezObj[value],
                    hits_last: rezObj[value]['hits_last'] + 1,
                    uniques_last: rezObj[value]['uniques_last'] + (item['unique'] ? 1 : 0),
                    sales_last: rezObj[value]['sales_last'] + (item['amount'] ? 1  : 0),
                    amount_last: rezObj[value]['amount_last'] + (item['amount'] ? item['amount'] : 0),
                }
            }else{
                rezObj[value] = {
                    ...rezObj[value],
                    hits: rezObj[value]['hits'] + 1,
                    uniques: rezObj[value]['uniques'] + (item['unique'] ? 1 : 0),
                    sales: rezObj[value]['sales'] + (item['amount'] ? 1  : 0),
                    amount: rezObj[value]['amount'] + (item['amount'] ? item['amount'] : 0),
                }
            }
        })
        stats = []
        for (let prop in rezObj){
            stats.push(rezObj[prop])
        }
        console.log(`Final ${(new Date().getTime() - time.getTime())/1000}`)
        res.json({stats})
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})

router.get('/stats', auth, async (req, res) => {
    try{
        const start = new Date().getTime()
        const obj = {}
        if (!req.query.startDate || !req.query.endDate || !req.query.type) {
            res.status(500).json({message: 'Something went wrong'})
        }
        const type = req.query.type
        if (req.query.groups) {
            const groups = req.query.groups.toString().split('|')
            obj['group'] = {"$in" : groups}
        }
        if (req.query.streams) {
            const streams = req.query.streams.toString().split('|')
            obj['stream'] = {"$in" : streams}
        }
        if (req.query.country) {
            const country = req.query.country.toString().split('|')
            obj['country'] = {"$in" : country}
        }
        const ignoreBot = req.query.ignoreBot || false
        const startDate = Date.parse(req.query.startDate)
        const endDate = Date.parse(req.query.endDate) + 1000*60*60*24
        obj['date'] = {"$gte": new Date(startDate), "$lt": new Date(endDate)}
        const items = await Statistic.find(obj, 'date group stream keyword device country unique isBot amount').lean()
        console.log(`Mongo ${(new Date().getTime() - start)/1000}`)
        const rezObj = {}
        items.forEach(item => {
            const value = checkType(type, item)
            if (rezObj[value]){
                rezObj[value] = {
                    ...rezObj[value],
                    hits: rezObj[value]['hits'] + 1,
                    uniques: rezObj[value]['uniques'] + (item['unique'] ? 1 : 0),
                    sales: rezObj[value]['sales'] + (item['amount'] ? 1  : 0),
                    amount: rezObj[value]['amount'] + (item['amount'] ? item['amount'] : 0),
                }
            }else{
                rezObj[value] = {
                    hits: 1,
                    uniques: (item['unique'] ? 1 : 0),
                    sales: (item['amount'] ? 1  : 0),
                    amount: (item['amount'] ? item['amount'] : 0),
                    value: value
                }
            }
        })
        stats = []
        for (let prop in rezObj){
            stats.push(rezObj[prop])
        }
        console.log(`Final ${(new Date().getTime() - start)/1000}`)
        res.json({stats})
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})


module.exports = router