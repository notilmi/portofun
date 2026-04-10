'use client';

import React, { useEffect, useState } from 'react';

interface NodeConnectorProps {
  fromNode: DOMRect;
  toNode: DOMRect;
  color?: string;
}

export const NodeConnector: React.FC<NodeConnectorProps> = ({
  fromNode,
  toNode,
  color = 'rgb(156, 163, 175)',
}) => {
  const [pathLength, setPathLength] = useState(0);
  const [svgPath, setSvgPath] = useState('');

  useEffect(() => {
    if (!fromNode || !toNode) return;

    // Calculate bezier curve points
    const startX = fromNode.right + 20;
    const startY = fromNode.top + fromNode.height / 2;
    const endX = toNode.left - 20;
    const endY = toNode.top + toNode.height / 2;

    const controlX = (startX + endX) / 2;
    const controlY = (startY + endY) / 2;

    // Generate bezier curve path
    const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

    // For animation, calculate path length
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tempPath.setAttribute('d', path);
    tempSvg.appendChild(tempPath);
    
    let length = 0;
    try {
      length = tempPath.getTotalLength();
    } catch {
      length = 0;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSvgPath(path);
    setPathLength(length);
  }, [fromNode, toNode]);

  if (!fromNode || !toNode || !svgPath) return null;

  // Calculate SVG bounds
  const minX = Math.min(fromNode.right, toNode.left) - 50;
  const minY = Math.min(fromNode.top, toNode.top) - 50;
  const maxX = Math.max(fromNode.right, toNode.left) + 50;
  const maxY = Math.max(fromNode.top + fromNode.height, toNode.top + toNode.height) + 50;

  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'fixed',
        left: minX,
        top: minY,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      role="presentation"
    >
      {/* Dashed background line for visual reference */}
      <path
        d={svgPath}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeDasharray="5,5"
        opacity={0.3}
      />

      {/* Animated solid line */}
      <path
        d={svgPath}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: `drawPath 1.5s ease-in-out forwards`,
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        }}
      />

      <defs>
        <style>{`
          @keyframes drawPath {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </defs>
    </svg>
  );
};

export default NodeConnector;
