const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


// Login Page
router.get('/', (req, res) => res.render('login'));

// Login Page
router.get('/users', (req, res) => res.render('userlogin'));

// Login
router.post('/users', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login/users',
    failureFlash: true
  })(req, res, next);
});



// Login Page
router.get('/admin', (req, res) => res.render('adminlogin'));

// Login
router.post('/admin', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/login/admin',
    failureFlash: true
  })(req, res, next);
});

module.exports = router;
