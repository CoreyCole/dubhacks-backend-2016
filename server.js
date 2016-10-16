var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var _ = require('lodash');
var mongoose = require('mongoose');
var clarifai = require('clarifai');

var dbConfig = require('./secret/database.js');
var clarifaiConfig = require('./secret/clarifai-api.js');
var ObjectId = require('mongoose').Types.ObjectId;

// create express app
var app = express();

// create clarifai app
var clarifaiApp = new clarifai.App(clarifaiConfig.clientId, clarifaiConfig.cliendSecret);
// var clarifaiToken = clarifaiApp.getToken();
var clarifaiToken = 'XFDCqjC5LpgBwEkMf44C9VXUxPkP2V';
clarifaiApp.setToken(clarifaiToken);

//connect to MongoDB
mongoose.connect(dbConfig.url);

var User = require('./models/user');
var Item = require('./models/item');

app.use(bodyParser.json());

// creates a new item
// req params empty
// req body { userPhone: String, itemName: String, beaconId: String }
app.post('/api/v1/item/new', function (req, res) {
  Item.create({
    itemName: req.body.itemName,
    userPhone: req.body.userPhone,
    beaconId: req.body.beaconId
  });
  return res.json({
    messege: "success!"
  });
});

// return all items given a user phone number
// req params { userPhone: String }
// req body empty
app.get('/api/v1/items/:userPhone', function (req, res) {
  Item.find({ userPhone: req.params.userPhone }, function (err, items) {
    return res.json(items);
  });
});

// push new history object onto an item
// req params { itemId: ObjectId }
// req body { startedLookingTime: Date, foundTime: Date, photoUrl: String }
app.post('/api/v1/items/:itemId/history/new', function (req, res) {
  clarifaiApp.models.predict(clarifai.GENERAL_MODEL, req.body.photoUrl).then(
    function (clarifaiRes) {
      Item.findByIdAndUpdate(
        req.params.itemId,
        {
          $push: {
            history: {
              startedLookingTime: req.body.startedLookingTime,
              foundTime: req.body.foundTime,
              photoUrl: req.body.photoUrl,
              tag: clarifaiRes.data['outputs'][0]['data']['concepts']
            }
          }
        },
        { safe: true, upsert: true },
        function (err, model) {
          console.log(err);
        }
      );
      return res.status(200).json('success!');
    },
    function (err) {
      console.error(err);
      return res.status(400).json('clarifai error');
    }
  );

});

// bind to port 3000 and listen for requests
app.listen(3000, function () {
  console.log('listening on port 3000 . . .');
});