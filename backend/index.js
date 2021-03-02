require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");

require('./users.model');

const routes = require('./routes');
const auth = require('./auth');

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

const sessionMiddleware = session({
  secret: "razouq_secret",
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
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



const user = {
  _id: "1",
  username: "bendarsi@gmail.com",
  password: "razouq",
};

const http = require("http").createServer(app);
const io = require("socket.io")(http);


io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.on("connection", (socket) => {
  const session = socket.request.session;
  session.save();
  socket.on("ping", (data) => {
    console.log(data);
  });
  socket.emit("test", "teeest");
  console.log(`socket.io connected: ${socket.id}`);
});

http.listen(3000, () => {
  console.log("Listenning on port 3000");
});
