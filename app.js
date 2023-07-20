var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser')
const session = require('express-session')
const multer = require('multer')
const handlebars = require('handlebars');
const handlebarsHelpers = require('handlebars-helpers')


mongoose.connect('mongodb+srv://unais5676:AMfY6UQE1zZkf2EH@jucoberry.crlson3.mongodb.net/')
// view engine setup


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const config = require('./config/config')

var app = express();

// handlebars.registerHelper('eq', function (a, b, options) {
//   return a === b ? options.fn(this) : options.inverse(this);
// });

handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});




app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',helpers:handlebarsHelpers()}))

console.log(path.join(__dirname, 'views', 'partials'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({secret:config.sessionSecret}))

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);

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


app.listen(3000)


