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
function pointerToSvgUser(e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } {
    const svg = e.currentTarget
    const ctm = svg.getScreenCTM()
    if (!ctm) {
      return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
    }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
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

    const { x, y } = pointerToSvgUser(e)
    draftRef.current = [
      {
        x,
        y,
        pressure: pointerPressure(e),
        timestamp: Date.now(),
      },
    ]
    setActivePoints([...draftRef.current])
    isDrawingRef.current = true
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDrawingRef.current) return

    const { x, y } = pointerToSvgUser(e)
    draftRef.current.push({
      x,
      y,
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