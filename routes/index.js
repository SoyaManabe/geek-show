'use strict';
const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const User = require('../models/user');
const moment = require('moment-timezone');

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
      books.forEach((book) => {
        book.formattedUpdatedAt = moment(book.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
      });
      User.findAll({
        order: [['"username"', 'DESC']]
      }).then((users) => {
        console.log("number of users is "+users.length);
        res.render('index', {
          title: title,
          user: req.user,
          books: books,
          users: users
        });
      });
      
    });
  } else {
    res.render('index', {title: title, user: req.user });
  }
});

module.exports = router;
