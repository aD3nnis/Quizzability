// the SVG surface, pointer event handlers
import type { Stroke, Point } from '../types/drawing'
import { pointsToSvgPath, strokeToSvgPath } from '../utils/strokeUtils'



interface DrawingCanvasProps {
    strokes: Stroke[]
    activePoints: Point[]
    activeColor: string
    svgPointerProps: Pick<React.SVGProps<SVGSVGElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>
    placeholder: string
}

export default function DrawingCanvas({
    strokes,
    activePoints,
    activeColor,
    svgPointerProps,
    placeholder,
  }: DrawingCanvasProps) {    
    const draftD = pointsToSvgPath(activePoints)
    return (
      <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid meet"
       {...svgPointerProps}>
        {strokes.map(stroke => (
          <path key={stroke.id} d={strokeToSvgPath(stroke)} />
        ))}
        {draftD ? <path d={draftD} fill={activeColor} /> : null}
        {placeholder && !strokes.length && !draftD && !activePoints.length && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="gray" opacity={0.5}>
            {placeholder}
          </text>
        )}
      </svg>
    )
}