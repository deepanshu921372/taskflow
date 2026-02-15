import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-primary-600 mb-4">
                    TaskFlow
                  </h1>
                  <p className="text-gray-600">
                    Real-Time Task Collaboration Platform
                  </p>
                  <p className="text-sm text-gray-400 mt-4">
                    Coming soon...
                  </p>
                </div>
              </div>
            } />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
