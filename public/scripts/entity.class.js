class Entity extends THREE.Object3D {
  static torusGeometry = new THREE.TorusGeometry(1, 0.2, 24, 18);
  static torusMaterial = new THREE.MeshLambertMaterial({color: 0x445544});
  static sphereGeometry = new THREE.SphereGeometry(0.2, 16, 12);
  static allySphereMaterial = new THREE.MeshLambertMaterial({color: 0x5544ff});
  static enemySphereMaterial = new THREE.MeshLambertMaterial({color: 0xff4455});

  constructor(options, scene) {
    super()

    this.name = options.name
    this.position.copy(options.position || {x: 0, y: 0, z: 0})
    this.targetPosition = this.position.clone()
    this.team = options.team || 0
    this.orb = new THREE.Mesh(Entity.sphereGeometry, Entity.allySphereMaterial)
    this.torus = new THREE.Mesh(Entity.torusGeometry, Entity.torusMaterial)

    this.add(this.orb, this.torus)
    this.orb.position.z = this.torus.position.z = 2
    this.castShadow = this.orb.castShadow = this.torus.castShadow = true
    this.receiveShadow = this.orb.receiveShadow = this.torus.receiveShadow = false

    scene && scene.add(this)
  }

  setTeam(team, isAlly) {
    this.team = team
    
    this.orb.material = isAlly ? Entity.allySphereMaterial : Entity.enemySphereMaterial
  }
}