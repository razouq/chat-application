const app = require("express")();
const cors = require("cors");
const httpServer = require("http").createServer(app);
const session = require("express-session")({
  secret: "razouq",
  resave: true,
  saveUninitialized: true,
});
const sharedsession = require("express-socket.io-session");

const io = require("socket.io")(httpServer, {
  origin: "*",
  methods: ["GET", "POST"],
});


// io.use(function(socket, next) {
//   sessionMiddleware(socket.request, socket.request.res, next);
// });

io.on("connection", (socket) => {
  console.log('hi')
  console.log(socket.id);
  // socket.request.session.socketio = socket.id;
  // socket.request.session.save();
  // Accept a login event with user's data
  // socket.on("login", function (userdata) {
  //   socket.handshake.session.userdata = userdata;
  //   socket.handshake.session.save();
  //   console.log(userdata);
  // });
  // socket.on("logout", function (userdata) {
  //   if (socket.handshake.session.userdata) {
  //     delete socket.handshake.session.userdata;
  //     socket.handshake.session.save();
  //   }
  // });
  console.log(`socket.io connected: ${socket.id}`);
    // save socket.io socket in the session
    console.log("session at socket.io connection:\n", socket.request.session);
    socket.request.session.socketio = socket.id;
    socket.request.session.save();
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(session);

app.get("/", (req, res) => {
  return res.send("hiiii");
});

app.listen(4000);

httpServer.listen(3000);
