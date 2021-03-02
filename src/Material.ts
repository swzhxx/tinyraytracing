import Vector from "./vec"

class Material {

  //albedo.x 漫反射系数, albedo.y 高光系数
  constructor(public albedo: Vector, public diffuseColor: Vector, public specualExponent: Number) {

  }
}

export default Material