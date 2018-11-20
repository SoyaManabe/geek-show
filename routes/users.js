'use strict';
const express = require('express');
const router = express.Router();
//認証を確かめるハンドラ関数がある前提で実装
const authenticationEnsurer = require('./authentication-ensurer');
const Book = require('../models/book');

router.get('/:userId', authenticationEnsurer, (req, res, next) => {
    Book.findAll({
        where: {
            createdBy: req.params.userId
        },
        order: [['"updatedAt"', 'DESC']]
    }).then((books) => {
        if (books) {
            res.render('user', {
                books: books,
                user: req.user,
                geekname: req.params.userId
        });
        } else {
            const err = new Error('まだほんの投稿がされていないユーザーです');
            err.status = 404;
            next(err);
        }
    });
});

module.exports = router;