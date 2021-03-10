import Vector from "./vec"

class Material {

  //albedo.x 漫反射系数, albedo.y 高光系数
  constructor(public refractiveIndex: number, public albedo: Array<number>, public diffuseColor: Vector, public specualExponent: Number) {

  }
}

export default Material