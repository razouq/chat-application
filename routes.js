const passport = require("passport");
const { model } = require("mongoose");
const { render } = require("ejs");
const User = model('User');

module.exports = (app) => {
  app.get("/", (req, res) => {
    console.log("new call home");
    return res.render("index", { name: req?.user?.username || '' });
  });

  app.get("/users", async (req, res) => {
    let users;
    try {
      users = await User.find().select('username');
    } catch(e) {
      console.log(e);
    }
    return res.render('users', {users});
  })

  app.get("/chat", async (req, res) => {
    const {userid} = req.query;
    let user;
    try {
      user = await User.findById(userid).select('username');
    } catch(e) {
      console.log(e);
    }
    return res.render('chat', {user});
  })

  app.get("/register", (req, res) => {
    return res.render("register");
  });

  app.post("/register", async (req, res, next) => {
    const {username, email, password} = req.body;
    const user = new User({
      username,
      email,
      password,
    });

    try {
      await user.save();
    } catch(e) {
      console.log(e);
    }

    return res.redirect('/');
  });

  app.get("/login", (req, res) => {
    return res.render("login");
  });

  app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );
};