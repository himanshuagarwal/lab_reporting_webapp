const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const { ensureAuthenticated } = require('../config/auth');

const connection = require('../config/dbconn');

connection.connect(function(err) {
  if(!err) console.log("Connected DB!");
});



// Login
router.get('/', (req, res) => res.render('adminlogin'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    let errors = []

    connection.query('SELECT (SELECT COUNT(*) FROM users) AS total_users,(SELECT COUNT(*) FROM reports) AS total_reports FROM dual', function(err, result) {
        if (err) {
            errors.push({ msg: err });
            res.render('admindashboard', {
            user: req.user,
            print: result,
            errors : errors
            });
        } else {
            console.log(result);
            res.render('admindashboard', {
            user: req.user,
            print: result,
            errors : errors
            });
        }
    });
});


// Get Reports
router.get('/getreports', ensureAuthenticated, (req, res) => {
    let errors = []

    connection.query('SELECT * FROM reports', function(err, result) {
        if (err) {
            errors.push({ msg: err });
            res.render('getreports', {
            user: req.user,
            print: result,
            errors : errors
            });
        } else {
            if(!result.length){
            errors.push({ msg: "No reports found currently." });
            }
            console.log(result);
            res.render('getreports', {
            user: req.user,
            print: result,
            errors : errors
            });
        }
    });
});


// Get Invoices
router.get('/getinvoice', ensureAuthenticated, (req, res) => {
    let errors = []

    connection.query("SELECT * FROM users where iid != 'admin'", function(err, result) {
        if (err) {
            errors.push({ msg: err });
            res.render('getinvoice', {
            user: req.user,
            print: result,
            errors : errors
            });
        } else {
            if(!result.length){
            errors.push({ msg: "No Invoices found currently." });
            }
            console.log(result);
            res.render('getinvoice', {
            user: req.user,
            print: result,
            errors : errors
            });
        }
    });
});


// Delete Reports
router.get('/reportdel', ensureAuthenticated, (req, res) => {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var id = req.query.id;
    let errors = []

    connection.query('Delete FROM reports where id = ?',[id], function(err, result) {
        if (err) {
            errors.push({ msg: err });
            res.render('getreports', {
            user: req.user,
            print: result,
            errors : errors
            });
        } else {
          res.redirect('/admin/getreports');
        }
    });
});


// Delete Invoices
router.get('/invoicedel', ensureAuthenticated, (req, res) => {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var id = req.query.id;
    let errors = []

    connection.query('Delete FROM users where id = ?',[id], function(err, result) {
        if (err) {
            errors.push({ msg: err });
            res.render('getinvoice', {
            user: req.user,
            print: result,
            errors : errors
            });
        } else {
          res.redirect('/admin/getinvoice');
        }
    });
});



// Add Invoice
router.get('/newinvoice', (req, res) => res.render('newinvoice'));

// Add Report
router.get('/newreport', (req, res) => res.render('newreport'));

 // SET STORAGE
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/reports')
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.pdf')
      }
    });
     
    const upload = multer({ storage: storage });


// New Report
router.post('/newreport', upload.single('reportup'), (req, res) => {

    const { iid, name, testname, date } = req.body;
    const file = req.file
    console.log(req.body);
    console.log(req.file);
    let errors = [];
  
    if (!iid || !name  || !testname || !date ) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if(!file){
      errors.push({ msg: 'Please upload a file' });
    }


    if (errors.length > 0) {
        res.render('newreport', {
            errors,
            iid,
            name,
            testname,
            date
        });
    } 
    else {
    const reportname = file.filename;
    const values = [[iid, name, testname, date, reportname]];
    connection.query('SELECT * FROM users where iid = ?', [iid], function(err, result) {
     if (err) {
         errors.push({ msg: err });
         res.render('newreport', {
            errors,
            iid,
            name,
            testname,
            date
         });
     } 
    else { 
      if(result.length){
         connection.query('INSERT INTO reports (iid, name, testname, date, reportid) VALUES ?',[values], function(err, result) {
             if (err) {
                 errors.push({ msg: err });
                 res.render('newreport', {
                    errors,
                    iid,
                    name,
                    testname,
                    date
                 });
             } else {
                 req.flash('success_msg', 'Sucessfully Added Report');
                 res.redirect('/admin/newreport');
             }

         }); 
      }
      else{
        errors.push({ msg: 'This Invoice ID is yet not added.' });
         res.render('newreport', {
            errors,
            iid,
            name,
            testname,
            date
         });
      }
    }
  });
  }

});



// New Invoice
router.post('/newinvoice', (req, res) => {

    const { iid, password, password2 } = req.body;
    console.log(req.body);
    const values = [[iid,password]];
    let errors = [];

    if (!iid || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('newinvoice', {
            errors,
            iid,
            password,
            password2
        });
    } else { 
     connection.query('SELECT * FROM users where iid = ?', [iid], function(err, result) {
     if (err) {
         errors.push({ msg: err });
         res.render('newinvoice', {
             errors,
             iid,
             password,
             password2
         });
     } else {

      if(!result.length){
         connection.query('INSERT INTO users (iid,password) VALUES ?',[values], function(err, result) {
             if (err) {
                 errors.push({ msg: err });
                 res.render('newinvoice', {
                     errors,
                     iid,
                     password,
                     password2
                 });
             } else {
                 req.flash('success_msg', 'Sucessfully Added Invoice');
                 res.redirect('/admin/newinvoice');
             }

         }); 
      }
      else{

         errors.push({ msg: 'Invoice Already registered.' });
         res.render('newinvoice', {
             errors,
             iid,
             password,
             password2
         });
      }

     }

 });


    }

});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login/admin');
});

module.exports = router;
