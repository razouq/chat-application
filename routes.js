const passport = require('passport');
const { model } = require('mongoose');
const { render } = require('ejs');
const User = model('User');
const Message = model('Message');

const requireAuth = (req, res, next) => {
  const { user } = req;
  if (user) return next();
  return res.redirect('/');
};

module.exports = app => {
  app.get('/', (req, res) => {
    return res.render('index', {
      name: req?.user?.username || '',
      authUser: req.user,
    });
  });

  app.get('/users', requireAuth, async (req, res) => {
    const { user } = req;
    let users;
    try {
      users = await User.find({ _id: { $ne: user.id } }).select('id username');
    } catch (e) {
      console.log(e);
    }
    return res.render('users', { users, authUser: req.user });
  });

  app.get('/chat', async (req, res) => {
    const { userid } = req.query;
    let user;
    let messages;
    try {
      user = await User.findById(userid).select('username');
      messages = await Message.find({
        $or: [
          { receiver: req.user.id, sender: userid },
          { sender: req.user.id, receiver: userid },
        ],
      });
    } catch (e) {
      console.log(e);
    }
    return res.render('chat', { user, authUser: req.user, messages });
  });

  app.get('/register', (req, res) => {
    return res.render('register', { authUser: req.user });
  });

  app.post(
    '/register',
    async (req, res, next) => {
      const { username, email, password } = req.body;
      const user = new User({
        username,
        email,
        password,
      });

      try {
        await user.save();
      } catch (e) {
        console.log(e);
      }

      return next();
    },
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    },
  );

  app.get('/login', (req, res) => {
    return res.render('login', { authUser: req.user });
  });

  app.post(
    '/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    },
  );

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};
