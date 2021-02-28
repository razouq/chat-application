const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require('passport-local');
const bodyParser = require('body-parser')
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  origin: "*",
  methods: ["GET", "POST"],
});

const user = {
  _id: "1",
  username: "bendarsi@gmail.com",
  password: "razouq",
}

passport.deserializeUser((id, done) => {
  console.log(user);
  done(null, user);
});

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    console.log('user: ', username, passport)
    if (password !== "razouq") {
      console.log('failed auth')
      return done(null, false);
    }
    console.log('success login');
    return done(null, user);
  })
);

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


const sessionMiddleware = session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }});
// register middleware in Express
app.use(sessionMiddleware);
// register middleware in Socket.IO
io.use((socket, next) => {
  // sessionMiddleware(socket.request, {}, next);
  sessionMiddleware(socket.request, socket.request.res, next)
  // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
  // connections, as 'socket.request.res' will be undefined in that case
});

app.use(passport.initialize());
app.use(passport.session());

app.post('/login',(req,res, next) => {
  console.log('try to login');
  next();
}, passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
  console.log('rediiirect')
  res.redirect('/');
});





app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));



io.on("connection", (socket) => {
  const session = socket.request.session;
  session.save();
  socket.on("ping", (data) => {
    console.log(data);
  });
  socket.emit("test", "teeest");
  console.log(`socket.io connected: ${socket.id}`);
});

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  console.log("new call home");
  return res.render("index", { name: "anass" });
});

app.get("/login", (req, res) => {
  console.log("new call login");
  return res.render("login");
});

http.listen(3000, () => {
  console.log("Listenning on port 3000");
});
