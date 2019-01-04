module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login/users');
  },
  ensureAdminAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      if(req.user.iid == 'admin'){
          return next();
      }
    }
    req.flash('error_msg', 'Please log in as admin to view that resource');
    res.redirect('/login/admin');
  }
};
