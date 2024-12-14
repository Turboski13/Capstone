import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import * as CANNON from 'cannon-es';

// Physics world hook
const usePhysics = () => {
  const world = useRef(null);

  useEffect(() => {
    const w = new CANNON.World();
    w.gravity.set(0, -9.82, 0); // Gravity pointing downwards
    w.broadphase = new CANNON.NaiveBroadphase();
    w.solver.iterations = 10;
    world.current = w;
    return () => {
      world.current = null;
    };
  }, []);

  return world;
};

// A component inside Canvas to step physics each frame
const PhysicsStepper = ({ world }) => {
  useFrame(() => {
    if (world) {
      world.step(1 / 120);
    }
  });
  return null;
};

// Dynamic Camera Component
const DynamicCamera = ({ diceBody }) => {
  const cameraRef = useRef();

  useFrame(() => {
    if (diceBody) {
      const dicePosition = diceBody.position;
      const diceHeight = dicePosition?.y || 0;

      // Adjust the camera's position dynamically
      const desiredZ = Math.max(5, diceHeight + 2);
      cameraRef.current.position.lerp(
        new THREE.Vector3(dicePosition.x, dicePosition.y + 2, desiredZ),
        0.1
      );

      // Look at the dice
      cameraRef.current.lookAt(dicePosition.x, dicePosition.y, dicePosition.z);
    }
  });

  return <perspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 5]} />;
};

// Dice Roller Component
const DiceRoller = () => {
  const diceRef = useRef();
  const physicsWorld = usePhysics();

  const rollDice = () => {
    if (diceRef.current) {
      diceRef.current.roll();
    }
  };

  return (
    <div style={{ textAlign: 'center', height: '100vh', margin: 0, overflow: 'hidden' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={rollDice}>Roll Dice</button>
      </div>
      <div style={{ width: '100%', height: '80%' }}>
        <Canvas shadows>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <OrbitControls />

          <PhysicsStepper world={physicsWorld.current} />
          <DynamicCamera diceBody={diceRef.current?.diceBody} />

          <Ground physicsWorld={physicsWorld} />
          <Wall physicsWorld={physicsWorld} position={[0, 0, -5]} rotation={[0, 0, 0]} />
          <Dice ref={diceRef} physicsWorld={physicsWorld} />
        </Canvas>
      </div>
    </div>
  );
};

// Ground Component (No texture, simple material)
const Ground = ({ physicsWorld }) => {
  const groundBody = useRef();

  useEffect(() => {
    // Create the ground physics body
    groundBody.current = new CANNON.Body({
      mass: 0, // Static body
      shape: new CANNON.Plane(),
    });
    groundBody.current.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.current.addBody(groundBody.current);

    return () => {
      physicsWorld.current.removeBody(groundBody.current);
    };
  }, [physicsWorld]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#888" roughness={1} />
    </mesh>
  );
};

// An invisible wall component
const Wall = ({ physicsWorld, position = [0,0,0], rotation = [0,0,0] }) => {
  const wallBody = useRef();

  useEffect(() => {
    // Create a vertical wall (plane)
    wallBody.current = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    });
    const euler = new THREE.Euler(...rotation);
    const q = new CANNON.Quaternion();
    q.setFromEuler(euler.x, euler.y, euler.z);
    wallBody.current.quaternion.copy(q);
    wallBody.current.position.set(...position);
    physicsWorld.current.addBody(wallBody.current);

    return () => {
      physicsWorld.current.removeBody(wallBody.current);
    };
  }, [physicsWorld, position, rotation]);

  return null;
};

// Dice Component
const Dice = React.forwardRef(({ physicsWorld }, ref) => {
  const diceRef = useRef();
  const [model, setModel] = useState(null);
  const diceBody = useRef();

  useEffect(() => {
    // Create the dice's physics body (approximated as a sphere)
    diceBody.current = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(0.1),
      position: new CANNON.Vec3(0, 5, 0),
    });
    physicsWorld.current.addBody(diceBody.current);

    return () => {
      physicsWorld.current.removeBody(diceBody.current);
    };
  }, [physicsWorld]);

  useEffect(() => {
    // Load the FBX dice model
    const loader = new FBXLoader();
    loader.load('/assets/d20/source/dadoD20.fbx', (object) => {
      object.scale.set(0.1, 0.1, 0.1);
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load('/assets/d20/textures/dadosText.png'),
            normalMap: new THREE.TextureLoader().load('/assets/d20/textures/NormalMap.png'),
            roughnessMap: new THREE.TextureLoader().load('/assets/d20/textures/roughnessDado.png'),
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setModel(object);
    });
  }, []);

  useFrame(() => {
    // Sync Three.js object position and rotation with Cannon.js body
    if (diceBody.current && diceRef.current) {
      diceRef.current.position.copy(diceBody.current.position);
      diceRef.current.quaternion.copy(diceBody.current.quaternion);
    }
  });

  // Expose roll function and diceBody
  useEffect(() => {
    if (ref) {
      ref.current = {
        roll: () => {
          if (diceBody.current) {
            diceBody.current.wakeUp();
            const force = new CANNON.Vec3(
              (Math.random() - 0.5) * 10,
              Math.random() * 5 + 10,
              (Math.random() - 0.5) * 10
            );
            diceBody.current.applyImpulse(force, diceBody.current.position);
          }
        },
        diceBody: diceBody.current,
      };
    }
  }, [ref]);

  return model ? <primitive ref={diceRef} object={model} /> : null;
});

export default DiceRoller;
