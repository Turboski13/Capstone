import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls, useTexture } from '@react-three/drei';

const DICE_OPTIONS = [20];

const DiceRoller = () => {
  const [sides, setSides] = useState(20);
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
              onClick={() => setSides(opt)}
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
        <Canvas camera={{ position: [0, 0, 1], fov: 25 }} style={{ background: '#f0f0f0' }} shadows>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <OrbitControls />
          <Dice sides={sides} rolledNumber={rolledNumber} rollTrigger={rollTrigger} />
        </Canvas>
      </div>
    </div>
  );
};

export default DiceRoller;

function Dice({ sides, rolledNumber, rollTrigger }) {
  const diceRef = useRef();
  const [rollPhase, setRollPhase] = useState('idle');
  const [rollStartTime, setRollStartTime] = useState(0);
  const [randomAxis, setRandomAxis] = useState(new THREE.Vector3());
  const [finalQuat, setFinalQuat] = useState(new THREE.Quaternion());
  const [model, setModel] = useState(null);

  const baseColorMap = useTexture('/assets/d20/textures/dadosText.png');
  const normalMap = useTexture('/assets/d20/textures/NormalMap.png');
  const roughnessMap = useTexture('/assets/d20/textures/roughnessDado.png');

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load('/assets/d20/source/dadoD20.fbx', (object) => {
      object.scale.set(0.02, 0.02, 0.02);
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

    // Decide a final orientation (random for now):
    const randomRotation = new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    const faceQuat = new THREE.Quaternion().setFromEuler(randomRotation);
    setFinalQuat(faceQuat);
  }, [rollTrigger, model, sides, rolledNumber]);

  useFrame((_, delta) => {
    if (!diceRef.current || !model) return;

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
      // Smoothly slerp to finalQuat
      const currentQuat = diceRef.current.quaternion.clone();
      currentQuat.slerp(finalQuat, 0.0);
      diceRef.current.quaternion.copy(currentQuat);

      // Check how close we are without forcing a snap
      const angleDiff = currentQuat.angleTo(finalQuat);
      if (angleDiff < 0.01) {
        // Close enough - stop updating
        setRollPhase('idle');
      }
    }
    // 'idle' means we do nothing, leaving the dice at its last orientation.
  });

  return (
    <group ref={diceRef}>
      {model && <primitive object={model} />}
    </group>
  );
}
