require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const passportSocketIo = require("passport.socketio");
const cookieParser = require("cookie-parser");

require("./users.model");
const {model} = require('mongoose');
const User = model('User');

const routes = require("./routes");
const auth = require("./auth");

try {
  mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("connected to DB");
    }
  );
} catch (e) {
  console.log(e);
}

const MongoStore = require("connect-mongo").default;
const store = MongoStore.create({ mongoUrl: process.env.MONGO_URI });

const sessionMiddleware = session({
  secret: "razouq_secret",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  store,
});

const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

routes(app);
auth(app);

const http = require("http").createServer(app);
const io = require("socket.io")(http);

function onAuthorizeSuccess(data, accept) {
  console.log("successful connection to socket.io");
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log("failed connection to socket.io:", message);
  accept(null, false);
}

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "connect.sid",
    secret: "razouq_secret",
    store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
  })
);

io.on("connection",async (socket) => {
  console.log("socket id : ", socket.id, socket.request.user);
  const {user} = socket.request;
  user.socketId = socket.id;
  socket.on('message', async ({message, userId}) => {
    console.log('new message', message);
    let user;
    try {
      user = await User.findById(userId).select('username socketId');
    } catch(e) {
      console.log(e);
    }
    io.to(user.socketId).emit('new message', {message, sender: user.username});
  })
  await user.save();
});

http.listen(3000, () => {
  console.log("Listenning on port 3000");
});
