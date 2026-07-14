import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';

// A single shelf component
const Shelf = ({ position, rotation = [0, 0, 0], label, isHighlighted, targetShelf, shelfNames = ['1', '2', '3'] }) => {
  // We'll render up to 3 shelves visually (Top, Middle, Bottom)
  const visualHeights = [1, 0, -1]; // y-positions for Top, Middle, Bottom

  return (
    <group position={position} rotation={rotation}>
      {/* Backboard */}
      <Box args={[4, 3, 0.1]} position={[0, 0.5, -0.45]}>
        <meshStandardMaterial color={isHighlighted ? '#ccfbf1' : '#e5e7eb'} />
      </Box>

      {/* Render Planks dynamically based on visualHeights and shelfNames */}
      {visualHeights.map((yPos, index) => {
        // If the backend has fewer shelves defined, don't break, just use empty or default
        const shelfName = shelfNames[index] || `Unnamed-${index+1}`;
        const isShelfHighlighted = isHighlighted && targetShelf === shelfName;
        const isBase = yPos === -1;
        
        return (
          <group key={index} position={[0, yPos, 0]}>
            {/* Plank/Base */}
            <Box args={isBase ? [4, 0.2, 1] : [4, 0.1, 0.8]}>
              <meshStandardMaterial color={isShelfHighlighted ? '#ef4444' : (isHighlighted ? '#5eead4' : (isBase ? '#9ca3af' : '#d1d5db'))} />
            </Box>
            
            {/* Text Label on the Plank */}
            <Text 
              position={[0, isBase ? 0.11 : 0.06, 0.38]} 
              fontSize={0.25} 
              color={isShelfHighlighted ? '#ffffff' : '#374151'}
              anchorY="bottom"
              anchorX="center"
            >
              SHELF-{shelfName}
            </Text>
          </group>
        );
      })}
      
      {/* Label for the entire unit */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.4}
        color={isHighlighted ? '#0f766e' : '#374151'}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// Supermarket Layout
const SupermarketLayout = ({ selectedLocation, layout }) => {
  // Use layout from backend, or fallback to dummy data
  const allRows = layout?.rows || ['A', 'B', 'C'];
  const cols = layout?.columns || ['1', '2', '3', '4'];
  
  // Filter out any rows explicitly named "Wall-X" so they don't render in the main grid
  const standardRows = allRows.filter(r => !r.toLowerCase().startsWith('wall'));
  
  const totalWidth = Math.max(0, (cols.length - 1) * 6);
  const totalDepth = Math.max(0, (standardRows.length - 1) * 5);
  
  const shelves = [];
  
  standardRows.forEach((row, rowIndex) => {
    cols.forEach((col, colIndex) => {
      const zPos = rowIndex * 5 - (totalDepth / 2); // Spacing out rows, centered
      const xPos = colIndex * 6 - (totalWidth / 2); // Spacing out columns, centered
      
      const label = `Row-${row} Col-${col}`;
      
      let isHighlighted = false;
      let targetShelf = null;
      if (selectedLocation) {
        if (selectedLocation.row === row && selectedLocation.column === col) {
          isHighlighted = true;
          targetShelf = selectedLocation.shelf;
        }
      }

      shelves.push(
        <Shelf 
          key={`${row}-${col}`} 
          position={[xPos, 0, zPos]} 
          label={label} 
          isHighlighted={isHighlighted}
          targetShelf={targetShelf}
          shelfNames={layout?.shelves}
        />
      );
    });
  });

  // Generate "Default Columns" (Endcaps/Wall Shelves) between each row on the far right
  const defaultColumns = [];
  const lastColX = (cols.length - 1) * 6 - (totalWidth / 2);
  const farRightX = lastColX + 4.5; // Reduced gap
  
  for (let i = 0; i < standardRows.length - 1; i++) {
    const zPos1 = (i * 5) - (totalDepth / 2);
    const zPos2 = ((i + 1) * 5) - (totalDepth / 2);
    const midZ = (zPos1 + zPos2) / 2;
    
    const wallLabel = `Wall-${i+1}`;
    let isWallHighlighted = false;
    let wallTargetShelf = null;
    
    if (selectedLocation) {
      if (selectedLocation.row === wallLabel) {
        isWallHighlighted = true;
        wallTargetShelf = selectedLocation.shelf;
      }
    }
    
    defaultColumns.push(
      <Shelf 
        key={`default-col-${i}`}
        position={[farRightX, 0, midZ]}
        rotation={[0, -Math.PI / 2, 0]} // Rotate 90 degrees to face the aisles
        label={wallLabel}
        isHighlighted={isWallHighlighted}
        targetShelf={wallTargetShelf}
        shelfNames={layout?.shelves}
      />
    );
  }

  const floorWidth = Math.max(35, totalWidth + 15);
  const floorDepth = Math.max(25, totalDepth + 15);

  return (
    <group>
      {/* Floor */}
      <Box args={[floorWidth, 0.1, floorDepth]} position={[0, -1.1, 0]}>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      
      {shelves}
      {defaultColumns}
    </group>
  );
};

const ThreeDMap = ({ location, layout }) => {
  const cols = layout?.columns || ['1', '2', '3', '4'];
  const allRows = layout?.rows || ['A', 'B', 'C'];
  const standardRows = allRows.filter(r => !r.toLowerCase().startsWith('wall'));
  
  const totalWidth = Math.max(0, (cols.length - 1) * 6);
  const totalDepth = Math.max(0, (standardRows.length - 1) * 5);
  
  const camX = Math.max(15, totalWidth * 0.5);
  const camY = Math.max(15, Math.max(totalWidth, totalDepth) * 0.6);
  const camZ = Math.max(20, totalDepth * 0.8 + 15);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden bg-gray-100">
      <Canvas camera={{ position: [camX, camY, camZ], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        
        <SupermarketLayout selectedLocation={location} layout={layout} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.1} // Prevent looking below the floor
        />
      </Canvas>
    </div>
  );
};

export default ThreeDMap;
