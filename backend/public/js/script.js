console.log('hi');
  let socket = io();
  socket.on('test', (data) => {
    console.log(data);
  });
  socket.emit('ping', 'pong')