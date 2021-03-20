require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');

require('./models/users.model');

const { model } = require('mongoose');
const User = model('User');

const routes = require('./routes');
const auth = require('./auth');

try {
  mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log('connected to DB');
    },
  );
} catch (e) {
  console.log(e);
}

const MongoStore = require('connect-mongo').default;

// socket and http should share the same session (stored in mongoDB)
const store = MongoStore.create({ mongoUrl: process.env.MONGO_URI });

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  store,
});

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

routes(app);
auth(app);

const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    // cookie name, check cookie section in chrome's dev tool
    key: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    store,
  }),
);

io.on('connection', async socket => {
  console.log('socket id : ', socket.id, socket.request.user);
  const { user } = socket.request;
  // update the socket id of current user
  user.socketId = socket.id;
  socket.on('message', async ({ message, userId }) => {
    let user;
    try {
      user = await User.findById(userId).select('username socketId');
    } catch (e) {
      console.log(e);
    }
    io.to(user.socketId).emit('new message', {
      message,
      sender: user.username,
    });
  });
  await user.save();
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log('Listenning on port', PORT);
});
