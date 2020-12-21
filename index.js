const express = require('express')
const apiRouter = require('./api')
const { client } = require('./db')
const bodyParser = require('body-parser')
var cors = require('cors')
const env = require('dotenv').config()
const PORT = process.env.port || 3000
const server = express()
const morgan = require('morgan')
server.use(morgan('dev'))
server.use(bodyParser.json())
server.use(cors())
server.use('/api', apiRouter)
client.connect()
server.use(function (req, res, next) {
  if (res.status === '404') {
    res.status(404).send("Sorry can't find that!")
  } else if (res.status === '500') {
    res.status(500).send('sorry cant find that')
  }
  next()
})
server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
})






