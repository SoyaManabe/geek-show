'use strict';
const express = require('express');
const router = express.Router();
//認証を確かめるハンドラ関数がある前提で実装
const authenticationEnsurer = require('./authentication-ensurer');
//UUIDを使用
const uuid = require('uuid');
const Book = require('../models/book');
const User = require('../models/user');
const Comment = require('../models/comment');
const moment = require('moment-timezone');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
    res.render('new', { user: req.user, csrfToken: req.csrfToken() });
});

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
    //console.log(req.body); //ほんの情報を保存する実装をする
    //res.redirect('/');
    const postId = uuid.v4();
    const updatedAt = new Date();
    Book.create({
        postId: postId,
        bookName: req.body.bookName.slice(0, 255),
        tag: req.body.tag,
        isbn: req.body.isbn,
        memo: req.body.memo,
        createdBy: req.user.id,
        updatedAt: updatedAt
    }).then((book) => {
        res.redirect('/books/' + book.postId);
    });
});

router.get('/:postId', authenticationEnsurer, (req, res, next) => {
    const title = 'geek_show';
    Book.findOne({
        include: [
            {
                model: User,
                attributes: ['userId', 'username']
            }],
        where: {
            postId: req.params.postId
        },
        order: [['"updatedAt"', 'DESC']]
    }).then((book) => {
        if (book) {
            book.formattedUpdatedAt = moment(book.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
            //コメント取得
            Comment.findAll({
                where: { postId: book.postId }
                //ここまででその本に関するポストに絞る
            }).then((comments) => {
                //userMap
                //commentMapコメント者のidと内容を配列に格納
                const commentMap = new Map();
                const userMap = new Map(); // key: userId, value: User
                comments.forEach((comment) => {
                    /*
                    userMap.set(parseInt(req.user.id), {
                        isSelf: true,
                        userId: parseInt(req.user.id),
                        username: req.user.username
                    });*/
                    commentMap.set(comment.userId, comment.comment);
                    userMap.set(comment.userId, {
                        isSelf: parseInt(req.user.id) === comment.userId,
                        userId: comment.userId,
                        username: comment.username
                    });
                });
                const users = Array.from(userMap).map((keyValue) => keyValue[1]);
                console.log(users);
                res.render('book', {
                    user: req.user,
                    book: book,
                    users: users,
                    commentMap: commentMap
                });
            });
        } else {
            const err = new Error('Not found the book');
            err.status = 404;
            next(err);
        }
    });
});

router.get('/:postId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
    Book.findOne({
        where: {
            postId: req.params.postId
        }
    }).then((book) => {
        if (isMine(req, book)) { //only person who shelfed
            res.render('edit', {
                user: req.user,
                book: book,
                csrfToken: req.csrfToken()
            });
        } else {
            const err = new Error('No sucha book or no permission');
            err.status = 404;
            next(err);
        }
    });
});

function isMine(req, book) {
    return book && parseInt(book.createdBy) === parseInt(req.user.id);
}

router.post('/:postId', authenticationEnsurer, csrfProtection, (req, res, next) => {
    Book.findOne({
        where: {
            postId: req.params.postId
        }
    }).then((book) => {
        if (book && isMine(req, book)) {
            if (parseInt(req.query.edit) === 1) {
                const updatedAt = new Date();
                book.update({
                    postId: book.postId,
                    bookName: req.body.bookName.slice(0, 255),
                    tag: req.body.tag,
                    isbn: req.body.isbn,
                    memo: req.body.memo,
                    createdBy: req.user.id,
                    updatedAt: updatedAt
                }).then((book) => {
                    res.redirect('/books/' + book.postId);
                });
            } else if (parseInt(req.query.delete) ==1) {
                deleteBook(req.params.postId, () => {
                    res.redirect('/');
                });
            } else {
                const err = new Error('Bad Request');
                err.status = 400;
                next(err);
            }
        } else {
            const err = new Error('Not found or Not aothorized');
            err.status = 404;
            next(err);
        }
    });
});

function deleteBook(postId, done, err) {
    return Book.findById(postId).then((b) => {
        return b.destroy(); 
    }).then(() => {
        if (err) return done(err);
        done();
    });
}

router.deleteBook = deleteBook;

module.exports = router;