'use strict';

const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  spanish: { type: String, required: true, unique: true },
  english: { type: String, required: true },
  mVal: { type: Number, default: 1 }
});

wordSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Word', wordSchema);
