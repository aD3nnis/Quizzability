import DrawingCanvas from './components/DrawingCanvas'

import './App.scss'
import { useDrawingEngine } from './hooks/useDrawingEngine'

function App() {

  const { getSvgPointerProps, frontStrokes, backStrokes, activePoints, currentColor, draftFace } = useDrawingEngine()

  return (

        <div className="card-container">
          
            <DrawingCanvas 
              strokes={frontStrokes} 
              activePoints={draftFace === 'front' ? activePoints : []} 
              activeColor={currentColor} 
              svgPointerProps={getSvgPointerProps('front')}
            />            
            <DrawingCanvas 
              strokes={backStrokes} 
              activePoints={draftFace === 'back' ? activePoints : []} 
              activeColor={currentColor} 
              svgPointerProps={getSvgPointerProps('back')}
            />
        </div>
  )
}

export default App
