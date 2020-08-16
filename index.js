const bodyParser = require('body-parser')
const express = require('express')
const { MongoClient } = require('mongodb')
const morgan = require('morgan')
const path = require('path')

const mainRouter = require('./backend/mainRouter')

const defaultConfig = {
  port: 14555,
  interface: '0.0.0.0',
  serverPath: '/moving',
  mongodb: {
    url: 'mongodb://127.0.0.1:27017',
    dbName: 'moving',
    boxesColl: 'boxes'
  }
}

const setupServer = colls => {
  const app = express()
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(createRequestLogger())

  app.set('views', path.join(__dirname, '/frontend'))
  app.set('view engine', 'pug')
  app.locals.basepath = defaultConfig.serverPath

  app.use(`${defaultConfig.serverPath}/static`, createStaticRouter())
  app.use(`${defaultConfig.serverPath}`, mainRouter(colls))

  return app.listen(defaultConfig.port, defaultConfig.interface)
}

const createRequestLogger = () => {
  morgan.token('clientIP', req => req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  const format = ':date[iso] [:clientIP] :status :method :url - :response-time[0]ms (:res[content-length] bytes) :user-agent'
  return morgan(format)
}

const createStaticRouter = () => {
  const options = { maxAge: 86400000 }
  return express.static(path.join(__dirname, 'static'), options)
}

const prepareCollections = cfg => db => {
  const boxes = db.collection(cfg.mongodb.boxesColl)
  const colls = { boxes }
  return boxes.createIndex({ boxId: 1 })
    .then(() => colls)
}

MongoClient.connect(defaultConfig.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => client.db(defaultConfig.mongodb.dbName))
  .then(prepareCollections(defaultConfig))
  .then(setupServer)
  .then(() => { console.log(`started on port ${defaultConfig.port}`) })
