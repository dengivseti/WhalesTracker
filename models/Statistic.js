const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    date: {type: Date, default: Date.now},
    expireAt: {type: Date, default: new Date(new Date().setDate(new Date().getDate() + 5))},
    group: {type: Types.ObjectId, ref: 'Group', required: true},
    stream: {type: Types.ObjectId, ref: 'Stream'},
    out: {type: String},
    keyword: {type: String},
    redirect: {type: String},
    device: {type: String},
    country: {type: String},
    city: {type: String},
    language: {type: String},
    unique: {type: Boolean},
    isBot: {type: Boolean},
    ip: {type: String},
    referer: {type: String},
    useragent: {type: String},
    amount: {type: Number, default: 0},
    subid: {type: String}
})
schema.index({  "expireAt" :  1  },  {  expireAfterSeconds :  0  })
schema.index({"date": 1})
module.exports = model('Statistic', schema)