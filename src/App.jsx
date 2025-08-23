// src/App.jsx

import React from 'react';
import Tool from './components/Tool';
// --- THE FIX IS HERE ---
// The component is named InteractiveCardCanvas, not InteractiveCard
import { InteractiveCardCanvas } from './components/InteractiveCard'; 

function App() {
  return (
    <div className="relative z-0 bg-black text-white h-screen p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row w-full h-full max-w-7xl mx-auto gap-8">
        
        {/* Left Column for the 3D Interactive Card */}
        <div className="w-full lg:w-1/2 h-full">
          {/* Use the correct component name here as well */}
          <InteractiveCardCanvas />
        </div>

        {/* Right Column for the Terminal */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center">
          <Tool />
        </div>

      </div>
    </div>
  )
}

export default App;
