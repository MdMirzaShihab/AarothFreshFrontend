import React from 'react';
import { Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-bottle-green mb-4">
                  Aaroth Fresh
                </h1>
                <p className="text-text-muted text-lg mb-8">
                  B2B Marketplace for Fresh Produce
                </p>
                <div className="bg-gradient-secondary text-white px-8 py-3 rounded-2xl inline-block">
                  Coming Soon
                </div>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
};

export default App;