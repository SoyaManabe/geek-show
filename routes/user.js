const uuid = require('uuid');
const User = require('../models/user');
const Book = require('../models/book');
const authenticationEnsurer = require('./authentication-ensurer');

//ここ何している？
router.get('/new', authenticationEnsurer, (req, res, next) => {
    res.render('new', { user: req.user });
});

router.get('/:userId', authenticationEnsurer, (req, res, next) => {
    User.findOne({
        include: [
            {
                model
            }
        ]
    })
})