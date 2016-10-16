var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
  itemName: String,
  beaconId: String,
  userPhone: String,
  createdOn: { type: Date, default: Date.now },
  history: { type: Array, default: []}
});

module.exports = mongoose.model('Item', itemSchema);