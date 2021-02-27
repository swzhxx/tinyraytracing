import Light from './Light'
import Material from './Material'
import Sphere from './Sphere'
import Vector from './vec'

const canvas: HTMLCanvasElement = document.querySelector("#ray-tracing")
const context: CanvasRenderingContext2D = canvas.getContext("2d")
const width = 1024
const height = 768


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
  const diffuseLightIntensity = lights.reduce((prev, light) => {
    let lightDir = Vector.norm(Vector.minus(light.position, hit))
    prev += light.intensity * Math.max(0, Vector.dot(lightDir, N))
    return prev
  }, 0)
  return Vector.times(diffuseLightIntensity, material.diffuseColor)
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
  let ivory = new Material(new Vector(.4, .4, .3))
  let redRubber = new Material(new Vector(.3, .1, .1))

  spheres.push(new Sphere(new Vector(-3, 0, -16), 2, ivory))
  spheres.push(new Sphere(new Vector(-1, -1.50, -12), 2, redRubber))
  spheres.push(new Sphere(new Vector(1.5, -0.5, -18), 3, redRubber))
  spheres.push(new Sphere(new Vector(7, 5, -18), 4, ivory))

  let lights = []
  lights.push(new Light(new Vector(-20, 20, 20), 1.5))

  render(spheres, lights)
}

main()