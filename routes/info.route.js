const {Router} = require('express')
const auth = require('../middleware/auth.middleware')
const Group = require('../models/Group')
const Statistic = require('../models/Statistic')

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