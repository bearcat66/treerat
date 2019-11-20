var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var helmet = require('helmet')
var session = require('express-session')
var uuid = require('uuid')
var redis = require('redis')
const Jigs = require('./lib/jigs')
const run = Jigs.RunTrueReview
const logger = require('./src/logger.js')
const log = logger.CreateLogger()

// Establish Redis connection
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);

redisClient.on('error', (err) => {
  log.error('Redis error: ', err);
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var locationsRouter = require('./routes/locations');
var reviewRouter = require('./routes/review');
var trueReviewRouter = require('./routes/truereview');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var tokenRouter = require('./routes/tokens');
var sessionRouter = require('./routes/session');
var txRouter = require('./routes/transaction');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(helmet())
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
var sess = {
  genid: (req) => {
    log.info('Inside the session middleware')
    if (req.sessionID) {
      return req.sessionID
    }
    return uuid() // use UUIDs for session IDs
  },
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000
  },
  secret: process.env.TR_OWNER,
  resave: false,
  saveUninitialized: false,
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 })

}
// Session middleware
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}

app.use(session(sess))

// Restrict access to only logged in users
app.use(function(req, res, next) {
  if (!req.session.user && req.method == 'POST' && !req.path.startsWith('/api/login')) {
    res.status(401).send(JSON.stringify({error: "Unauthorized"}))
    return
  }
  next()
})
app.use(function(req, res, next) {
  run.sync()
  next()
})

app.use('/api', indexRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', usersRouter);
app.use('/api/session', sessionRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/review', reviewRouter);
app.use('/api/truereview', trueReviewRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/transaction', txRouter);
app.use('/api/tokens', tokenRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  log.error(err.message)

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

run.activate()
log.info("Starting run instance sync...")
run.sync().then(r => {
  log.info('Successfully synced run instance')
})

module.exports = app;
