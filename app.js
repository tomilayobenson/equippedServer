var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport')
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRouter');
var productsRouter = require('./routes/productsRouter');
var ordersRouter = require('./routes/ordersRouter');
var categoriesRouter = require('./routes/categoriesRouter');


const mongoose = require('mongoose');
const url = process.env.ATLASDB_URL;

const connect = async () => {
  await mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

connect().then(() => console.log('Connected correctly to server'), err => console.log(err))

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/categories', categoriesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
// exports.equippedServer = app;
