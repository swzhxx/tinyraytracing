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

function castRay(orig: Vector, dir: Vector, spheres: Array<Sphere>, lights: Array<Light>): Vector {
  let res = sceneIntersect(orig, dir, spheres)

  if (!res) {
    return new Vector(0.2, 0.7, 0.8)
  }

  const { material, hit, N } = res

  let diffuseLightIntensity = 0
  let specualLightIntensity = 0
  for (let i = 0; i < lights.length; i++) {
    let light = lights[i]
    let lightDir = Vector.norm(Vector.minus(light.position, hit))
    let lightDistance = Vector.mag(Vector.minus(light.position, hit))

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

  let di = Vector.times(diffuseLightIntensity * material.albedo.x, material.diffuseColor)
  let si = Vector.times(specualLightIntensity * material.albedo.y, new Vector(1, 1, 1))
  return Vector.plus(di, si)
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
  let ivory = new Material(new Vector(0.6, 0.3, 0), new Vector(.4, .4, .3), 50)
  let redRubber = new Material(new Vector(0.9, 0.1, 0), new Vector(.3, .1, .1), 10)

  spheres.push(new Sphere(new Vector(-3, 0, -16), 2, ivory))
  spheres.push(new Sphere(new Vector(-1, -1.50, -12), 2, redRubber))
  spheres.push(new Sphere(new Vector(1.5, -0.5, -18), 3, redRubber))
  spheres.push(new Sphere(new Vector(7, 5, -18), 4, ivory))

  let lights = []
  lights.push(new Light(new Vector(-20, 20, 20), 1.5))
  lights.push(new Light(new Vector(30, 50, -25), 1.8))
  lights.push(new Light(new Vector(30, 50, 30), 1.7))

  render(spheres, lights)
}

main()