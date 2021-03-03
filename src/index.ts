import Light from './Light'
import Material from './Material'
import Sphere from './Sphere'
import Vector from './vec'

const canvas: HTMLCanvasElement = document.querySelector("#ray-tracing")
const context: CanvasRenderingContext2D = canvas.getContext("2d")
const width = 1024
const height = 768

const reflect = (I: Vector, N: Vector) => {
  return Vector.minus(I, Vector.times(2 * Vector.dot(I, N), N))
}

const refract = (I: Vector, N: Vector, refractiveIndex: number) => {
  let cosi = -Math.max(-1, Math.min(1, Vector.dot(I, N)))
  let etai = 1
  let etat = refractiveIndex
  let n = N

  if (cosi < 0) {
    cosi = -cosi
    n = Vector.times(-1, N)
    const temp = etat
    etat = etai
    etai = temp
  }

  const eta = etai / etat
  const k = 1 - eta * eta * (1 - cosi * cosi)
  return k < 0 ? new Vector(0, 0, 0) : Vector.plus(Vector.times(eta, I), Vector.times(eta * cosi - Math.sqrt(k), n))
}

function sceneIntersect(orig: Vector, dir: Vector, spheres: Array<Sphere>): boolean | any {
  let nearestMaterial = undefined
  let nearestDistance = Infinity
  let N
  let hit
  for (let i = 0; i < spheres.length; i++) {
    let sphere = spheres[i]
    let isIntersect = sphere.rayIntersect(orig, dir)
    if (isIntersect == false) continue
    if (isIntersect < nearestDistance) {
      nearestDistance = isIntersect as number
      nearestMaterial = sphere.material
      hit = Vector.plus(orig, Vector.times(nearestDistance, dir))
      N = Vector.norm(Vector.minus(hit, sphere.center))
    }
  }
  if (nearestMaterial) {
    return { material: nearestMaterial, N, hit }
  }
  return false
}

function castRay(orig: Vector, dir: Vector, spheres: Array<Sphere>, lights: Array<Light>, depth: number = 0): Vector {
  let res = sceneIntersect(orig, dir, spheres)

  if (depth > 4 || !res) {
    return new Vector(0.2, 0.7, 0.8)
  }

  const { material, hit, N } = res

  let diffuseLightIntensity = 0
  let specualLightIntensity = 0

  let reflectDir = Vector.norm(reflect(dir, N))
  let reflectOrig = Vector.dot(reflectDir, N) < 0 ? Vector.minus(hit, Vector.times(0.0001, N)) : Vector.plus(hit, Vector.times(0.0001, N))
  let reflectColor = castRay(reflectOrig, reflectDir, spheres, lights, depth + 1)

  let refractDir = Vector.norm(refract(dir, N, material.refractiveIndex))
  let refractOrig = Vector.dot(refractDir, N) < 0 ? Vector.minus(hit, Vector.times(0.0001, N)) : Vector.plus(hit, Vector.times(0.0001, N))
  let refractColor = castRay(refractOrig, refractDir, spheres, lights, depth + 1)

  for (let i = 0; i < lights.length; i++) {
    let light = lights[i]
    let lightDir = Vector.norm(Vector.minus(light.position, hit))
    let lightDistance = Vector.mag(Vector.minus(light.position, hit))

    //在被击中的点处，反向射出一根光线
    let shadowOrig = Vector.dot(lightDir, N) < 0 ? Vector.minus(hit, Vector.times(0.0001, N)) : Vector.plus(hit, Vector.times(0.0001, N))
    let shadowRes = sceneIntersect(shadowOrig, lightDir, spheres)
    if (shadowRes) {
      let shadowN = shadowRes.N
      let shadowHit = shadowRes.hit
      if (Vector.mag(Vector.minus(shadowHit, shadowOrig)) < lightDistance) {
        continue
      }
    }
    diffuseLightIntensity += light.intensity * Math.max(0, Vector.dot(lightDir, N))
    specualLightIntensity += Math.pow(
      Math.max(0,
        Vector.dot(dir, reflect(lightDir, N)
        )

      ), material.specualExponent) * light.intensity
  }

  let di = Vector.times(diffuseLightIntensity * material.albedo[0], material.diffuseColor)
  let si = Vector.times(specualLightIntensity * material.albedo[1], new Vector(1, 1, 1))
  let ri = Vector.times(material.albedo[2], reflectColor)
  let rai = Vector.times(material.albedo[3], refractColor)
  return Vector.plus(Vector.plus(Vector.plus(di, si), ri), rai)
}
function render(spheres: Array<Sphere>, lights: Array<Light>) {
  const frameBuffer: Array<Vector> = []

  const fov = Math.PI / 2

  const eye = new Vector(0, 0, 0)

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let x: number = i + 0.5 - width / 2
      let y: number = -(j + 0.5 - height / 2)
      let z: number = - height / Math.tan(fov / 2)
      let dir: Vector = Vector.norm(new Vector(x, y, z))
      frameBuffer[i + j * width] = castRay(eye, dir, spheres, lights)
    }
  }
  toImage(frameBuffer)
}

function toImage(buffer: Array<Vector>) {
  let array: Array<number> = buffer.reduce((prev, vector) => {
    const { x, y, z } = vector
    prev.push(x * 255)
    prev.push(y * 255)
    prev.push(z * 255)
    prev.push(1 * 255)
    return prev
  }, [])
  let uarray = new Uint8ClampedArray(array)
  const imageData = new ImageData(uarray, width, height)

  context.putImageData(imageData, 0, 0)
}

function main() {
  let spheres = []
  let ivory = new Material(1, [0.6, 0.3, 0, 0], new Vector(.4, .4, .3), 50)
  let glass = new Material(1.5, [0.0, 0.5, 0.1, 0.8], new Vector(.4, .4, .3), 50)
  let redRubber = new Material(1, [0.9, 0.1, 0, 0], new Vector(.3, .1, .1), 10)
  let mirror = new Material(1, [0, 10, 0.8, 0], new Vector(1, 1, 1), 1425)

  spheres.push(new Sphere(new Vector(-3, 0, -16), 2, ivory))
  spheres.push(new Sphere(new Vector(-1, -1.50, -12), 2, glass))
  spheres.push(new Sphere(new Vector(1.5, -0.5, -18), 3, redRubber))
  spheres.push(new Sphere(new Vector(7, 5, -18), 4, mirror))

  let lights = []
  lights.push(new Light(new Vector(-20, 20, 20), 1.5))
  lights.push(new Light(new Vector(30, 50, -25), 1.8))
  lights.push(new Light(new Vector(30, 50, 30), 1.7))

  render(spheres, lights)
}

main()