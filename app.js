const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const useragent = require('express-useragent')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const errorHandler = require('./middleware/error.middleware')
const { getStartValueSettings } = require('./utils/settings.utils')

const app = express()

const store = new MongoStore({
  collection: 'sessions',
  uri: config.get('mongoUri'),
})

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

start()
