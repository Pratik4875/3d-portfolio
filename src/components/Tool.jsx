// src/components/Tool.jsx

import React, { useState, useEffect, useRef } from 'react';
import DecryptedText from './DecryptedText'; // <-- Import the new component

export default function Tool() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'output', text: 'Pratik Kadam Portfolio v1.0' },
    { type: 'output', text: "Type 'help' to see a list of available commands." },
  ]);
  const endOfHistoryRef = useRef(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const processCommand = (command) => {
    const newHistory = [...history, { type: 'input', text: `$ ${command}` }];
    let output;

    switch (command.toLowerCase()) {
      case 'help':
        output = 'Available commands: about, skills, projects, contact, clear';
        break;
      case 'about':
        output = "R&D Electronics Engineer specializing in automation, robotics, and drone technology.";
        break;
      case 'skills':
        output = 'Python, C++, Embedded C, ROS, Robotics, AI, Drone Technology, Machine Learning, Raspberry Pi, Arduino.';
        break;
      case 'projects':
        output = 'Key Projects: Drone Pilot Finder Website, Line Following Robot with LiDAR, Micro Quadcopter Design.';
        break;
      case 'contact':
        output = 'Email: pratikkadam1030@gmail.com | LinkedIn: [Your URL] | GitHub: [Your URL]';
        break;
      case 'clear':
        setHistory([]);
        return;
      default:
        output = `Command not found: ${command}. Type 'help' for a list of commands.`;
    }
    setHistory([...newHistory, { type: 'output', text: output }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div 
        className="bg-black rounded-t-lg shadow-lg p-4 flex-grow overflow-y-auto font-mono text-sm text-white border border-b-0 border-green-500/30"
        onClick={() => document.getElementById('terminal-input').focus()}
      >
        {history.map((line, index) => (
          <div key={index}>
            {line.type === 'input' ? (
              <p className="text-green-400">{line.text}</p>
            ) : (
              // --- THE CHANGE IS HERE ---
              // We now use the DecryptedText component for the output
              <DecryptedText 
                text={line.text} 
                className="text-slate-300"
                encryptedClassName="text-green-500"
                animateOn="view"
                sequential={true}
                speed={20}
              />
            )}
          </div>
        ))}
        <div ref={endOfHistoryRef} />
      </div>
      <div className="flex items-center bg-black rounded-b-lg p-2 font-mono text-sm border border-t-0 border-green-500/30">
        <span className="text-green-400 mr-2">$</span>
        <input
          id="terminal-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent text-white placeholder-slate-500 focus:outline-none"
          placeholder="Type a command..."
          autoFocus
        />
      </div>
    </div>
  );
};
