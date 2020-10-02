const {Router} = require('express')
const auth = require('../middleware/auth.middleware')
const {editSetting} = require('../utils/validators.utils')
const {validationResult} = require('express-validator')
const Setting = require('../models/Setting')

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
            blackIp: global.blackIps ? [] : [],
            blackSignature: global.blackSignatures ? [] : [],
            remoteUrl: global.listUrl ? [] : []
        }
        return res.json({
            ...data
        })
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

module.exports = router