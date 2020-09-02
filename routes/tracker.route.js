const {Router} = require('express')
const Group = require('../models/Group')
const Statistic = require('../models/Statistic')
const userInfo = require('../tracker/userInfo')
const stream = require('../tracker/stream')
const redirect = require('../tracker/redirect')
const shortid = require('shortid')


const router = Router()

router.get('/', async (req, res) => {
    try {
        return res.json('hey')
    } catch (e) {
        res.status(500).json('Something went wrong')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findOne({name: req.params.id}).populate('streams')
        if (!group){
            return res.status(404).json(req.params.id)
        }
        if (!group.isActive) {
            return res.status(404).json(req.params.id)
        }
        const user = userInfo(req)
        let unique = true
        if (group.checkUnic && group.timeUnic > 0) {
            const candidate = await Statistic.findOne({ip: user.ip, date: {$gte: new Date(new Date().setDate(new Date().getHours()-group.timeUnic))}})
            console.log(candidate)
            if (candidate) {
                unique = false
            }
        }
        const streams = group.streams.sort((a, b) => a['position'] > b['position'] ? 1: -1)
        const subid = shortid.generate().toLowerCase()
        for (let i=0; i < streams.length; i++) {
            if (!streams[i].isActive) {
                continue
            }
            const isUsed = await stream(user, streams[i])
            if (isUsed) {
                if (group.useLog && streams[i].useLog) {
                    const statistic = new Statistic({
                        group: group._id,
                        stream: streams[i]._id,
                        out: streams[i].code,
                        keyword: user.query,
                        redirect: streams[i].typeRedirect,
                        device: user.device,
                        country: user.geo.country,
                        city: user.geo.city,
                        language: user.lang,
                        unique,
                        isBot: streams[i].isBot,
                        ip: user.ip,
                        referer: user.refer,
                        useragent: user.useragent.source,
                        expireAt: new Date(new Date().setDate(new Date().getDate() + global.clearDayStatistic)),
                        subid
                    })
                    statistic.save()
                }
                await redirect(streams[i].typeRedirect, streams[i].code, res, subid, user.query)
                return
            }
        }
        if (group.useLog) {
            const statistic = new Statistic({
                group: group._id,
                out: group.code,
                keyword: user.query,
                redirect: group.typeRedirect,
                device: user.device,
                country: user.geo.country,
                city: user.geo.city,
                language: user.lang,
                unique,
                ip: user.ip,
                referer: user.refer,
                useragent: user.useragent.source,
                expireAt: new Date(new Date().setDate(new Date().getDate() + global.clearDayStatistic)),
                subid
            })
            statistic.save()
        }
        await redirect(group.typeRedirect, group.code, res, subid, user.query)

    } catch (e) {
        console.log(e)
        res.status(500).json('Something went wrong')
    }
})


module.exports = router