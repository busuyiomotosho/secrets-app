const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

// User Schema
 
const userSchema = new mongoose.Schema ({
    name: String,
    username: String,
    password: String,
    googleId: String,
    secrets: [String]
});

// Error Messages

let options = {
  errorMessages: {
      MissingPasswordError: 'Password is missing',
      AttemptTooSoonError: 'Access denied. Try again later',
      TooManyAttemptsError: 'Access denied due to too many failed login attempts',
      NoSaltValueStoredError: 'Cannot authenticate. No salt value stored',
      IncorrectPasswordError: 'Password or username is incorrect',
      IncorrectUsernameError: 'Password or username is incorrect',
      MissingUsernameError: 'Username is missing',
      UserExistsError: 'A user with this email already exists'
  }
};

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
 
// Export User Model

module.exports = mongoose.model('User', userSchema);