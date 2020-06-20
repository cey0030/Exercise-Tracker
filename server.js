const dotenv = require('dotenv')
dotenv.config({ path: './config.env' });

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useNewUrlParser: true, useUnifiedTopology: true});

// Start of challenge code
var Schema = mongoose.Schema
var userSchema = new mongoose.Schema({
  username: String,
  logs: [{
    description: String,
    duration: Number,
    date: String
  }]
})

var User = mongoose.model('User', userSchema)
// End of challenge code

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))

// Start of challenge code
app.post('/api/exercise/new-user', function(req, res) {
  var user = new User({
    username: req.body.username
  })
  user.save((error) => {
    if (error) console.log(error)
  })
  res.json({'username': req.body.username, '_id':""})
})

app.get('/api/exercise/users', function(req, res) {
  User.find({}, {
    username: 1
  }, (error, data) => {
    if (error) console.log(error)
    res.json(data)
  })
})
// End of challenge code 

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
