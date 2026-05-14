// all drawing state and logic lives here
import { useRef, useState } from 'react'
import type { Stroke, Point } from '../types/drawing'

function pointerPressure(e: React.PointerEvent<SVGSVGElement>): number {
  return e.pressure > 0 ? e.pressure : 0.5
}

function releasePointerIfCaptured(e: React.PointerEvent<SVGSVGElement>): void {
  const el = e.currentTarget
  if (typeof el.hasPointerCapture === 'function' && el.hasPointerCapture(e.pointerId)) {
    el.releasePointerCapture(e.pointerId)
  }
}

export function useDrawingEngine() {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [activePoints, setActivePoints] = useState<Point[]>([])
  const [currentColor, setCurrentColor] = useState<string>('#000000')
  const [currentTool, setCurrentTool] = useState<Stroke['tool']>('pen')
  const isDrawingRef = useRef(false)
  const draftRef = useRef<Point[]>([])

  function endGesture(e: React.PointerEvent<SVGSVGElement>, commit: boolean): void {
    releasePointerIfCaptured(e)

    if (!isDrawingRef.current) return

    isDrawingRef.current = false
    const points = [...draftRef.current]
    draftRef.current = []
    setActivePoints([])

    if (commit && points.length > 0) {
      const newStroke: Stroke = {
        id: crypto.randomUUID(),
        points,
        color: currentColor,
        tool: currentTool,
      }
      setStrokes((prev) => [...prev, newStroke])
    }
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)

    draftRef.current = [
      {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
        pressure: pointerPressure(e),
        timestamp: Date.now(),
      },
    ]
    setActivePoints([...draftRef.current])
    isDrawingRef.current = true
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDrawingRef.current) return

    draftRef.current.push({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      pressure: pointerPressure(e),
      timestamp: Date.now(),
    })
    setActivePoints([...draftRef.current])
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    endGesture(e, true)
  }

  function handlePointerCancel(e: React.PointerEvent<SVGSVGElement>) {
    endGesture(e, false)
  }

  function clearStrokes() {
    setStrokes([])
  }

  return {
    strokes,
    activePoints,
    currentColor,
    currentTool,
    setCurrentColor,
    setCurrentTool,
    svgPointerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    clearStrokes,
  }
}