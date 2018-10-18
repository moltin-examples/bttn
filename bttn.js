/* eslint linebreak-style: ['error', 'windows'] */

// Imports
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const moltinHelper = require('./utils/auto_moltin');
const { BTTN_API_KEY } = process.env.BTTN_API_KEY;
const config = {
  port: 3000,
  callback: undefined,
  result: undefined
};

// Setup the response to bt.tn
const options = {
  url: config.callback,
  method: 'POST',
  json: true,
  time : true,
  headers: {
    'X-Api-Key': BTTN_API_KEY,
  },
  body: {
    result: 'success',
  },
};

// Start Express
const bttn = express();

// Configure JSON and Form handlers
bttn.use(bodyParser.json());
bttn.use(bodyParser.urlencoded({ extended: true }));

// Start the server
bttn.listen(config.port, () => {
  //console.log(`App listening on port: ${config.port}`);
});

// Listen for a post request
bttn.post('/', (req, res) => {
  
  // Debug
  console.log('You pressed the button!', req.body);

  // No callback provided
  if (req.body.callback === undefined) {
    console.log('Error: No callback URL provided.');
  };

  // Add the callback to config
  config.callback = req.body.callback;

 // Initialise a start time for the purchase
  var start = new Date();
  
  // Run the purchase function
  return moltinHelper.purchase()

  .then((result) => {
      
    // Debug
    if(result === 'err') {
      console.log('purchase failed');
    } else {
      console.log(result);
      config.result = 'success';
    }

    // Calculate the time of execution for the purchase
    var end = new Date() - start;
    console.info("Execution time: %dms", end);


    var options = {
      url: config.callback,
      headers: {
        'X-Api-Key': process.env.BTTN_API_KEY
      },
      body: JSON.stringify({
        "result":config.result
      })
    };

    // Make the callback request
    request.post(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log('Callback Success.');
      } else(console.log('callback request failed: ' + error));
    });

    // Close this request
    res.setHeader('Connection', 'close');
    res.end();
  }).catch((e) => {
    console.log(e);
  })
});
