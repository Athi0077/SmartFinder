import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Text, Sphere, Cone, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';

// A single shelf component
const Shelf = ({ position, rotation = [0, 0, 0], label, isHighlighted, targetShelf, shelfNames = ['1', '2', '3', '4', '5', '6'], isDoubleSided = true }) => {
  // We'll render up to 3 shelves visually (Top, Middle, Bottom)
  const visualHeights = [1, 0, -1]; // y-positions for Top, Middle, Bottom

  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position} 
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Interactive Tooltip */}
      {hovered && (
        <Html position={[0, 2.8, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-2xl border border-gray-700 pointer-events-none whitespace-nowrap animate-fade-in-up">
            <p className="font-bold text-sm">{label}</p>
            <p className="text-xs text-gray-300">Interact with this aisle</p>
          </div>
        </Html>
      )}

      {/* Backboard */}
      <Box args={[4, 3, 0.1]} position={[0, 0.5, -0.45]} castShadow receiveShadow>
        <meshStandardMaterial 
          color={isHighlighted ? '#ccfbf1' : (hovered ? '#d1d5db' : '#e5e7eb')} 
          emissive={hovered ? '#9ca3af' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </Box>

      {/* Render Planks dynamically based on visualHeights and shelfNames */}
      {visualHeights.map((yPos, index) => {
        // Front Shelves
        const frontShelfName = shelfNames[index] || `Unnamed-${index+1}`;
        const isFrontShelfHighlighted = isHighlighted && targetShelf === frontShelfName;
        const isBase = yPos === -1;
        
        // Back Shelves
        const backShelfName = shelfNames[index + 3] || `Unnamed-${index + 4}`;
        const isBackShelfHighlighted = isHighlighted && targetShelf === backShelfName;
        
        return (
          <group key={index}>
            {/* FRONT SIDE */}
            <group position={[0, yPos, 0]}>
              {/* Plank/Base */}
              <Box args={isBase ? [4, 0.2, 1] : [4, 0.1, 0.8]} castShadow receiveShadow>
                <meshStandardMaterial color={isFrontShelfHighlighted ? '#ef4444' : (isHighlighted ? '#5eead4' : (isBase ? '#9ca3af' : '#d1d5db'))} />
              </Box>
              
              {/* Text Label on the Plank */}
              <Text 
                position={[0, isBase ? 0.11 : 0.06, 0.38]} 
                fontSize={0.25} 
                color={isFrontShelfHighlighted ? '#ffffff' : '#374151'}
                anchorY="bottom"
                anchorX="center"
              >
                SHELF-{frontShelfName}
              </Text>
            </group>

            {/* BACK SIDE */}
            {isDoubleSided && (
              <group position={[0, yPos, -0.9]} rotation={[0, Math.PI, 0]}>
                {/* Plank/Base */}
                <Box args={isBase ? [4, 0.2, 1] : [4, 0.1, 0.8]} castShadow receiveShadow>
                  <meshStandardMaterial color={isBackShelfHighlighted ? '#ef4444' : (isHighlighted ? '#5eead4' : (isBase ? '#9ca3af' : '#d1d5db'))} />
                </Box>
                
                {/* Text Label on the Plank */}
                <Text 
                  position={[0, isBase ? 0.11 : 0.06, 0.38]} 
                  fontSize={0.25} 
                  color={isBackShelfHighlighted ? '#ffffff' : '#374151'}
                  anchorY="bottom"
                  anchorX="center"
                >
                  SHELF-{backShelfName}
                </Text>
              </group>
            )}
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
      // If the row or column name is empty, skip rendering to leave a physical gap in the store
      if (!row || row.trim() === '' || !col || col.trim() === '') {
        return;
      }

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
    const row1 = standardRows[i];
    const row2 = standardRows[i + 1];

    const zPos1 = (i * 5) - (totalDepth / 2);
    const zPos2 = ((i + 1) * 5) - (totalDepth / 2);
    const midZ = (zPos1 + zPos2) / 2;
    
    const wallLabel = layout?.walls?.[i] || `Wall-${i+1}`;
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
        isDoubleSided={false}
      />
    );
  }

  const leftX = -(totalWidth / 2) - 8; // Further left for checkouts
  const doorX = leftX - 7; // Entrance even further left
  
  const floorWidth = Math.max(45, totalWidth + 35);
  const floorDepth = Math.max(35, totalDepth + 25);

  return (
    <group>
      {/* Floor */}
      <Box args={[floorWidth, 0.1, floorDepth]} position={[-8, -1.1, 0]} receiveShadow>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      
      {/* Checkout Counters */}
      <CheckoutCounter position={[leftX, 0, -4]} rotation={[0, 0, 0]} />
      <CheckoutCounter position={[leftX, 0, 4]} rotation={[0, 0, 0]} />
      
      {/* Main Entrance */}
      <EntranceDoors position={[doorX, 0, 0]} rotation={[0, Math.PI / 2, 0]} width={10} />
      
      {shelves}
      {defaultColumns}
    </group>
  );
};

// Environment Details
const CheckoutCounter = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Base counter */}
    <Box args={[3, 1, 1]} castShadow receiveShadow position={[0, -0.5, 0]}>
      <meshStandardMaterial color="#9ca3af" />
    </Box>
    {/* Conveyor Belt */}
    <Box args={[1.5, 0.05, 0.8]} castShadow receiveShadow position={[0.5, 0.02, 0]}>
      <meshStandardMaterial color="#111827" />
    </Box>
    {/* Cash Register */}
    <Box args={[0.5, 0.4, 0.5]} castShadow receiveShadow position={[-0.8, 0.2, 0]}>
      <meshStandardMaterial color="#374151" />
    </Box>
    {/* Screen */}
    <Box args={[0.4, 0.3, 0.05]} position={[-0.8, 0.5, -0.2]} rotation={[0.2, 0, 0]} castShadow>
      <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.2} />
    </Box>
  </group>
);

const EntranceDoors = ({ position, rotation = [0, 0, 0], width = 6 }) => (
  <group position={position} rotation={rotation}>
    {/* Frame */}
    <Box args={[width + 0.4, 4.4, 0.4]} position={[0, 1, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#4b5563" />
    </Box>
    {/* Glass Left */}
    <Box args={[width / 2 - 0.2, 4, 0.1]} position={[-width / 4, 1, 0]}>
      <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} metalness={0.9} />
    </Box>
    {/* Glass Right */}
    <Box args={[width / 2 - 0.2, 4, 0.1]} position={[width / 4, 1, 0]}>
      <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} metalness={0.9} />
    </Box>
    {/* Exit Sign (facing inside) */}
    <group position={[0, 3.4, -0.25]} rotation={[0, Math.PI, 0]}>
      <Box args={[1.5, 0.4, 0.1]} castShadow>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.25} color="#ffffff">EXIT</Text>
    </group>
  </group>
);

// Animated 3D Map Pin
const MapPin = ({ position }) => {
  const pinRef = useRef();
  
  useFrame((state) => {
    if (pinRef.current) {
      // Bob up and down
      pinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      // Spin slowly
      pinRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={pinRef} position={position}>
      <Cone args={[0.5, 1.2, 3]} position={[0, 0.6, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </Cone>
    </group>
  );
};

// Camera Controller for smooth animations
const CameraController = ({ targetData, defaultCamPos }) => {
  const { camera } = useThree();
  const controlsRef = useRef();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(null);

  useEffect(() => {
    setCurrentTarget(targetData);
    setIsAnimating(true);
  }, [targetData]);

  useFrame((state, delta) => {
    if (!isAnimating) return;

    let desiredPos;
    let lookTarget;

    if (currentTarget) {
      const { pos, isBack, isWall } = currentTarget;
      
      if (isWall) {
        // Wall shelves face -X (towards the aisles). Position camera at -X to look at them.
        desiredPos = new THREE.Vector3(pos[0] - 12, pos[1] + 8, pos[2]);
        lookTarget = new THREE.Vector3(pos[0], pos[1], pos[2]);
      } else {
        // Standard shelves face +Z. Back is -Z.
        const zOffset = isBack ? -12 : 12;
        desiredPos = new THREE.Vector3(pos[0], pos[1] + 8, pos[2] + zOffset);
        lookTarget = new THREE.Vector3(pos[0], pos[1], pos[2] + (isBack ? -0.9 : 0));
      }
    } else {
      // Smoothly return to the default overview position
      desiredPos = new THREE.Vector3(...defaultCamPos);
      lookTarget = new THREE.Vector3(0, 0, 0);
    }
    
    camera.position.lerp(desiredPos, 4 * delta);
    
    if (controlsRef.current) {
      controlsRef.current.target.lerp(lookTarget, 4 * delta);
      controlsRef.current.update();

      // Stop animating if we're very close to the target
      if (camera.position.distanceTo(desiredPos) < 0.1 && controlsRef.current.target.distanceTo(lookTarget) < 0.1) {
        setIsAnimating(false);
      }
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 2 - 0.1} // Prevent looking below the floor
      onStart={() => setIsAnimating(false)} // User interaction interrupts animation
    />
  );
};

const ThreeDMap = ({ location, layout }) => {
  const cols = layout?.columns || ['1', '2', '3', '4'];
  const allRows = layout?.rows || ['A', 'B', 'C'];
  const standardRows = allRows.filter(r => !r.toLowerCase().startsWith('wall'));
  
  const totalWidth = Math.max(0, (cols.length - 1) * 6);
  const totalDepth = Math.max(0, (standardRows.length - 1) * 5);
  
  const camX = Math.max(15, totalWidth * 0.5);
  const camY = Math.max(25, Math.max(totalWidth, totalDepth) * 0.8);
  const camZ = Math.max(30, totalDepth * 0.8 + 25);
  const defaultCamPos = [camX, camY, camZ];

  // Calculate exactly where the selected shelf is located in the 3D space
  const targetData = useMemo(() => {
    if (!location || !layout) return null;
    
    const backShelves = [
      layout?.shelves?.[3] || 'Unnamed-4',
      layout?.shelves?.[4] || 'Unnamed-5',
      layout?.shelves?.[5] || 'Unnamed-6',
    ];
    const isBack = backShelves.includes(location.shelf);

    // Check standard shelves
    const rowIndex = standardRows.indexOf(location.row);
    const colIndex = cols.indexOf(location.column);
    
    if (rowIndex !== -1 && colIndex !== -1) {
      const zPos = rowIndex * 5 - (totalDepth / 2);
      const xPos = colIndex * 6 - (totalWidth / 2);
      return { pos: [xPos, 0, zPos], isBack, isWall: false };
    }
    
    // Check wall shelves
    const lastColX = (cols.length - 1) * 6 - (totalWidth / 2);
    const farRightX = lastColX + 4.5;
    
    for (let i = 0; i < standardRows.length - 1; i++) {
      const wallLabel = layout?.walls?.[i] || `Wall-${i+1}`;
      if (location.row === wallLabel) {
        const zPos1 = (i * 5) - (totalDepth / 2);
        const zPos2 = ((i + 1) * 5) - (totalDepth / 2);
        const midZ = (zPos1 + zPos2) / 2;
        return { pos: [farRightX, 0, midZ], isBack: false, isWall: true };
      }
    }
    
    return null;
  }, [location, layout, standardRows, cols, totalDepth, totalWidth]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
      <Canvas shadows camera={{ position: defaultCamPos, fov: 50 }}>
        {/* Environment setup for highly realistic PBR lighting and reflections */}
        <Environment preset="city" />
        
        {/* Base ambient lighting */}
        <ambientLight intensity={0.3} />
        
        {/* Main Sun/Directional Light that casts soft shadows */}
        <directionalLight 
          castShadow 
          position={[15, 20, 15]} 
          intensity={1.2} 
          shadow-mapSize={[2048, 2048]} 
          shadow-camera-far={60}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        
        {/* Subtle fill light */}
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#e0f2fe" />
        
        <SupermarketLayout selectedLocation={location} layout={layout} />
        
        {targetData && (
          <MapPin position={[targetData.pos[0], 3.2, targetData.pos[2] + (targetData.isBack ? -0.9 : 0)]} />
        )}

        <CameraController targetData={targetData} defaultCamPos={defaultCamPos} />
      </Canvas>
    </div>
  );
};

export default ThreeDMap;
