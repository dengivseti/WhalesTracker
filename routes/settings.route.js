const {Router} = require('express')
const auth = require('../middleware/auth.middleware')
const {editSetting} = require('../utils/validators.utils')
const {validationResult} = require('express-validator')
const Setting = require('../models/Setting')
const clearIp = require('../utils/ip.utils')
const writeFiles = require('../utils/writeFiles.utils')
const path = require('path')

const router = Router()

router.get('/info', auth, async (req, res) => {
    try{
        let data
        const general = {}
        const options = await Setting.find()
        options.forEach(option => {
            general[option.key] = option.value
        })
        data = {
            general: general ? general : null,
            intBlackIp: global.blackIps ? global.blackIps.length : 0,
            intBlackSignature: global.blackSignatures ? global.blackSignatures.length : 0,
            intRemoteUrl: global.listUrl ? global.listUrl.length : 0
        }
        return res.json({
            ...data
        })
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})

router.get('/info/list', auth, async(req, res) => {
    try{
        const typeList = req.query.type
        if (typeList === 'blackIps'){
            return res.json({type: typeList, data: global.blackIps ? global.blackIps.filter(str => str.trim()) : []})
        }else if (typeList === 'blackSignatures'){
            return res.json({type: typeList, data: global.blackSignatures ? global.blackSignatures.filter(str => str.trim()) : []})
        }else if (typeList === 'listUrl'){
            return res.json({type: typeList, data: global.listUrl ? global.listUrl.filter(str => str.trim()) : []})
        }
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})

router.post('/edit/general', auth, editSetting, async(req, res) => {
    try{
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            return res.status(422).json({message: errors.array()[0].msg})
        }
        Object.keys(req.body).forEach(async  key => {
            await Setting.where({key: key}).updateOne({
                value: req.body[key]
            })
        })
        // TODO Добавить чистку бд STATISTIC  если новый clearDayStatistic меньше предыдущего
        res.json({status: 'OK'})
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})

router.post('/edit/list', auth, async(req, res) => {
    try {
        const {action, typeList, data} = req.body
        let list
        let file
        switch (action){
            case 'clear':
                list = await []
                break
            case 'edit':
                list = await [...data]
                break
            case 'add':
                list = await [...global[typeList], ...data]
                break
            case 'delete':
                list = await global[typeList].filter(el => !data.includes(el))
                break
            default:
                list = await global[typeList]
        }
        if (list && list.length){
            if (typeList === 'blackIps') {
                list = await clearIp(list)
            }
        }
        global[typeList] = list
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
        await writeFiles(file, list)
        const result = {
            intBlackIp: global.blackIps ? global.blackIps.length : 0,
            intBlackSignature: global.blackSignatures ? global.blackSignatures.length : 0,
            intRemoteUrl: global.listUrl ? global.listUrl.length : 0
        }
        return res.json({...result})
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})


router.post('statistics/clear', auth, async(req, res) => {
    try {
        // TODO clear day_start day_finish
    }catch (e) {
        res.status(500).json({message: 'Something went wrong'})
    }
})

module.exports = router