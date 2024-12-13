import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

function createD10BipyramidGeometry() {
  const radius = 0.7;
  const height = 0.7;
  const topVertex = [0, height, 0];
  const bottomVertex = [0, -height, 0];
  const pentagon = [];
  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI * i) / 5;
    pentagon.push([
      radius * Math.cos(angle),
      0,
      radius * Math.sin(angle)
    ]);
  }

  const vertices = [topVertex, bottomVertex, ...pentagon];
  const faces = [];
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    const v1 = 2 + i;
    const v2 = 2 + next;
    // top
    faces.push([0, v1, v2]);
    // bottom
    faces.push([1, v2, v1]);
  }

  return new THREE.PolyhedronGeometry(vertices.flat(), faces.flat(), 1, 0);
}

function createGeometryForSides(sides) {
  switch (sides) {
    case 4:
      return new THREE.TetrahedronGeometry(1);
    case 6:
      return new THREE.BoxGeometry(1, 1, 1);
    case 8:
      return new THREE.OctahedronGeometry(1);
    case 10:
      return createD10BipyramidGeometry();
    case 12:
      return new THREE.DodecahedronGeometry(1);
    case 20:
      return new THREE.IcosahedronGeometry(1);
    default:
      // Should never happen since we only allow these sides
      return new THREE.IcosahedronGeometry(1);
  }
}

function computeFaceData(geometry) {
  const position = geometry.getAttribute('position');
  const index = geometry.index;
  const faces = [];
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const normal = new THREE.Vector3();

  if (index && index.count) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);

      vA.fromBufferAttribute(position, a);
      vB.fromBufferAttribute(position, b);
      vC.fromBufferAttribute(position, c);

      const center = new THREE.Vector3().addVectors(vA, vB).add(vC).divideScalar(3);
      normal.copy(vC).sub(vA).cross(vB.clone().sub(vA)).normalize();

      faces.push({ center, normal });
    }
  } else {
    // Non-indexed geometry
    for (let i = 0; i < position.count; i += 3) {
      vA.fromBufferAttribute(position, i);
      vB.fromBufferAttribute(position, i + 1);
      vC.fromBufferAttribute(position, i + 2);

      const center = new THREE.Vector3().addVectors(vA, vB).add(vC).divideScalar(3);
      normal.copy(vC).sub(vA).cross(vB.clone().sub(vA)).normalize();

      faces.push({ center, normal });
    }
  }

  return faces;
}

function groupFaces(faces, sides) {
  let trianglesPerFace;
  if (sides === 6) {
    trianglesPerFace = 2; // Cube face made of 2 triangles
  } else if (sides === 12) {
    trianglesPerFace = 3; // Dodecahedron face made of 3 triangles
  } else {
    trianglesPerFace = 1;
  }

  if (trianglesPerFace === 1) return faces;

  const grouped = [];
  for (let i = 0; i < faces.length; i += trianglesPerFace) {
    const group = faces.slice(i, i + trianglesPerFace);
    const avgCenter = new THREE.Vector3();
    const avgNormal = new THREE.Vector3();
    group.forEach((f) => {
      avgCenter.add(f.center);
      avgNormal.add(f.normal);
    });
    avgCenter.divideScalar(trianglesPerFace);
    avgNormal.normalize();
    grouped.push({ center: avgCenter, normal: avgNormal });
  }
  return grouped;
}

function getFaceOrientation(sides, rolledNumber) {
  // This returns a base orientation for the dice to show the rolledNumber face forward
  if (sides === 4) {
    const index = (rolledNumber - 1) % 4;
    return new THREE.Euler(index * (Math.PI / 2), index * (Math.PI / 4), 0);
  } else if (sides === 6) {
    const faceRotations = [
      new THREE.Euler(0,0,0),
      new THREE.Euler(0,-Math.PI/2,0),
      new THREE.Euler(0,Math.PI,0),
      new THREE.Euler(0,Math.PI/2,0),
      new THREE.Euler(-Math.PI/2,0,0),
      new THREE.Euler(Math.PI/2,0,0)
    ];
    return faceRotations[(rolledNumber - 1) % 6];
  } else if (sides === 8) {
    const index = (rolledNumber - 1) % 8;
    return new THREE.Euler((index * Math.PI/4), (index * Math.PI/4), 0);
  } else if (sides === 10) {
    const faceIndex = (rolledNumber - 1) % 10;
    const isTop = faceIndex < 5;
    const anglePerFace = (2 * Math.PI) / 5;
    const baseIndex = isTop ? faceIndex : faceIndex - 5;
    const angleY = anglePerFace * baseIndex;
    return isTop
      ? new THREE.Euler(-Math.PI / 2, angleY, 0)
      : new THREE.Euler(Math.PI / 2, angleY, 0);
  } else if (sides === 12) {
    const angle = ((rolledNumber - 1) / 12) * 2 * Math.PI;
    return new THREE.Euler(Math.PI/2, angle, 0);
  } else if (sides === 20) {
    const angle = ((rolledNumber - 1) / 20) * 2 * Math.PI;
    return new THREE.Euler(Math.PI/2, angle, 0);
  } else {
    return new THREE.Euler(0,0,0);
  }
}

const Dice = ({ sides, rolledNumber, rollTrigger }) => {
  const diceRef = useRef();
  const [rollPhase, setRollPhase] = useState('idle');
  const [rollStartTime, setRollStartTime] = useState(0);
  const [randomAxis, setRandomAxis] = useState(new THREE.Vector3());
  const [finalQuat, setFinalQuat] = useState(new THREE.Quaternion());

  const geometry = useMemo(() => createGeometryForSides(sides), [sides]);
  const faceDataRaw = useMemo(() => computeFaceData(geometry), [geometry]);
  const faceData = useMemo(() => groupFaces(faceDataRaw, sides), [faceDataRaw, sides]);

  useEffect(() => {
    if (rollTrigger === 0) return; // no new roll
    setRollPhase('random-spin');
    setRollStartTime(performance.now());

    const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    setRandomAxis(axis);

    // Get current orientation of the dice as a quaternion
    const currentQuat = new THREE.Quaternion().copy(diceRef.current.quaternion);

    // Compute the desired final orientation for the chosen face
    const faceEuler = getFaceOrientation(sides, rolledNumber);
    const faceQuat = new THREE.Quaternion().setFromEuler(faceEuler);

    // Instead of using faceQuat directly, let's combine it relative to current orientation:
    // This makes the final orientation not snap to a global base orientation, but relative
    // to where the dice currently is.
    //
    // One approach: The "faceQuat" is an absolute orientation to show the face.
    // If we want the result to be relative, we might just apply faceQuat as absolute.
    // But the user wants no snapping. To avoid snapping, we keep the dice exactly at faceQuat.
    // If you need true relativity (like adding faceQuat rotation on top of current), 
    // you could do: currentQuat.multiply(faceQuat)
    //
    // But this might rotate dice differently each time. Let's try absolute approach first:
    // Actually, the user wants it not to reset to a start position. If faceQuat is absolute,
    // it might look like a reset. Let's apply it relative to current orientation:
    // current orientation * faceQuat means we rotate from current orientation to new orientation
    // If we do currentQuat.multiply(faceQuat), the dice will "stack" rotations each roll.
    // Let's try absolute first. If that fails, uncomment relative approach.
    
    // Relative approach (try if absolute doesn't suit needs):
    currentQuat.multiply(faceQuat);

    // We'll try absolute finalQuat first:
    setFinalQuat(faceQuat);

  }, [rollTrigger, sides, rolledNumber]);

  useFrame((_, delta) => {
    if (!diceRef.current) return;

    if (rollPhase === 'random-spin') {
      const t = performance.now() - rollStartTime;
      if (t < 1000) {
        const spinSpeed = (1000 - t) / 1000 * 10;
        diceRef.current.rotation.x += randomAxis.x * delta * spinSpeed;
        diceRef.current.rotation.y += randomAxis.y * delta * spinSpeed;
        diceRef.current.rotation.z += randomAxis.z * delta * spinSpeed;
      } else {
        setRollPhase('settle');
        setRollStartTime(performance.now());
      }
    } else if (rollPhase === 'settle') {
      // Interpolate from current orientation to finalQuat
      const currentQuat = diceRef.current.quaternion.clone();
      currentQuat.slerp(finalQuat, 0.1);
      diceRef.current.quaternion.copy(currentQuat);

      // Check if close enough
      if (currentQuat.angleTo(finalQuat) < 0.01) {
        // Stop
        diceRef.current.quaternion.copy(finalQuat);
        setRollPhase('idle');
      }
    }
    // 'idle' phase: do nothing, orientation stays as is
  });

  return (
    <group ref={diceRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="white" metalness={0.1} roughness={0.5} />
      </mesh>
      {faceData.map((face, i) => (
        <FaceNumber key={i} faceIndex={i} face={face} />
      ))}
    </group>
  );
};

function FaceNumber({ face, faceIndex }) {
  const globalUp = new THREE.Vector3(0,1,0);
  const forward = face.normal.clone().normalize();
  let right = new THREE.Vector3().crossVectors(globalUp, forward);
  if (right.length() < 0.0001) {
    right = new THREE.Vector3(1,0,0).cross(forward).normalize();
  } else {
    right.normalize();
  }
  
  const up = new THREE.Vector3().crossVectors(forward, right);

  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeBasis(right, up, forward);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

  const offsetPos = face.center.clone().add(forward.clone().multiplyScalar(0.02));

  return (
    <Text
      position={offsetPos}
      fontSize={0.2}
      color="red"
      anchorX="center"
      anchorY="middle"
      quaternion={quaternion}
    >
      {faceIndex + 1}
    </Text>
  );
}

const DICE_OPTIONS = [3,4,6,8,10,12,20];

const DiceRoller = () => {
  const [sides, setSides] = useState(6);
  const [rolledNumber, setRolledNumber] = useState(1);
  const [rollTrigger, setRollTrigger] = useState(0);

  const rollDice = () => {
    const randomNumber = Math.floor(Math.random() * sides) + 1;
    setRolledNumber(randomNumber);
    setRollTrigger(rollTrigger + 1);
  };

  return (
    <div style={{ textAlign: 'center', height: '100vh', margin: 0, overflow: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          {DICE_OPTIONS.map(opt => (
            <button 
              key={opt} 
              onClick={() => {
                // Change dice sides, keep orientation as is
                setSides(opt);
              }}
              style={{ marginRight: '5px' }}
            >
              d{opt}
            </button>
          ))}
        </div>
        <button onClick={rollDice}>Roll Dice</button>
        <p>Rolled Number: {rolledNumber}</p>
      </div>
      <div style={{ width: '100%', height: '80%' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: '#f0f0f0' }}
          shadows
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Dice sides={sides} rolledNumber={rolledNumber} rollTrigger={rollTrigger} />
        </Canvas>
      </div>
    </div>
  );
};

export default DiceRoller;
