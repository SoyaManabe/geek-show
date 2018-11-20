'use strict';
//(1)フレームワークの定義
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Comment = require('../models/comment');

router.post('/:postId/users/:userId/comments', authenticationEnsurer, (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.params.userId;
    const comment = req.body.comment;

    Comment.upsert({
        postId: postId,
        userId:  userId,
        comment: comment.slice(0, 255)
    }).then(() => {
        res.json({ status: 'OK', comment: comment });
    });
});

module.exports = router;