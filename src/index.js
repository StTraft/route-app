import express from 'express'
import bodyParser from 'body-parser'
import queryGoogle from './queryGoogle.js'

const app = express()

app.get('/', queryGoogle)

app.post('token/:token', (req, res) => {
  console.log('token:', req.params.token)
  res.send({status: 'success'})
})

app.listen(3000, () => console.log('Listening on port 3000!'))