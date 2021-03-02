let socket = io();
socket.on("test", (data) => {
  console.log(data);
});
socket.on('new message', ({message, sender}) => {
  console.log('new message : ', {message, sender});
  addMessage(message, sender);
});

function sendMessage() {
  const message = document.getElementById('message').value;
  console.log(message);
  addMessage(message, 'You');
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const userId = urlParams.get('userid');
  socket.emit('message', {message, userId});
  document.getElementById('message').value = "";
  return false;
}

function addMessage(message, sender) {
  const ul = document.getElementById('messages');
  const li = document.createElement('li');
  li.appendChild(document.createTextNode(`${sender} : ${message}`));
  ul.appendChild(li);
}
