const {Schema, model} = require('mongoose')

const schema = new Schema({
    query: {type: String, required: true, unique: true},
    url: {type: String, required: true},
    date: {type: Date, default: Date.now},
})

module.exports = model('Remote', schema)