'use strict';

const express = require('express');

const User = require('../models/users');

const router = express.Router();

const Word = require('../models/word');

router.get('/', (req, res, next) => {});

router.post('/', async (req, res, next) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'name'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(
      `Field: '${nonTrimmedField}' cannot start or end with whitespace`
    );
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 6, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(
      `Field: '${tooSmallField}' must be at least ${min} characters long`
    );
    err.status = 422;
    return next(err);
  }

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(
      `Field: '${tooLargeField}' must be at most ${max} characters long`
    );
    err.status = 422;
    return next(err);
  }

  let { username, password, name = '' } = req.body;
  name = name.trim();

  try {
    const wordList = await Word.find();

    let mappedWordList = wordList.map((word, i) => {
      return {
        english: word.english,
        spanish: word.spanish,
        mVal: 1,
        next: i + 1
      };
    });

    mappedWordList[mappedWordList.length - 1].next = 0;

    const digest = await User.hashPassword(password);
    const newUser = {
      username,
      password: digest,
      name,
      wordList: mappedWordList
    };
    const result = await User.create(newUser);

    await res
      .status(201)
      .location(`/api/user/${result.id}`)
      .json(result);
  } catch (err) {
    if (err.code === 11000) {
      err = new Error('The username already exists');
      err.status = 400;
    }
    next(err);
  }
});

router.patch('/:id', (req, res, next) => {
  const { id } = req.params;
  const { head, wordList, correctCount, totalGuesses } = req.body;
  const updateUser = {
    head,
    wordList,
    correctCount,
    totalGuesses
  };
  User.findOneAndUpdate({ _id: id }, updateUser, { new: true })
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  let id = req.params.id;
  User.findById(id, 'wordList')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

module.exports = router;
