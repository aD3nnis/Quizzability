import DrawingCanvas from './components/DrawingCanvas'

import './App.scss'
import { useDrawingEngine } from './hooks/useDrawingEngine'

function App() {

  const { getSvgPointerProps, frontStrokes, backStrokes, activePoints, currentColor, draftFace } = useDrawingEngine()

  return (
    <div className="app-container">
    <div className="navigation-container">
      <button>X</button>
      <button>save</button>
    </div>
        <div className="card-container">
            <DrawingCanvas 
              placeholder="Write term/question here..."
              strokes={frontStrokes} 
              activePoints={draftFace === 'front' ? activePoints : []} 
              activeColor={currentColor} 
              svgPointerProps={getSvgPointerProps('front')}
            />            
            <DrawingCanvas 
              placeholder="Write description/answer here..."
              strokes={backStrokes} 
              activePoints={draftFace === 'back' ? activePoints : []} 
              activeColor={currentColor} 
              svgPointerProps={getSvgPointerProps('back')}
            />
        </div>
    </div>
  )
}

export default App
