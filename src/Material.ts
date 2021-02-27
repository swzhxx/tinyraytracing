import Vector from "./vec"

class Material {
  public diffuseColor: Vector
  //albedo.x 漫反射系数, albedo.y 高光系数
  public albedo: Vector
  // constructor(public color: Vector) {
  //   this.diffuseColor = color
  // }
  constructor(a: Vector, color: Vector, public specualExponent: Number) {
    this.albedo = a
    this.diffuseColor = color

  }
}

export default Material