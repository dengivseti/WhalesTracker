const express = require('express')
const mongoose = require('mongoose')
const useragent = require('express-useragent')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const cluster = require('cluster')
const helmet = require('helmet')
const errorHandler = require('./middleware/error.middleware')
const { getStartValueSettings } = require('./utils/settings.utils')

const PORT = process.env.port || 5000
const app = express()

async function start() {
  try {
    await mongoose.connect(process.env.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    getStartValueSettings()
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

if (cluster.isMaster) {
  const cpuCount = require('os').cpus().length
  for (let i = 0; i < cpuCount; i += 1) {
    cluster.schedulingPolicy = cluster.SCHED_NONE
    cluster.fork()
  }

  cluster.on('exit', function (worker) {
    // eslint-disable-next-line no-console
    console.log(`Worker ${worker.id} died :(`)
    cluster.fork()
  })
} else {
  const store = new MongoStore({
    collection: 'sessions',
    uri: process.env.mongoUri,
  })
  app.use(express.static('public'))
  app.use(helmet.dnsPrefetchControl())
  app.use(helmet.expectCt())
  // app.use(helmet.frameguard())
  app.use(helmet.hidePoweredBy())
  app.use(helmet.ieNoOpen())
  app.use(helmet.noSniff())
  app.use(helmet.referrerPolicy())
  app.use(helmet.xssFilter())
  app.use(useragent.express())
  app.use('/postback', require('./routes/postback.route'))
  app.use('/', require('./routes/tracker.route'))

  app.use(express.json({ extended: true }))
  app.use(
    session({
      secret: process.env.sessionSecret,
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
  start()
}
