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

//今回やったところ！！！！
router.get('/:userId/edit', authenticationEnsurer, (req, res, next) => {
    User.findOne({
        where: {
            userId: req.params.userId
        }
    }).then((user) => {
        if (isMine(req, user)) {
            res.render('profile', {
                user: user
            });
        } else {
            const err = new Error('You are not authorized to edit this profile');
            err.status = 404;
            next(err);
        }
    });
});



router.post('/:userId', authenticationEnsurer, (req, res, next) => {
    console.log(req.body.profile);
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
                if (user && isMine(req, user)) {
                    if (parseInt(req.query.edit) === 1) {
                        user.update({
                            profile: req.body.profile
                        });
                        res.render('user', {
                            books: books,
                            //user: req.user,
                            user: user,
                            geekid: req.params.userId,
                            geek: user
                        });
                    } else {
                        const err = new Error('Bad request');
                        err.status = 400;
                        next(err);
                    }
                } else {
                    const err = new Error('You are not authorized');
                    err.status = 404;
                    next(err);
                }
            });
        } else {
            const err = new Error('まだほんの投稿がされていないユーザーです');
            err.status = 404;
            next(err);
        }
    });
});

function isMine(req, user) {
    return user && parseInt(user.userId) === parseInt(req.user.id);
}

module.exports = router;