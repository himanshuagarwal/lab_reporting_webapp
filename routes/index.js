const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const connection = require('../config/dbconn');

connection.connect(function(err) {
  if(!err) console.log("Connected DB!");
});

// Login
router.get('/', (req, res) => res.render('userlogin'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    let errors = []

    connection.query('SELECT * FROM reports where iid = ?',[req.user.iid], function(err, result) {
        if (err) {
            errors.push({ msg: err });
            res.render('dashboard', {
            user: req.user,
            print: result,
            errors : errors
            });
        } else {
            if(!result.length){
            errors.push({ msg: "No reports found currently." });
            }
            console.log(result);
            res.render('dashboard', {
            user: req.user,
            print: result,
            errors : errors
            });
        }
    });
});


// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login/users');
});

module.exports = router;