import Material from './Material'
import Vector from './vec'
class Plane {
  constructor(public norm: Vector, public offset: number, material: Material) { },
  rayIntersect() { }
}
export default Plane