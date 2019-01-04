const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Passport Config
require('./config/passport')(passport);

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// User Routes
app.use('/', require('./routes/index.js'));
app.use('/login', require('./routes/login.js'));


//Admin Routes
const { ensureAdminAuthenticated } = require('./config/auth');
app.use('/admin', ensureAdminAuthenticated)
app.use('/admin', require('./routes/admin.js'));


//Static View
const { ensureAuthenticated } = require('./config/auth');
app.use('/view', ensureAuthenticated)
app.use('/view', express.static('public/reports'))


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));