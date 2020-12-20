// Use the dotenv package, to create environment variables
require('dotenv').config()
// Create a constant variable, PORT, based on what's in process.env.PORT or fallback to 3000
const PORT = process.env.PORT || 3000;
// Import express, and create a server
const express = require('express');
const server = express();
const cors = require('cors')
// Require morgan and body-parser middleware
const bodyParser = require('body-parser');
server.use(bodyParser.json());

const morgan = require('morgan');
server.use(morgan('dev'));
// Have the server use morgan with setting 'dev'

// Import cors 
// Have the server use cors()
server.use(cors())


// Have the server use bodyParser.json()

// Have the server use your api router with prefix '/api'
const apiRouter = require('./api');
server.use('/api', apiRouter);

// Import the client from your db/index.js
const { client } = require('./db');

// Create custom 404 handler that sets the status code to 404.

// Create custom error handling that sets the status code to 500
// and returns the error as an object
server.use(function (req, res, next) {
    if(res.status === '404'){
    res.status(404).send("Sorry can't find that!")
    }else {
        res.status(500).send(next(error))
    }
  })


// Start the server listening on port PORT
// On success, connect to the database

server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
  });
  