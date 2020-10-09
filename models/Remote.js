const { Schema, model } = require('mongoose')

const schema = new Schema({
  query: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  date: { type: Date, default: Date.now },
  expireAt: {
    type: Date,
    default: new Date(new Date().setDate(new Date().getDate() + 5)),
  },
})
schema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

module.exports = model('Remote', schema)
