let express = require('express')
let path = require('path')
let app = express()
let server = require('http').createServer(app)
let io = require('socket.io')(server)
let THREE = require('three')
let players = []
let teamSorter = 0
let trees = [
  {position: new THREE.Vector3(-25, -20, 0), squareRadius: 10, life: 1},
  {position: new THREE.Vector3(25, 10, 0), squareRadius: 10, life: 1},
]
let pool = {position: new THREE.Vector3(0, -10, 0), squareRadius: 70, life: 1}

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (_, res) => res.sendFile(__dirname + 'public/index.html'))

io.on('connection', player => {
  player.on('disconnect', () => {
    if (player.name)
      players.find(p => p.name === player.name).online = false
  })

  player.on('getPlayer', username => {
    let index = players.findIndex(p => p.name === username)
    
    if (username && index >= 0) {
      if (players[index].online) {
        player.emit('err-getPlayer')
        console.log('not allowed')
      } else {
        player.name = username
        player.emit('setPlayer', players[index])
      }
    } else {
      const playerTeam = teamSorter = teamSorter ? 0 : 1

      player.name = player.id

      players.push({
        name: player.name,
        speed: 0.2,
        position: trees[playerTeam].position.clone().add(trees[playerTeam].position.clone().normalize().multiplyScalar(-1)),
        velocity: new THREE.Vector3(),
        team: playerTeam,
        water: 0,
        online: true
      })

      player.emit('setPlayer', players[players.length - 1])
    }
  })

  player.on('setDirection', direction => {
    let index = players.findIndex(p => p.name === player.name)

    if (index < 0) return
    players[index].velocity.copy(direction).multiplyScalar(players[index].speed)
  })
})

setInterval(function() {
  players.forEach(p => {
    let distanceToTree = undefined

    p.position.add(p.velocity)

    distanceToTree = p.position.distanceToSquared(trees[p.team].position)

    if (pool.life > 0 && p.water < 1 && p.position.distanceToSquared(pool.position) < pool.squareRadius * pool.life) {
      pool.life -= 0.004
      p.water += 0.008
    } else if (p.water > 0 && distanceToTree < trees[p.team].squareRadius * trees[p.team].life) {
      trees[p.team].life += 0.0025
      p.water -= 0.008
    }

    if (distanceToTree < trees[p.team].squareRadius * trees[p.team].life * 0.8)
      p.position.add(p.position.clone().sub(trees[p.team].position).normalize().multiplyScalar(0.1))

    p.position.x = Math.min(Math.max(-40, p.position.x), 40)
    p.position.y = Math.min(Math.max(-50, p.position.y), 30)
    p.position.z = 0
  })

  if (pool.life < 1) pool.life += 0.002

  io.emit('update', {players, trees, pool})
}, 1000/60)

server.listen(process.env.PORT || 3000, console.log('listening on *:3000'))
