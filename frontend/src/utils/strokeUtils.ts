//serialize, deserialize, getSvgPathFromStroke
import { getStroke } from 'perfect-freehand'
import type { Stroke, Point } from '../types/drawing'

const average = (a: number, b: number): number => (a + b) / 2

// this is the implementation from the documentation from perfect-freehand
export function getSvgPathFromStroke(points: number[][], closed = true): string {
  const len = points.length

  if (len < 2) return ''

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `
  }

  if (closed) result += 'Z'

  return result
}

const strokeOptions = { size: 6, thinning: 0.5, smoothing: 0.5, streamline: 0.5 }

export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return ''
  const raw = points.map((p) => [p.x, p.y, p.pressure])
  return getSvgPathFromStroke(getStroke(raw, strokeOptions))
}


export function strokeToSvgPath(stroke: Stroke): string {
    const raw = stroke.points.map((p) => [p.x, p.y, p.pressure])
    return getSvgPathFromStroke(getStroke(raw, strokeOptions))
  }