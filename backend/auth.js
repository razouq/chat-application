const passport = require("passport");
const LocalStrategy = require("passport-local");

const { model } = require("mongoose");
const User = model("User");

module.exports = (app) => {
  passport.deserializeUser(async (id, done) => {
    let user;
    try {
      user = await User.findById(id);
    } catch (e) {
      console.log(e);
    }
    // find the user
    done(null, user);
  });

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        // user mongoose to validate user
        let user;
        try {
          user = await User.findOne({ email });
        } catch (e) {
          console.log(e);
        }
        if (password !== user.password) {
          console.log("failed auth");
          return done(null, false);
        }
        console.log("success login");
        return done(null, user);
      }
    )
  );
};
