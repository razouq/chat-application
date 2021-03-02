const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
  username: String,
  email: String,
  password: String,
  socketId: String,
});

module.exports = model('User', UserSchema);