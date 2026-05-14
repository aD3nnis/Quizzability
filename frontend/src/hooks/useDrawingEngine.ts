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
  const [frontStrokes, setFrontStrokes] = useState<Stroke[]>([])
  const [backStrokes, setBackStrokes] = useState<Stroke[]>([])
  const [activePoints, setActivePoints] = useState<Point[]>([])
  const [currentColor, setCurrentColor] = useState<string>('#000000')
  const [currentTool, setCurrentTool] = useState<Stroke['tool']>('pen')
  const isDrawingRef = useRef(false)
  const gestureFaceRef = useRef<'front' | 'back' | null>(null)
  const draftRef = useRef<Point[]>([])
  const [draftFace, setDraftFace] = useState<'front' | 'back' | null>(null)

  function resetGestureDraftState() {
    draftRef.current = []
    setActivePoints([])
    setDraftFace(null)
    isDrawingRef.current = false
    gestureFaceRef.current = null
  }

  function endGesture(e: React.PointerEvent<SVGSVGElement>, commit: boolean): void {
    releasePointerIfCaptured(e)

    if (!isDrawingRef.current) return

    isDrawingRef.current = false
    const face = gestureFaceRef.current
    const points = [...draftRef.current]

    if (commit && points.length > 0 && face) {
      const newStroke: Stroke = {
        id: crypto.randomUUID(),
        points,
        color: currentColor,
        tool: currentTool,
      }
      if (face === 'front') {
        setFrontStrokes((prev) => [...prev, newStroke])
      } else if (face === 'back') {
        setBackStrokes((prev) => [...prev, newStroke])
      }
      resetGestureDraftState()
    }
    gestureFaceRef.current = null
  }
  function getSvgPointerProps(face: 'front' | 'back') {
    return {
        onPointerDown:(e: React.PointerEvent<SVGSVGElement>) => {
            handlePointerDown(e, face)
        },
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
        }
    }
    function handlePointerDown(e: React.PointerEvent<SVGSVGElement>, face: 'front' | 'back') {    e.preventDefault()
    gestureFaceRef.current = face
    setDraftFace(face)
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

  function clearAllStrokes() {
    clearFace('front')
    clearFace('back')
  }
  function clearFace(face: 'front' | 'back') {
    if (face === 'front') {
      setFrontStrokes([])
    } else {
      setBackStrokes([])
    }
  }

  return {
    frontStrokes,
    backStrokes,
    activePoints,
    currentColor,
    currentTool,
    setCurrentColor,
    setCurrentTool,
    clearFace,
    clearAllStrokes,
    getSvgPointerProps,
    draftFace,
  }
}