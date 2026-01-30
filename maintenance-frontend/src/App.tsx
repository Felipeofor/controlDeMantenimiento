import React, { useState } from 'react';
import { Home } from './pages/Home';
import { VehicleDetails } from './pages/VehicleDetails';

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background text-text">
      {!selectedVehicle ? (
        <Home onSelectVehicle={(v) => setSelectedVehicle(v)} />
      ) : (
        <VehicleDetails 
          vehicle={selectedVehicle} 
          onBack={() => setSelectedVehicle(null)} 
        />
      )}
    </div>
  );
}

export default App;
