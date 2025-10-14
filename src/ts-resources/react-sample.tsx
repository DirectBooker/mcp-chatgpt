/**
 * React TypeScript sample demonstrating JSX, event handling, and modern React patterns
 * This showcases React component development with TypeScript integration
 * 
 * @mcp-name: "React TypeScript Component"
 * @mcp-description: "Interactive React component with hooks, TypeScript interfaces, event handling, and Google search integration"
 * @mcp-uri: "react-component"
 */

import React, { useState, useCallback, useMemo } from 'react';

// TypeScript interface for component props
interface HelloWorldProps {
  initialText?: string;
  color?: string;
  className?: string;
}

// TypeScript interface for component state
interface ClickStats {
  count: number;
  lastClickTime: Date | null;
}

/**
 * HelloWorld React component with TypeScript types
 * Displays text in a colored div that opens Google search when clicked
 */
export const HelloWorld: React.FC<HelloWorldProps> = ({ 
  initialText = "Hello World", 
  color = "blue",
  className = ""
}) => {
  // State with TypeScript typing
  const [clickStats, setClickStats] = useState<ClickStats>({
    count: 0,
    lastClickTime: null
  });

  // Memoized styles object
  const divStyles = useMemo(() => ({
    backgroundColor: color,
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    fontSize: '18px',
    fontWeight: 'bold' as const,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    userSelect: 'none' as const,
    margin: '20px 0'
  }), [color]);

  // Callback for handling clicks with TypeScript event typing
  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    // Update click statistics
    setClickStats(prev => ({
      count: prev.count + 1,
      lastClickTime: new Date()
    }));

    // Create Google search URL
    const searchQuery = encodeURIComponent(initialText);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    // Open in new window/tab
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  }, [initialText]);

  // Mouse event handlers for hover effects
  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.style.transform = 'translateY(-2px)';
    target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  }, []);

  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  }, []);

  return (
    <div className={`hello-world-container ${className}`}>
      <div
        style={divStyles}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`Click to search for "${initialText}" on Google`}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleClick(event as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
      >
        {initialText}
      </div>
      
      {/* Click statistics display */}
      <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
        <p>Clicks: {clickStats.count}</p>
        {clickStats.lastClickTime && (
          <p>Last clicked: {clickStats.lastClickTime.toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
};

// Default export for easier importing
export default HelloWorld;

