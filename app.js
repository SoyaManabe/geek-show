var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//for use helmet
var helmet = require('helmet');
// for Github oauth
var session = require('express-session');
var passport = require('passport');

//medelsの読み込み
var User = require('./models/user');
var Book = require('./models/book');
var Comment = require('./models/comment');
User.sync().then(() => {
  Book.belongsTo(User, {foreignKey: 'createdBy'});
  Book.sync();
  Comment.belongsTo(User, {foreignKey: 'userId'});
  Comment.sync();

})

var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = 'fb10d79055f6b60722d9';
var GITHUB_CLIENT_SECRET = 'db6b6cd71b6fbc9e55a55d79dc647cd0171803ad';

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Userモデルに対してユーザー名とユーザーIDをテーブルに保存
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

//githubstrategy終わったら、login logoutrouteσ定義終わったら下のapp.use
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
//routes/books.jsをルーターとして登録
var booksRouter = require('./routes/books');
var userRouter = require('./routes/users');
var commentsRouter = require('./routes/comments');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'ae1e8b9594116ad0', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/books', booksRouter);
app.use('/users', userRouter);
app.use('/books', commentsRouter);

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
  });

app.get('/auth/github/callback',
  passport.authenticate('github', { failueRedirect: '/login' }),
  function (req, res) {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom &&
      loginFrom.indexOf('http://') < 0 &&
      loginFrom.indexOf('https://') < 0) {
        res.clearCookie('loginFrom');
        res.redirect(loginFrom);
      } else {
        res.redirect('/');
      }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
