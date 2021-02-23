import Vector from './vec'
class Sphere {

  constructor(public center: Vector, public radius: number) { }

  /**
   * 
   * @param orig  光线的起始点
   * @param dir   光线方向
   * @param t0  
   * @description 光线求交
   */
  rayIntersect(orig: Vector, dir: Vector): boolean {
    let L = Vector.minus(this.center, orig)
    let tca: number = Vector.dot(L, dir)
    let d2 = Vector.dot(L, L) - tca * tca
    if (d2 > this.radius * this.radius) return false
    let thc = Math.sqrt(this.radius * this.radius - d2)

    let t0 = tca - thc
    let t1 = tca + thc

    if (t0 < 0) t0 = t1
    if (t0 < 0) return false

    return true
  }
}

export default Sphere