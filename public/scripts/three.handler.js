const ThreeHandler = {
  scene: undefined,
  camera: undefined,
  renderer: undefined,
  players: [],
  init() {
    const aspect = window.innerWidth / window.innerHeight;

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.loader = new THREE.GLTFLoader()

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.ground = new THREE.Object3D()
    this.pool = new THREE.Object3D()
    this.trees = [new THREE.Object3D(), new THREE.Object3D()]
    this.goalIndicator = new THREE.Object3D()
    this.light = new THREE.DirectionalLight(0xffffff, 2)

    this.light.castShadow = true
    this.light.position.z = 10

    const goalGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
    const goalMaterial = new THREE.MeshBasicMaterial({color: 0x5544ff});
    goalMaterial.transparent = true
    goalMaterial.opacity = 0.75
    this.goalIndicator.add(new THREE.Mesh(goalGeometry, goalMaterial))
    this.goalIndicator.rotation.x += Math.PI / 2

    this.loader.load('assets/models/ground.gltf', gltf => {
      if (gltf.scene) gltf.scene.rotation.x += Math.PI / 2

      this.ground.receiveShadow = true
      gltf.scene.traverse(o => o.receiveShadow = true)
      
      this.ground.add(gltf.scene)
    })

    this.loader.load('assets/models/pool.gltf', gltf => {
      if (gltf.scene) gltf.scene.rotation.x += Math.PI / 2

      this.pool.receiveShadow = true
      gltf.scene.traverse(o => o.receiveShadow = true)
      
      this.pool.add(gltf.scene)
    })
    
    this.loader.load('assets/models/tree.gltf', gltf => {
      if (gltf.scene) gltf.scene.rotation.x += Math.PI / 2
      gltf.scene.position.y -= 20

      this.trees[0].receiveShadow = this.trees[1].receiveShadow = true
      gltf.scene.traverse(o => o.receiveShadow = true)

      this.trees[0].add(gltf.scene.clone())
      this.trees[1].add(gltf.scene.clone())
    })
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;

    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    
    this.scene.add(this.ground)
    this.scene.add(this.pool)
    this.scene.add(this.light)
    this.scene.add(this.goalIndicator)
    this.scene.add(this.trees[0], this.trees[1])
    this.scene.add(new THREE.AmbientLight(0xffffff, 1))

    this.setCurrentPlayer = this.setCurrentPlayer.bind(this)
    this.update = this.update.bind(this)
    this.getMousePlaneIntersection = this.getMousePlaneIntersection.bind(this)
  },
  render() {
    requestAnimationFrame(this.render.bind(this));
    console.log(this.currentPlayer && this.currentPlayer.position)
    this.currentPlayer &&
      this.currentPlayer.position.distanceToSquared(this.currentPlayer.targetPosition) < 0.01 &&
      SocketHandler.setDirection(new THREE.Vector3())

    this.renderer.render(this.scene, this.camera);
  },
  setCurrentPlayer(p) {
    const player = this.players.find(player => player.name === p.name)

    this.currentPlayer = player || this.players[this.players.push(new Entity(p, this.scene)) - 1]
    this.currentPlayer.add(this.camera)
    this.camera.position.set(0, -5, 10)
    this.camera.lookAt(this.currentPlayer.position)
  },
  update(data) {
    let players = data.players

    players.forEach(p => {
      const index = this.players.findIndex(player => player.name === p.name)

      if (index >= 0) {
        this.players[index].position.copy(p.position)
        this.players[index].orb.scale.setScalar(1 + p.water)
        this.players[index].setTeam(p.team, this.currentPlayer && p.team === this.currentPlayer.team)
      } else
        this.players.push(new Entity(p, this.scene))
    })

    this.pool.scale.set(data.pool.life, data.pool.life, 1)

    this.trees[0].position.copy(data.trees[0].position)
    this.trees[0].life = data.trees[0].life
    this.trees[0].scale.setScalar(data.trees[0].life - 0.75)
    this.trees[1].position.copy(data.trees[1].position)
    this.trees[1].life = data.trees[1].life
    this.trees[1].scale.setScalar(data.trees[1].life - 0.75)
    this.currentPlayer && this.goalIndicator.position.copy(this.trees[this.currentPlayer.team].position)
    this.currentPlayer && this.goalIndicator.scale.setScalar(this.trees[this.currentPlayer.team].scale.x).multiplyScalar(4 + (Math.sin(Date.now() * 0.0025)))
    this.goalIndicator.scale.y = 1
  },
  getMousePlaneIntersection(e) {
    if (!this.currentPlayer) return

    const mouse = {x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1}

    this.raycaster.setFromCamera(mouse, this.camera )

    const intersects = this.raycaster.intersectObject(this.ground, true)
    const intersection = intersects.length ? intersects[0].point.clone() : this.currentPlayer.position.clone()
    const direction = intersection.clone().sub(this.currentPlayer.position).normalize()

    this.currentPlayer.targetPosition.copy(intersection)
    this.on.mousePlaneIntersectionCBs.forEach(v => v({intersection, direction}))
  },
  on: {
    mousePlaneIntersectionCBs: [],
    mousePlaneIntersection(callback) {this.mousePlaneIntersectionCBs.push(callback)}
  }
}