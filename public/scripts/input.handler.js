const InputHandler = {
  domElement: undefined,
  mouseDown: false,
  init(domElement) {
    this.domElement = domElement

    if (!domElement.parent)
      document.body.appendChild(domElement)

    domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    domElement.addEventListener('mouseup', this.onMouseUp.bind(this))

    domElement.addEventListener('contextmenu', e => e.preventDefault()) 
  },
  onMouseDown(e) {
    e.preventDefault()
    this.mouseDown = true
    this.on.mouseDownCBs.forEach(v => {(!v.requiresMouseDown || this.mouseDown) && v.callback(e)})
  },
  onMouseMove(e) {
    e.preventDefault()
    this.on.mouseMoveCBs.forEach(v => {(!v.requiresMouseDown || this.mouseDown) && v.callback(e)})
  },
  onMouseUp(e) {
    e.preventDefault()
    this.mouseDown = false
    this.on.mouseUpCBs.forEach(v => {(!v.requiresMouseDown || this.mouseDown) && v.callback(e)})
  },
  on: {
    mouseDownCBs: [],
    mouseMoveCBs: [],
    mouseUpCBs: [],
    mouseDown(callback, requiresMouseDown) {
      this.mouseDownCBs.push({callback, requiresMouseDown})
    },
    mouseMove(callback, requiresMouseDown) {
      this.mouseMoveCBs.push({callback, requiresMouseDown})
    },
    mouseUp(callback, requiresMouseDown) {
      this.mouseUpCBs.push({callback, requiresMouseDown})
    },
  }
}