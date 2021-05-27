var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var multer  = require('multer');
var flash = require('connect-flash');
const csrf = require('csurf');

const User = require('./model/authModel');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var store = new MongoDBStore({
  uri: 'mongodb+srv://neeraj:niru143@cluster0.cf2jj.mongodb.net/newDb?retryWrites=true&w=majority',
  collection: 'mySessions'
});

const csrfProtection = csrf();


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname )
  }
})

var fileFilter = (req, file, cb) => {
  if(
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb( null , true)
  }else{
    cb(null, false)
  }
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(multer({ storage: storage , fileFilter: fileFilter, dest: './images'}).single('image'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: store
  // cookie: {
  //   expires: 600000
  // }
}));
app.use(flash());
app.use(csrfProtection);

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    req.user = user;
    // console.log(req.user,'app js 43')
    next();
  })
  .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  console.log(res.locals.csrfToken,'app.js 51')
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

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

mongoose.connect('mongodb+srv://neeraj:niru143@cluster0.cf2jj.mongodb.net/newDb?retryWrites=true&w=majority')
.then(result=> {
  app.listen(3000);
  console.log('Database connected');
})
.catch(err => console.log(err));

// module.exports = app;
