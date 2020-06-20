// Glitch link: https://glitch.com/edit/#!/speckled-continuous-penguin?path=server.js%3A1%3A0
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')

mongoose
  .connect(
    'mongodb://Clement:clement@cluster0-shard-00-00-yghgs.mongodb.net:27017,cluster0-shard-00-01-yghgs.mongodb.net:27017,cluster0-shard-00-02-yghgs.mongodb.net:27017/Cluster0?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority' || 'mongodb://localhost/exercise-track',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));
// Start of challenge code
var Schema = mongoose.Schema
var userSchema = new mongoose.Schema({
  username: String,
  log: [{
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: Date
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
    res.send(data)
  })
})

app.post('/api/exercise/add', function(req, res) {
    User.findByIdAndUpdate(req.body.userId, {
        $push: {
            log: {
                description: req.body.description,
                duration: parseInt(req.body.duration),
                date: req.body.date ? new Date(req.body.date) : new Date()
            }
        }
    }, {
        new: true,
        findAndModify: false,
        upsert: true
    }, function(error, data) {
        if (error) console.log(error)
        let info = data.log[data.log.length - 1]
        res.json({
            username: data.username,
            description: info.description,
            duration: parseInt(info.duration),
            _id: req.body.userId,
            date: new Date(info.date).toDateString()
        })
    })
})

app.get('/api/exercise/log', function(req, res) {
  console.log(req.query.userId)
  User.findById({
    _id: req.query.userId
  }, function(error, data) {
    if (error) console.log(error)
    console.log(data.log)
    res.json({
            _id: req.query.userId,
            username: data.username,
            count: data.log.length,
            log: data.log
        })
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
