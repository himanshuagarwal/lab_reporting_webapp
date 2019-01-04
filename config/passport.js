const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const connection = require('./dbconn');

connection.connect(function(err) {
  if(!err) console.log("Connected DB!");
});

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'iid' }, (iid, password, done) => {
      console.log('Login Attempted : '+iid+' = '+ password);
      if(!iid || !password ) { return done(null, false,{ message: 'All fields are required.'}); }
      connection.query("select * from users where iid = ?", [iid], function(err, rows){
          //console.log(err);
        if (err) done(null, false, { message: err });
        console.log(rows);

        if(!rows.length){ console.log("CHK 2"); return done(null, false, { message: 'This Inovice ID is not found' }); }
        var dbPassword  = rows[0].password;
        const encPassword = password;
        
        if(!(dbPassword == encPassword)){
            return done(null, false, { message: 'Password incorrect' });
         }
        const user = rows[0];
        return done(null, rows[0]);
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.iid);
  });

  passport.deserializeUser(function(iid, done) {
    connection.query("select * from users where iid  = ?", [iid], function (err, rows){
        done(err, rows[0]);
    });
  });
};

