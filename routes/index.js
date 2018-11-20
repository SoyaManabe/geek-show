'use strict';
const express = require('express');
const router = express.Router();
const Book = require('../models/book');

/* GET home page. */
/**
 * Group内全員の投稿を見れる
 */
router.get('/', function(req, res, next) {
  const title = 'geek_show';
  if (req.user) {
    Book.findAll({
      /*
      where: {
        createdBy: req.user.id
      },*/
      order: [['"updatedAt"', 'DESC']]
    }).then((books) => {
      res.render('index', {
        title: title,
        user: req.user,
        books: books
      });
    });
  } else {
    res.render('index', {title: title, user: req.user });
  }
});

module.exports = router;
