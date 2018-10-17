'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Word = require('../models/word');

const router = express.Router();

router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/', (req, res, next) => {
  Word.find()
    .then(results => {
      // console.log(results);
      res.json(results);
    })
    .catch(err => next(err));
});

module.exports = router;