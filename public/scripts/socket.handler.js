const SocketHandler = {
  socket: undefined,
  scene: undefined,
  name: undefined,
  players: [],
  init (scene) {
    this.socket = io()
    this.scene = scene

    this.socket.emit('getPlayer', null)//localStorage.getItem(this.localStorageItemName))

    this.socket.on('setPlayer', this.onSetName.bind(this))
    this.socket.on('update', this.onUpdate.bind(this))
    this.socket.on('err-getPlayer', () => {console.log('cant connect. so sad too bad')})
  },
  onSetName (p) {
    localStorage.setItem(this.localStorageItemName, this.name = p.name)

    this.on.setNameCBs.forEach(v => v(p))
  },
  onUpdate (data) {
    if (!this.name) return

    this.on.updateCBs.forEach(v => v(data))
  },
  setDirection (direction = {x: 0, y: 0, z: 0}) {
    this.socket.emit('setDirection', direction)
  },
  on: {
    updateCBs: [],
    setNameCBs: [],
    update(callback) {this.updateCBs.push(callback)},
    setName(callback) {this.setNameCBs.push(callback)},
  },
}