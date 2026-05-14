// Point, Stroke, DrawingTool types

export interface Point {
  x: number
  y: number
  pressure: number
  timestamp: number
}

export interface Stroke {
  id: string
  points: Point[]
  color: string
  tool: 'pen' | 'eraser'
}
