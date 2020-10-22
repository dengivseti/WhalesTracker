const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('config')
const useragent = require('express-useragent')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const cluster = require('cluster')
const errorHandler = require('./middleware/error.middleware')
const readFiles = require('./utils/readFiles.utils')
const getSettings = require('./utils/getSettings.utils')
const clearIp = require('./utils/ip.utils')

const app = express()

const store = new MongoStore({
  collection: 'sessions',
  uri: config.get('mongoUri'),
})

if (cluster.isMaster) {
  const cpuCount = require('os').cpus().length

  for (let i = 0; i < cpuCount; i += 1) {
    cluster.schedulingPolicy = cluster.SCHED_NONE
    cluster.fork()
  }

  cluster.on('exit', function (worker) {
    console.log(`Worker ${worker.id} died :(`)
    cluster.fork()
  })
} else {
  app.use(useragent.express())
  app.use('/postback', require('./routes/postback.route'))
  app.use('/', require('./routes/tracker.route'))

  app.use(express.json({ extended: true }))
  app.use(
    session({
      secret: config.get('sessionSecret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
      },
      store,
    }),
  )

  app.use('/api/edit', require('./routes/create.route'))
  app.use('/api/settings', require('./routes/settings.route'))
  app.use('/api/auth', require('./routes/auth.route'))
  app.use('/api/info', require('./routes/info.route'))

  app.use(errorHandler)

  const PORT = config.get('port') || 5000

  async function start() {
    try {
      await mongoose.connect(config.get('mongoUri'), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      const blackIps = await readFiles(
        path.join(__dirname, 'dist', 'ips.dat'),
      )
      global.blackIps = clearIp(blackIps)
      const blackSignatures = await readFiles(
        path.join(__dirname, 'dist', 'signature.dat'),
      )
      global.blackSignatures = blackSignatures.filter((str) =>
        str.trim(),
      )
      const listUrl = await readFiles(
        path.join(__dirname, 'dist', 'remote.dat'),
      )
      global.listUrl = listUrl.filter((str) => str.trim())
      getSettings()
      app.listen(PORT, () =>
        // eslint-disable-next-line no-console
        console.log(`Server started on port ${PORT}...`),
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Server error', e.message)
      process.exit(1)
    }
  }

  start()
}
