import React from 'react';

const strokeWidth = 3;
const lineStyle = {
  stroke: '#000000',
  strokeWidth: strokeWidth,
};

const HoverLine = ({height, mousePosition, marginTop}) => {
    let heightPadded = height+25;
    let svgStyle = {
      position: 'absolute',
      left: mousePosition.x,
      pointerEvents: 'none'
    };

    return (
      <svg id='hoverline' height={heightPadded} width={strokeWidth} style={svgStyle}>
        <line x1={0} y1={marginTop-5} x2={0} y2={heightPadded} style={lineStyle} />
      </svg>
    );
  };


export default HoverLine;
