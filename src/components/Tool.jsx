// src/components/Tool.jsx

import React, { useState, useEffect, useRef } from 'react';
import DecryptedText from './DecryptedText';

// A simple component to render pre-formatted ASCII art
const AsciiArt = ({ text }) => <pre className="text-slate-300 whitespace-pre-wrap">{text}</pre>;

// New component to handle live fetching for animations
const LiveAscii = ({ url }) => {
  const [frame, setFrame] = useState('');
  const intervalRef = useRef();

  useEffect(() => {
    const fetchFrame = async () => {
      try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
        const text = await response.text();
        setFrame(text);
      } catch (error) {
        console.error('Error fetching ASCII art:', error);
        setFrame('Could not load animation.');
        clearInterval(intervalRef.current);
      }
    };

    // Fetch initial frame immediately, then set an interval
    fetchFrame();
    intervalRef.current = setInterval(fetchFrame, 100); // Adjust speed as needed

    // Cleanup interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, [url]);

  return <pre className="text-slate-300 whitespace-pre-wrap">{frame}</pre>;
};

const ascii = `
    _______
   /       \\
  /         \\
 |           |
 |   O   O   |
 |     <     |
 |   \\___/   |
  \\         /
   \\_______/
`;

export function Tool() {
  const [input, setInput] = useState('');
  const [theme, setTheme] = useState('blue'); // Default theme is now blue

  // Theme definitions for easy switching
  const themes = {
    blue: { prompt: 'text-blue-400', border: 'border-blue-500/30' },
    green: { prompt: 'text-green-400', border: 'border-green-500/30' },
    red: { prompt: 'text-red-400', border: 'border-red-500/30' },
  };

  const currentTheme = themes[theme] || themes.blue;

  const [history, setHistory] = useState([
    { type: 'output', text: <DecryptedText text="Pratik Kadam Portfolio v1.0" animateOn="view" sequential={true} /> },
    { type: 'output', text: <DecryptedText text="Type 'help' to see a list of available commands." animateOn="view" sequential={true} /> },
  ]);
  const endOfHistoryRef = useRef(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  /**
   * Processes the user's command and updates the history.
   * @param {string} command - The command entered by the user.
   */
  const processCommand = (command) => {
    const newHistory = [...history, { type: 'input', text: `$ ${command}` }];
    let outputText;
    let outputComponent;

    const [cmd, ...args] = command.toLowerCase().split(' ');

    switch (cmd) {
      case 'help':
        outputText = "Available commands: about, skills, projects, contact, clear, curl <url>, color <theme>";
        break;
      case 'about':
        outputText = "R&D Electronics Engineer specializing in automation, robotics, and drone technology.";
        break;
      case 'skills':
        outputText = 'Python, C++, Embedded C, ROS, Robotics, AI, Drone Technology, Machine Learning, Raspberry Pi, Arduino.';
        break;
      case 'projects':
        outputText = 'Key Projects: Drone Pilot Finder Website, Line Following Robot with LiDAR, Micro Quadcopter Design.';
        break;
      case 'contact':
        outputText = 'Email: pratikkadam1030@gmail.com | LinkedIn: linkedin.com/in/pratik-kadam-robotics | GitHub: github.com/pratik4875';
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'curl':
        const url = args[0];
        if (url === 'ascii') { // Keep the old static ascii art command
          outputComponent = <AsciiArt text={ascii} />;
        } else if (url && (url.startsWith('ascii.live/') || url.startsWith('http'))) {
          outputComponent = <LiveAscii url={url} />;
        } else {
          outputText = `curl: invalid URL. Try 'curl ascii.live/parrot'.`;
        }
        break;
      case 'color':
        const newTheme = args[0];
        if (themes[newTheme]) {
          setTheme(newTheme);
          outputText = `Theme changed to ${newTheme}.`;
        } else {
          outputText = `Color '${newTheme}' not found. Available themes: blue, green, red.`;
        }
        break;
      default:
        outputText = `Command not found: ${command}. Type 'help' for a list of commands.`;
    }
    
    if (outputText) {
      outputComponent = <DecryptedText text={outputText} animateOn="view" sequential={true} />;
    }

    if (outputComponent) {
      setHistory([...newHistory, { type: 'output', text: outputComponent }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      processCommand(input.trim());
      setInput('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div 
        className={`bg-black rounded-t-lg shadow-lg p-4 flex-grow overflow-y-auto font-mono text-sm text-white border border-b-0 ${currentTheme.border}`}
        onClick={() => document.getElementById('terminal-input').focus()}
      >
        {history.map((line, index) => (
          <div key={index}>
            {line.type === 'input' ? (
              <p className={currentTheme.prompt}>{line.text}</p>
            ) : (
              <div className="text-slate-300 whitespace-pre-wrap">{line.text}</div>
            )}
          </div>
        ))}
        <div ref={endOfHistoryRef} />
      </div>
      <div className={`flex items-center bg-black rounded-b-lg p-2 font-mono text-sm border border-t-0 ${currentTheme.border}`}>
        <span className={`${currentTheme.prompt} mr-2`}>$</span>
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
