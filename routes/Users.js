const express = require('express');
const users = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');
users.use(cors());

process.env.SECRET_KEY = 'secret'

users.post('/register', (req, res) => {
    const today = new Date()
    const userData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      created: today,
      age:req.body.age
    }
  
    User.findOne({
      email: req.body.email
    })
      .then(user => {
        if (!user) {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            userData.password = hash
            User.create(userData)
              .then(user => {
                res.json({ status: user.email + 'Registered!' })
              })
              .catch(err => {
                res.send('error: ' + err)
              })
          })
        } else {
          res.json({ error: 'User already exists' })
        }
      })
      .catch(err => {
        res.send('error: ' + err)
      })
  })
  
  users.post('/login', (req, res) => {
    User.findOne({
      email: req.body.email
    })
      .then(user => {
        if (user) {
          if (bcrypt.compareSync(req.body.password, user.password)) {
            // Passwords match
            const payload = {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              age:user.age,
              location:user.location,
              status:user.status            
            }
            let token = jwt.sign(payload, process.env.SECRET_KEY, {
              expiresIn: 10000
            })
            res.send(token)
          } else {
            // Passwords don't match
            res.json({ error: 'User does not exist' })
          }
        } else {
          res.json({ error: 'User does not exist' })
        }
      })
      .catch(err => {
        res.send('error: ' + err)
      })
  })

  users.get('/profile', (req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)
  
    User.findOne({
      _id: decoded._id
    })
      .then(user => {
        if (user) {
          res.json(user)
        } else {
          res.send('User does not exist')
        }
      })
      .catch(err => {
        res.send('error: ' + err)
      })
  })
  
  users.post('/setstatus', (req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

    const symptoms = {
      fever :req.body.fever,
      drycough:req.body.cough
    }

    const position = {
      lat: req.body.latitude,
      long : req.body.longitude
    }
  
    User.findOneAndUpdate({
      _id: decoded._id
    },{
      status:symptoms,
      location:position
    })
      .then(user => {
        if (user) {
          res.json(user)
        } else {
          res.send('User does not exist')
        }
      })
      .catch(err => {
        res.send('error: ' + err)
      })
  })

  users.get('/compare', (req, res) => {

    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)
    function isSafe(decoded,user){
     try {
      if(user._id != decoded._id){
        if(user.status.fever===true || user.status.drycough===true){
          return(false)
        }else{
          return(true)
        }
      }else{
        return(null)
      }
     } catch (error) {
       return(error)
     }
    }

    function distance(decode,user){
      var distance=0
      const latdiff = Math.abs(decoded.location.lat-user.location.lat < 0.0100000)
      const lattdist= latdiff * 0.111
      const longdiff = Math.abs(decoded.location.lat-user.location.lat < 0.0100000)
      const longdist=longdiff*0.111

      distance=Math.sqrt(Math.pow(lattdist,2) + Math.pow(longdist,2))
      
      return distance.toFixed(3)
    }

    User.find()
      .then(users => {
        if (users) {
          const ans = []
          users.map(user => {
            if(isSafe(decoded,user) === false){
             if((Math.abs(decoded.location.lat-user.location.lat < 0.0010000)) || (Math.abs(decoded.location.long-user.location.long < 0.0100000))){
              ans.push({
                name:user.first_name,
                age:user.age,
                location:user.location,
                symptoms:user.status,
                distance:distance(decoded,user)
              })
             }
            }  
          })
          if(ans.length === 0 ){
            res.send('abc')
          }else{
            res.send(ans)
          }
        } else {
          res.send('User does not exist')
        }
      })
      .catch(err => {
        res.send('error: ' + err)
      })
  })

  

module.exports = users