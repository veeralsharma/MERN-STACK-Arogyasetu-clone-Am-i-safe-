const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');const dotenv = require("dotenv");

dotenv.config();

const app= express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

var port = process.env.PORT || 5000;

const mongoURI=process.env.MONGO_URI;

mongoose
  .connect(
    mongoURI,
    { useNewUrlParser: true,useUnifiedTopology: true  }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

  var Users = require('./routes/Users')

  app.use('/users', Users)

 

  app.listen(port, function() {
    console.log('Server is running on port: ' + port)
  });