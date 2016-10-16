var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  phone_number: String,
  name: String,
  birth_date: Date
});

module.exports = mongoose.model('User', userSchema);