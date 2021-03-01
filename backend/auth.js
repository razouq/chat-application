const passport = require('passport');
const LocalStrategy = require("passport-local");


module.exports = (app) => {
  passport.deserializeUser((id, done) => {
    console.log(user);
    done(null, user);
  });
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, (email, password, done) => {
      // user mongoose to validate user
      if (password !== "razouq") {
        console.log("failed auth");
        return done(null, false);
      }
      console.log("success login");
      return done(null, user);
    })
  );
}