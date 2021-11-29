import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import { Metaflow } from '../../MetaflowPluginAPI'
import './style.css';

function App() {
  const [metadata, setMetadata] = useState(null)

  // subscribe to listen metadata resource.
  useEffect(() => {
    Metaflow.subscribe(['metadata'], (event) => {
      setMetadata(event.data);
    });
    Metaflow.setHeight()
  }, []);

  return (
    <div className="App">
      <div>
        {metadata ? (
          <div>
            <div>{metadata.length}</div>
          </div>
        ) : 'Waiting for data'}
      </div>
    </div>
  )
}


Metaflow.register('task-details', () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
});
