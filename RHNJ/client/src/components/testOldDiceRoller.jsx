import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls, useTexture } from '@react-three/drei';

const DiceRoller = () => {
  const [sides, setSides] = useState(20);
  const [rolledNumber, setRolledNumber] = useState(1);
  const [rollTrigger, setRollTrigger] = useState(0);

  const rollDice = () => {
    setRollTrigger(rollTrigger + 1); // Trigger dice roll
  };

  return (
    <div style={{ textAlign: 'center', height: '100vh', margin: 0, overflow: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => setSides(20)} style={{ marginRight: '5px' }}>
            d20
          </button>
        </div>
        <button onClick={rollDice}>Roll Dice</button>
        <p>Rolled Number: {rolledNumber}</p>
      </div>
      <div style={{ width: '100%', height: '80%' }}>
        <Canvas camera={{ position: [0, 0, 3], fov: 25 }} style={{ background: '#f0f0f0' }} shadows>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <OrbitControls
  enablePan={false}
  enableZoom={false}
  enableRotate={false}
  enableDamping={false} // Disable any damping for further locking
/>
          <Dice sides={sides} rollTrigger={rollTrigger} onRollComplete={setRolledNumber} />
        </Canvas>
      </div>
    </div>
  );
};

const Dice = ({ sides, rollTrigger, onRollComplete }) => {
  const diceRef = useRef();
  const lineRef = useRef(); // Reference for the ray line
  const { camera } = useThree(); // Access the camera
  const [rollPhase, setRollPhase] = useState('idle');
  const [rollStartTime, setRollStartTime] = useState(0);
  const [randomAxis, setRandomAxis] = useState(new THREE.Vector3());
  const [model, setModel] = useState(null);

  const baseColorMap = useTexture('/assets/d20/textures/dadosText.png');
  const normalMap = useTexture('/assets/d20/textures/NormalMap.png');
  const roughnessMap = useTexture('/assets/d20/textures/roughnessDado.png');

  // Predefined orientations for each face
  const faceQuaternions = [
    { number: 1, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)) },
    { number: 2, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, 0, 0)) },
    { number: 3, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)) },
    { number: 4, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)) },
    { number: 5, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)) },
    { number: 6, quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)) },
    // Add the rest of the d20 faces here...
  ];

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load('/assets/d20/source/dadoD20.fbx', (object) => {
      object.scale.set(0.1, 0.1, 0.1);
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: baseColorMap,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setModel(object);
    });
  }, [baseColorMap, normalMap, roughnessMap]);

  useEffect(() => {
    if (rollTrigger === 0 || !model) return;

    setRollPhase('random-spin');
    setRollStartTime(performance.now());

    const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    setRandomAxis(axis);
  }, [rollTrigger, model]);

  useFrame((_, delta) => {
    if (!diceRef.current || !model) return;
  
    if (rollPhase === 'random-spin') {
      const t = performance.now() - rollStartTime;
      if (t < 1000) {
        const spinSpeed = ((1000 - t) / 500) * 10;
        diceRef.current.rotation.x += randomAxis.x * delta * spinSpeed;
        diceRef.current.rotation.y += randomAxis.y * delta * spinSpeed;
        diceRef.current.rotation.z += randomAxis.z * delta * spinSpeed;
      } else {
        setRollPhase('settle');
        setRollStartTime(performance.now());
      }
    } else if (rollPhase === 'settle') {
      // Update the ray line to ensure accurate alignment for snapping
      updateRayLine(camera, lineRef);
  
      // Snap to the nearest face when fully settled
      const snapCompleted = snapToNearestFace(camera, diceRef.current, faceQuaternions, onRollComplete);
      if (snapCompleted) {
        setRollPhase('idle'); // Mark as idle only after snapping is complete
      }
    }
  });

  return (
    <group ref={diceRef}>
      {model && <primitive object={model} />}
      <line ref={lineRef}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, 0])} // Start and end positions
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="red" />
      </line>
    </group>
  );
};

const snapToNearestFace = (camera, dice, faceQuaternions, onRollComplete) => {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  // Find the face quaternion most aligned with the camera direction
  let bestFace = null;
  let maxDot = -Infinity;
  // faceQuaternions.forEach((face) => {
  //   const faceDirection = new THREE.Vector3(0, 0, 2).applyQuaternion(face.quaternion);
  //   const dot = direction.dot(faceDirection);
  //   if (dot > maxDot) {
  //     maxDot = dot;
  //     bestFace = face;
  //   }
  // });

  // if (bestFace) {
  //   const currentQuat = dice.quaternion.clone();
  //   currentQuat.slerp(bestFace.quaternion, 0.01);
  //   dice.quaternion.copy(currentQuat);

  //   if (currentQuat.angleTo(bestFace.quaternion) < 0.01) {
  //     dice.quaternion.copy(bestFace.quaternion);
  //     onRollComplete(bestFace.number);
  //     return true; // Snapping is complete
  //   }
  // }
  // return false; // Still settling
};

const updateRayLine = (camera, lineRef) => {
  const line = lineRef.current;
  if (line) {
    const positions = line.geometry.attributes.position.array;
    positions[0] = camera.position.x;
    positions[1] = camera.position.y;
    positions[2] = camera.position.z;
    positions[3] = camera.position.x; // Extend straight along the Z-axis
    positions[4] = camera.position.y;
    positions[5] = camera.position.z - 3; // Adjust length of the ray
    line.geometry.attributes.position.needsUpdate = true;
  }
};

// function faceIndexToValue(faceIndex) {
//   const mapping = {
//     // 0: 6, //or 14
//     1: 4,
//     2: 9,
//     3: 14, // or 6
//     4: 10,
//     5: 1,
//     6: 16,
//     7: 14,
//     8: 5,
//     9: 2,
//     10: 20, //or 1
//     11: 18,
//     12: 20,
//     13: 1,
//     14: 17,
//     15: 7, //maybe 16
//     16: 15, //or 7
//     17: 12,
//     18: 5,
//     19: 13,
//     20: 11,
//     // Add the rest of the mappings for a d20
//   };
//   return mapping[faceIndex]
// };
export default DiceRoller;

