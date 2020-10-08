const {Schema, model} = require('mongoose')

const schema = new Schema({
    date: {type: Date, default: Date.now},
    name: {type: String, required: true},
    type: {type: String, required: true},
    offers: [
        {
            url: {type: String, required: true},
            percent: {type: Number, min: 0, max: 100, default: 100}
        }
    ]
})
schema.index({"date": 1})

module.exports = model('Offer', schema)