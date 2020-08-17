const express = require('express')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const config = require('config')
const useragent = require('express-useragent')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const errorHandler = require('./middleware/error.middleware')
const readFiles = require('./utils/readFiles.utils')


const app = express()

const store = new MongoStore({
    collection: 'sessions',
    uri: config.get('mongoUri')
})

app.use(useragent.express())
app.use('/', require('./routes/tracker.route'))
app.use(express.json({extended: true}))
app.use(session({
    secret: config.get('sessionSecret'),
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 360000
    // },
    store
}))


app.use('/api/edit', require('./routes/create.route'))
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
        global.blackIps = await readFiles(path.join(__dirname, 'dist', 'blackIps.txt'))
        global.blackSignatures = await readFiles(path.join(__dirname, 'dist', 'blackSignatures.txt'))
        global.listUrl = await readFiles(path.join(__dirname, 'dist', 'listUrl.txt'))
        global.clearDayStatistic = config.get('clearDayStatistic') || 30
        app.listen(PORT, () => console.log(`Server started on port ${PORT}...`))
    } catch (e) {
        console.log('Server error', e.message)
        process.exit(1)
    }
}


start()