import Vector from "./vec"

class Material {
  public diffuseColor: Vector
  constructor(public color: Vector) {
    this.diffuseColor = color
  }
}

export default Material