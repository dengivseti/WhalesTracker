const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    label: {type: String, required: true},
    name: {type: String, required: true, unique: true},
    typeRedirect: {type: String, required: true, default: 'httpRedirect'},
    code: {type: String},
    checkUnic: {type: Boolean, required: true, default:false},
    timeUnic: {type: Number, required: true, default: 24},
    useLog: {type: Boolean, required: true, default: true},
    isActive: {type: Boolean, required: true, default: true},
    date: {type: Date, default: Date.now},
    streams: [ {type: Types.ObjectId, ref: 'Stream'} ]
})

schema.methods.addToStream = function(id) {
    const streams = [...this.streams]
    if (!streams.includes(id.toString())){
        streams.push(id)
        this.streams = streams
        return this.save()
    }
}

schema.methods.removeStream = function(id) {
    let streams = [...this.streams]
    this.streams = streams.filter(stream => stream.toString() !== id.toString())
    this.save()
}

schema.methods.removeAllStreams = function() {
    this.streams = []
    this.save()
}

module.exports = model('Group', schema)