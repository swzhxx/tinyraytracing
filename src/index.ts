import Sphere from './Sphere'
import Vector from './vec'

const canvas: HTMLCanvasElement = document.querySelector("#ray-tracing")
const context: CanvasRenderingContext2D = canvas.getContext("2d")
const width = 800
const height = 800


function castRay(orig: Vector, dir: Vector, sphere: Sphere): Vector {
  if (!sphere.rayIntersect(orig, dir)) {
    return new Vector(0.2, 0.7, 0.8)
  }
  return new Vector(0.4, 0.4, 0.3)
}

function render(sphere: Sphere) {
  const frameBuffer: Array<Vector> = []

  const fov = Math.PI / 2

  const eye = new Vector(0, 0, 0)

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let x: number = i + 0.5 - width / 2
      let y: number = j + 0.5 - height / 2
      let z: number = - height / Math.tan(fov / 2)
      let dir: Vector = Vector.norm(new Vector(x, y, z))
      frameBuffer[i + j * width] = castRay(eye, dir, sphere)
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
  let sphere = new Sphere(new Vector(-3, 0, -16), 2)
  render(sphere)
}

main()