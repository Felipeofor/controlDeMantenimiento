import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { VehicleDetails } from './pages/VehicleDetails';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicle/:id" element={<VehicleDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
