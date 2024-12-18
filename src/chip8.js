import { FPS, START_ADDRESS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./constants.js"
import CPU from "./cpu.js"

export default class Chip8 {
  /**
   * @type {CPU}
   */
  cpu

  constructor(keyboard, sound, display) {
    this.keyboard = keyboard
    this.sound = sound
    this.display = display
    this.cpu = new CPU(this.keyboard, this.sound, this.display)

    this.currentRom = null

    this.freeze = false

    this.elapsed = 0
    this.lastTimestamp = 0
    this.fixedFPS = 1000 / 60

    this.tick = this.tick.bind(this)
    // this.run = this.run.bind(this)
  }

  /**
   * loadRomBufferInMemory(buffer)
   * @param {Uint8Array} buffer 
   */
  loadRomBufferInMemory(buffer) {
    for (let loc = 0; loc < buffer.length; loc++) {
      this.cpu.memory[START_ADDRESS + loc] = buffer[loc]
    }
  }

  /**
   * fetchRom(romName)
   * @param {string} romName
   */
  async fetchRom(romName) {
    this.currentRom = romName
    const response = await fetch(`roms/${romName}.ch8`)
    const data = await response.arrayBuffer()
    this.loadRomBufferInMemory(new Uint8Array(data))
  }

  init(romName) {
    this.cpu.loadFontsetInMemory()
    this.fetchRom(romName)
  }

  clear() {
    this.cpu.clearDisplay()
    this.cpu = new CPU(this.keyboard, this.sound, this.display)
  }

  onScaleChange(newScale) {
    this.cpu.display.scale = newScale
    this.cpu.display.pixelSize = newScale
    this.cpu.display.canvas.width = VIDEO_WIDTH * newScale
    this.cpu.display.canvas.height = VIDEO_HEIGHT * newScale
  }

  drawInfo() {
    appTimerInterval.innerText = Math.floor(this.fixedFPS) + "ms"
    appTimerElapsed.innerText = this.elapsed + "s"
    appTimerDelay.innerText = this.cpu.delayTimer
  }

  tick(timestamp) {
    const deltaTime = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp
    if (!this.elapsed) { this.elapsed = 0 }
    this.elapsed += deltaTime
    while (this.elapsed >= this.fixedFPS) {
      this.elapsed -= this.fixedFPS
    }
    this.drawInfo()
    this.cpu.cycle()
    requestAnimationFrame(this.tick)
  }
}
