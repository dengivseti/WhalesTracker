const Redis = require('ioredis')

const redis = new Redis({ host: 'redis' })

module.exports = redis
