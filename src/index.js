require('dotenv').config()
import express from 'express'
import bodyParser from 'body-parser'
import queryGoogle from './queryGoogle.js'
import fetchResult from './fetchResult.js'

const PORT = parseInt(process.env.PORT)

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.post('/route', queryGoogle)

app.get('/route/:token', fetchResult)

app.listen( PORT , () => console.log(`Listening on port ${PORT}!`))

export default app // test