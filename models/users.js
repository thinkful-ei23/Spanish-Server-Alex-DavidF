'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  last: [{ name: String, correct: Boolean }],
  wordList: [{ name: String, m: Number, correct: Number, incorrect: Number }]
});

userSchema.methods.validatePassword = function(password) {
  return password === this.password;
};

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
  }
});

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);
