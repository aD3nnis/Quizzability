// the SVG surface, pointer event handlers
import type { Stroke, Point } from '../types/drawing'
import { pointsToSvgPath, strokeToSvgPath } from '../utils/strokeUtils'



interface DrawingCanvasProps {
    strokes: Stroke[]
    activePoints: Point[]
    activeColor: string
    svgPointerProps: Pick<React.SVGProps<SVGSVGElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>
}

export default function DrawingCanvas({ strokes, activePoints, activeColor, svgPointerProps }: DrawingCanvasProps) {
    const draftD = pointsToSvgPath(activePoints)
    return (
      <svg {...svgPointerProps}>
        {strokes.map(stroke => (
          <path key={stroke.id} d={strokeToSvgPath(stroke)} />
        ))}
        {draftD ? <path d={draftD} fill={activeColor} /> : null}
      </svg>
    )
}