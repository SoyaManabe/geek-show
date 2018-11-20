'use strict';
const express = require('express');
const router = express.Router();
//認証を確かめるハンドラ関数がある前提で実装
const authenticationEnsurer = require('./authentication-ensurer');
const Book = require('../models/book');
const User = require('../models/user');

router.get('/:userId', authenticationEnsurer, (req, res, next) => {
    Book.findAll({
        where: {
            createdBy: req.params.userId
        },
        order: [['"updatedAt"', 'DESC']]
    }).then((books) => {
        if (books) {
            User.findOne({
                where: {
                    userId: req.params.userId
                }
            }).then((user) => {
                res.render('user', {
                    books: books,
                    user: req.user,
                    geekid: req.params.userId,
                    geek: user
                });
            });
        console.log(req.params);
        } else {
            const err = new Error('まだほんの投稿がされていないユーザーです');
            err.status = 404;
            next(err);
        }
    });
});

module.exports = router;