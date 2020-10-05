const {Schema, model} = require('mongoose')

const enums = [
    'postbackKey', //Postback key
    'clearDayStatistic', // day save logs
    'theme', // theme site light or dark
    'language', // language
    'trash',    // trash or not found
    'trashUrl', // trash url
    'logLimitClick', // show first records when viewing last click
    'logLimitAmount', // show first records when viewing last amount
    'getKey', // name option GET query params keyword
    'protect', // captcha on log
    'sendTelegram', // send notification in Telegram
    'telegramBotToken', // token auth Telegram
    'telegramChatId', // id account Telegram
    'clearRemote', //day clear remote
]

const schema = new Schema({
    key: {type: String, required: true, unique: true, maxlength: 50, enum: enums},
    value: {type: String, maxlength: 100}
})

module.exports = model('Setting', schema)