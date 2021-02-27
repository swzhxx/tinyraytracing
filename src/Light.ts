import Vector from "./vec"

class Light {
  public position: Vector
  public intensity: number
  constructor(p: Vector, i: number) {
    this.position = p
    this.intensity = i
  }
}

export default Light