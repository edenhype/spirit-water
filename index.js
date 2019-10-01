var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('./public'))
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

playerList = []

io.on('connection', player => {
  player.position = {x: 0, y: 0, z: 0}
  playerList.push(player)

  io.emit('newplayer', {playerId: player.id})

  player.emit('welcome', playerList.map(p => ({playerId: p.id, position: p.position})))

  player.on('move', position => {
    player.position = position
    io.emit('playermovement', {playerId: player.id, location: position})
  })
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});