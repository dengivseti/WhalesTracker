const {Schema, model} = require('mongoose')

const schema = new Schema({
    position: {type: Number, required: true},
    name: {type: String, required: true,},
    clicksHit: {type: Number, required: true, default: 0},
    clicksUnic: {type:Number, required: true, default: 0},
    clicksBot: {type:Number, required: true, default: 0},
    typeRedirect: {type: String, required: true, default: 'httpRedirect'},
    code: {type: String},
    useLog: {type: Boolean, required: true, default: true},
    isActive: {type: Boolean, required: true, default: true},
    date: {type: Date, default: Date.now},
    relation: {type: Boolean, required: true, default: true},    // true - все условия должны выполняться, false - любое из условий
    isBot: {type: Boolean, required: true, default: true},
    filters: []
})

schema.methods.updateFilters = function(filters) {
    this.filters = [...filters]
    this.save()
}


module.exports = model('Stream', schema)