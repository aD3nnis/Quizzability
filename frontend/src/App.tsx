import DrawingCanvas from './components/DrawingCanvas'

import './App.scss'
import { useDrawingEngine } from './hooks/useDrawingEngine'

function App() {

  const { svgPointerProps, strokes, activePoints, currentColor } = useDrawingEngine()

  return (

        <div>
          <DrawingCanvas 
            strokes={strokes} 
            activePoints={activePoints} 
            activeColor={currentColor} 
            svgPointerProps={svgPointerProps} 
          />
        </div>
  )
}

export default App
