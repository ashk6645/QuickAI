import React, { useEffect, useState } from 'react';

const DataPipeline = ({ isActive, isReceiving }) => {
  const [lines, setLines] = useState([]);
  const lineCount = 5; // Number of parallel data lines

  useEffect(() => {
    if (isActive && !isReceiving) {
      // Create staggered lines
      const newLines = Array.from({ length: lineCount }, (_, i) => ({
        id: i,
        delay: i * 100, // Stagger each line
      }));
      setLines(newLines);
    } else if (!isActive) {
      setLines([]);
    }
  }, [isActive, isReceiving]);

  return (
    <>
      {/* Desktop Data Flow Animation */}
      <div className="hidden lg:block absolute left-full top-0 pointer-events-none z-10 overflow-hidden" 
           style={{ width: '1.5rem', height: '100%' }}>
        {isActive && (
          <div className="relative w-full h-full">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
            
            {/* Flowing data lines */}
            {lines.map((line) => (
              <div
                key={line.id}
                className="absolute left-0 w-full overflow-hidden"
                style={{
                  top: `${(line.id * 100) / (lineCount - 1)}%`,
                  transform: 'translateY(-50%)',
                  height: '2px',
                }}
              >
                {/* Line trail */}
                <div
                  className={`absolute left-0 h-full bg-gradient-to-r from-transparent via-primary to-primary/20 ${
                    isReceiving ? 'animate-data-line-recede' : 'animate-data-line-flow'
                  }`}
                  style={{
                    animationDelay: `${line.delay}ms`,
                    width: '100%',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Data Flow Animation */}
      <div className="lg:hidden absolute top-full left-0 pointer-events-none z-10 overflow-hidden" 
           style={{ height: '1.5rem', width: '100%' }}>
        {isActive && (
          <div className="relative w-full h-full">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
            
            {/* Flowing data lines */}
            {lines.map((line) => (
              <div
                key={line.id}
                className="absolute top-0 h-full overflow-hidden"
                style={{
                  left: `${(line.id * 100) / (lineCount - 1)}%`,
                  transform: 'translateX(-50%)',
                  width: '2px',
                }}
              >
                {/* Line trail */}
                <div
                  className={`absolute top-0 w-full bg-gradient-to-b from-transparent via-primary to-primary/20 ${
                    isReceiving ? 'animate-data-line-recede-vertical' : 'animate-data-line-flow-vertical'
                  }`}
                  style={{
                    animationDelay: `${line.delay}ms`,
                    height: '100%',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DataPipeline;
