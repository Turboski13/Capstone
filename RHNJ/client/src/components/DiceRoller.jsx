import React, { useRef, useImperativeHandle, forwardRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useFBX, useTexture } from '@react-three/drei'
import { Physics, useConvexPolyhedron, usePlane } from '@react-three/cannon'
import D12 from './D12.jsx';
import D10 from './D10.jsx';
const baseColorMap = new THREE.TextureLoader().load('/assets/d20/dice-basecolors.jpeg')
const normalMap = new THREE.TextureLoader().load('/assets/d20/dice-normal.jpeg')
const roughnessMap = new THREE.TextureLoader().load('/assets/d20/dice-rough.jpeg')

// Hardcoded icosahedron vertices & faces (for d20)
const PHI = (1 + Math.sqrt(5)) / 2
const N = 1
const vertices = [
  [-N, PHI, 0],
  [N, PHI, 0],
  [-N, -PHI, 0],
  [N, -PHI, 0],
  [0, -N, PHI],
  [0, N, PHI],
  [0, -N, -PHI],
  [0, N, -PHI],
  [PHI, 0, -N],
  [PHI, 0, N],
  [-PHI, 0, -N],
  [-PHI, 0, N],
]
const faces = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],
  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],
  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],
  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1],
]

function Floor() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }))
  
  // Load your texture image
  // const texture = useTexture('/logo.png') 
  
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[9, 9]} />
      <meshStandardMaterial  />
    </mesh>
  )
}



const faceValues = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

const faceMap = {
  16: 7,
  17: 10,
  12: 12,
  20: 13,
  19: 4,
  8: 8,
  10: 11,
  13: 2,
  11: 15,
  18: 20,
  6: 1,
  5: 16,
  3: 6,
  7: 17,
  2: 19,
  4: 9,
  14: 18,
  9: 14,
  15: 5,
  1: 3,
}

const Dice = forwardRef(({ rotation, position }, ref) => {
  const originalFBX = useFBX('/assets/d20/d20New.fbx')
  // Clone the fbx so each dice gets its own instance
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX])
  
  const perfectD20Geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), [])
  const scaleFactor = .18

  const [perfectD20Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [vertices.map(([x, y, z]) => [x * scaleFactor, y * scaleFactor, z * scaleFactor]), faces],
    position,
    friction: 0.6,
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.1
  }))

  useEffect(() => {
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: baseColorMap,
          normalMap: normalMap,
          roughnessMap: roughnessMap,
          metalness: 0,
          roughness: 1,
          transparent: true,
          opacity: 1
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [fbx])

  const logTopFace = () => {
    if (!perfectD20Ref.current) return null
    const geom = perfectD20Ref.current.geometry
    if (!geom) return null

    const positionAttr = geom.attributes.position
    if (!positionAttr) return null

    const index = geom.index
    const normal = new THREE.Vector3()
    let topFaceIndex = -1
    let maxY = -Infinity

    perfectD20Ref.current.updateMatrixWorld(true)
    const worldMatrix = perfectD20Ref.current.matrixWorld
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix)

    const vA = new THREE.Vector3()
    const vB = new THREE.Vector3()
    const vC = new THREE.Vector3()
    const edge1 = new THREE.Vector3()
    const edge2 = new THREE.Vector3()

    const processFace = (a, b, c, faceIndex) => {
      vA.fromBufferAttribute(positionAttr, a)
      vB.fromBufferAttribute(positionAttr, b)
      vC.fromBufferAttribute(positionAttr, c)

      edge1.subVectors(vB, vA)
      edge2.subVectors(vC, vA)
      normal.crossVectors(edge1, edge2).normalize()

      normal.applyMatrix3(normalMatrix).normalize()

      if (normal.y > maxY) {
        maxY = normal.y
        topFaceIndex = faceIndex
      }
    }

    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const a = index.array[i]
        const b = index.array[i+1]
        const c = index.array[i+2]
        processFace(a, b, c, i / 3)
      }
    } else {
      for (let i = 0; i < positionAttr.count; i += 3) {
        processFace(i, i+1, i+2, i / 3)
      }
    }

    if (topFaceIndex === -1) {
      console.warn("No top face found.")
      return null
    } else {
      const topFaceValue = faceValues[topFaceIndex]
      return topFaceValue
    }
  }

  useImperativeHandle(ref, () => ({
    rollDice: () => {
      // Do not reset positions/rotations, just apply impulse
      api.velocity.set(0, 0, 0)
      api.angularVelocity.set(0, 0, 0)

      const impulse = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        2.5,
        (Math.random() - 0.5) * 3
      )
      api.applyImpulse([impulse.x, impulse.y, impulse.z], [0, 0, 0])

      api.angularVelocity.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      )

      setTimeout(() => {
        const topFaceValue = logTopFace()
        if (topFaceValue != null) {
          const mappedValue = faceMap[topFaceValue]
          console.log(`Dice at ${position}: Face: ${topFaceValue}, Shown: ${mappedValue}`)
        }
      }, 2200)
    },
  }))

  return (
    <mesh ref={perfectD20Ref} geometry={perfectD20Geometry} scale={[scaleFactor, scaleFactor, scaleFactor]}>
      {/* needed to set the icosahedron to invisible so we can use our own artwork and skins on the dice*/}
      <meshStandardMaterial color="green" opacity={0.5} visible={false} transparent={false} />
      <group rotation={[rotation.x, rotation.y, rotation.z]}>
        <primitive object={fbx} scale={0.8} />
      </group>
    </mesh>
  )
})

function InvisibleWalls() {
  // Larger size
  const size = 1
  usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }))
  usePlane(() => ({ rotation: [Math.PI / 2, 0, 0], position: [0, 2.5, 0] }))
  usePlane(() => ({ rotation: [0, Math.PI / 2, 0], position: [-size, 0.5, 0] }))
  usePlane(() => ({ rotation: [0, -Math.PI / 2, 0], position: [size, 0.5, 0] }))
  usePlane(() => ({ rotation: [0, 0, 0], position: [0, 0.5, -size] }))
  usePlane(() => ({ rotation: [0, Math.PI, 0], position: [0, 0.5, size] }))
  return null
}

export default function DiceRoller() {
  const [rotation, setRotation] = useState({ x: -0.35, y: -0.55, z: -1.25 })
  const increment = 0.05

  const [diceType, setDiceType] = useState(null);
  const [diceCount, setDiceCount] = useState(1);

  const diceRefs = useRef([])

  const adjustRotation = (axis, delta) => {
    setRotation((prev) => ({ ...prev, [axis]: prev[axis] + delta }))
  }

  const logRotation = () => {
    console.log("Final rotation (radians):", rotation)
  }

  const handleRoll = () => {
    // Just apply impulse, no re-render or position reset
    diceRefs.current.forEach((dRef) => dRef?.rollDice && dRef.rollDice())
  }

  const handleDiceSelection = (type) => {
    setDiceType(type);
  }

  const handleDiceCountChange = (e) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && val > 0) {
      setDiceCount(val)
    }
  }

  // Spread the dice out along the x-axis
  const dicePositions = useMemo(() => {
    const startX = -(diceCount - 1) * 0.2
    return Array.from({ length: diceCount }, (_, i) => [startX + i * 0.2, 1, 0])
  }, [diceCount])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Dice selection and count UI */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 999 }}>
        <div>
          <button onClick={() => handleDiceSelection('4')}>d4</button>
          <button onClick={() => handleDiceSelection('6')}>d6</button>
          <button onClick={() => handleDiceSelection('8')}>d8</button>
          <button onClick={() => handleDiceSelection('10')}>d10</button>
          <button onClick={() => handleDiceSelection('12')}>d12</button>
          <button onClick={() => handleDiceSelection('20')}>d20</button>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            Number of Dice: 
            <input type="number" value={diceCount} onChange={handleDiceCountChange} style={{ width: '50px', marginLeft: '5px' }} />
          </label>
        </div>
      </div>

      <button 
        onClick={handleRoll} 
        style={{
          position: 'absolute', 
          top: '120px', 
          left: '20px', 
          zIndex: 10,
          padding: '5px 10px', 
          fontSize: '14px'
        }}
      >
        Roll the Dice
      </button>

      {/* Rotation adjustment controls */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 999, background: '#fff', padding: '10px' }}>
        <div>
          <button onClick={() => adjustRotation('x', increment)}>X+</button>
          <button onClick={() => adjustRotation('x', -increment)}>X-</button>
        </div>
        <div>
          <button onClick={() => adjustRotation('y', increment)}>Y+</button>
          <button onClick={() => adjustRotation('y', -increment)}>Y-</button>
        </div>
        <div>
          <button onClick={() => adjustRotation('z', increment)}>Z+</button>
          <button onClick={() => adjustRotation('z', -increment)}>Z-</button>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button onClick={logRotation}>Log Rotation</button>
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 1.8, 1.4], fov: 65 }}>
        <ambientLight intensity={0.4} />
        <directionalLight 
          intensity={1} 
          position={[2, 10, 8]} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Physics key={diceCount} gravity={[0, -9.81, 0]}>
          <InvisibleWalls />
          <Floor />

          {diceType === '20' && dicePositions.map((pos, i) => (
            <Dice
              key={i}
              ref={el => diceRefs.current[i] = el}
              diceType="20"
              rotation={rotation}
              position={pos}
            />
          ))}
          {diceType === '12' && dicePositions.map((pos, i) => (
            <D12
              key={i}
              ref={el => diceRefs.current[i] = el}
              diceType="12"
              rotation={rotation}
              position={pos}
            />
          ))}
          {diceType === '10' && dicePositions.map((pos, i) => (
            <D10
              key={i}
              ref={el => diceRefs.current[i] = el}
              diceType="10"
              rotation={rotation}
              position={pos}
            />
          ))}
        </Physics>
      </Canvas>
    </div>
  )
}
