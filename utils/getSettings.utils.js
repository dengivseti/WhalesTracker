const Setting = require('../models/Setting')
const shortid = require('shortid')
const config = require('config')

module.exports = getSettings = async () => {
    const mongoSettings = await Setting.find()
    const settings = {}
    mongoSettings.map(item => settings[item.key] = item.value)
    const objSetting = {
        'postbackKey': shortid.generate().toLowerCase(),
        'clearDayStatistic': '30',
        'theme': 'light',
        'language': 'English',
        'trash': 'url',
        'trashUrl': 'http://example.com',
        'logLimitClick': '150',
        'logLimitAmount': '50',
        'getKey': 'q',
        'protect': '0',
        'sendTelegram': '0',
        'telegramBotToken': '',
        'telegramChatId': '',
        'clearRemote': '30'
    }
    const keys = Object.keys(objSetting)
    keys.forEach(key => {
        if (settings[key]) {
            global[key] = settings[key]
        }else{
            global[key] = config.get(key) || objSetting[key]
            if (global[key]) {
                new Setting({
                    key,
                    value: global[key]
                }).save()
            }
        }
    })
}