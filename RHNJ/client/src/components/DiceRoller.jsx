import React, { useRef, useImperativeHandle, forwardRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useFBX } from '@react-three/drei'
import { Physics, useConvexPolyhedron, usePlane } from '@react-three/cannon'

const baseColorMap = new THREE.TextureLoader().load('/assets/d20/textures/dadosText.png')
const normalMap = new THREE.TextureLoader().load('/assets/d20/textures/NormalMap.png')
const roughnessMap = new THREE.TextureLoader().load('/assets/d20/textures/roughnessDado.png')

// Hardcoded icosahedron vertices & faces
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
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[9, 9]} />
      <meshStandardMaterial color="#999" />
    </mesh>
  )
}

const Dice = forwardRef(({ rotation }, ref) => {
  const fbx = useFBX('/assets/d20/source/dadoD20.fbx')

  const perfectD20Geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), [])

  // Scale factor if needed
  const scaleFactor = 0.1

  // Set up the physics for the perfect D20
  const [perfectD20Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [vertices.map(([x, y, z]) => [x * scaleFactor, y * scaleFactor, z * scaleFactor]), faces],
    position: [0, 1, 0],
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
          opacity: 0.5
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [fbx])

  const logTopFace = () => {
    if (!perfectD20Ref.current) return
    const geom = perfectD20Ref.current.geometry
    if (!geom) return

    const position = geom.attributes.position
    if (!position) return

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
      vA.fromBufferAttribute(position, a)
      vB.fromBufferAttribute(position, b)
      vC.fromBufferAttribute(position, c)

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
        const b = index.array[i + 1]
        const c = index.array[i + 2]
        processFace(a, b, c, i / 3)
      }
    } else {
      for (let i = 0; i < position.count; i += 3) {
        processFace(i, i + 1, i + 2, i / 3)
      }
    }

    if (topFaceIndex === -1) {
      console.warn("No top face found.")
    } else {
      const faceValues = Array.from({ length: 20 }, (_, i) => i + 1)
      console.log("The top face index is:", topFaceIndex)
      console.log("Top face value:", faceValues[topFaceIndex])
    }
  }

  useImperativeHandle(ref, () => ({
    rollDice: () => {
      api.position.set(0, 0.5, 0)
      api.rotation.set(0, 0, 0)
      api.velocity.set(0, 0, 0)
      api.angularVelocity.set(0, 0, 0)

      const impulse = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        2,
        (Math.random() - 0.5) * 2
      )
      api.applyImpulse([impulse.x, impulse.y, impulse.z], [0, 0, 0])

      api.angularVelocity.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      )
    },
    nudgeRotation: (rx = 0, ry = 0, rz = 0) => {
      api.rotation.set((x, y, z) => {
        api.rotation.set(x + rx, y + ry, z + rz)
      })
    },
    logNumberOfFaces: () => {
      const geom = perfectD20Ref.current.geometry
      let numberOfFaces = 0
      if (geom.index) {
        numberOfFaces = geom.index.count / 3
      } else {
        const position = geom.getAttribute('position')
        numberOfFaces = position.count / 3
      }
      console.log("Number of faces on the current D20 shape:", numberOfFaces)
    },
    logTopFace: () => {
      logTopFace()
    }
  }))

  // State for rotation of the FBX model
  

  const adjustRotation = (axis, delta) => {
    setRotation((prev) => ({ ...prev, [axis]: prev[axis] + delta }))
  }

  const logRotation = () => {
    console.log("Final rotation needed (in radians):", rotation)
  }

  return (
    <>
      <mesh ref={perfectD20Ref} geometry={perfectD20Geometry} scale={[scaleFactor, scaleFactor, scaleFactor]}>
        <meshStandardMaterial color="green" opacity={0} visible={false} />
        {/* The detailed dice as a child, with adjustable rotation */}
        <group rotation={[-0.4, -0.5, -0.65]}>
          <primitive object={fbx} scale={0.4} />
        </group>
      </mesh>
    </>
  )
})

function InvisibleWalls() {
  const size = .8
  usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }))
  usePlane(() => ({ rotation: [Math.PI / 2, 0, 0], position: [0, 1.5, 0] }))
  usePlane(() => ({ rotation: [0, Math.PI / 2, 0], position: [-size, 0.5, 0] }))
  usePlane(() => ({ rotation: [0, -Math.PI / 2, 0], position: [size, 0.5, 0] }))
  usePlane(() => ({ rotation: [0, 0, 0], position: [0, 0.5, -size] }))
  usePlane(() => ({ rotation: [0, Math.PI, 0], position: [0, 0.5, size] }))
  return null
}

export default function DiceRoller() {
  const diceRef = useRef()

  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const increment = 0.05

  const adjustRotation = (axis, delta) => {
    setRotation((prev) => ({ ...prev, [axis]: prev[axis] + delta }))
  }

  const logRotation = () => {
    console.log("Final rotation (radians):", rotation)
  }

  const handleRoll = () => {
    if (diceRef.current?.rollDice) {
      diceRef.current.rollDice()
    }
  }

  const handleNudge = () => {
    if (diceRef.current?.nudgeRotation) {
      diceRef.current.nudgeRotation(0.05, 0, 0)
    }
  }

  const handleLogTopFace = () => {
    if (diceRef.current?.logTopFace) {
      diceRef.current.logTopFace()
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Buttons for main dice actions */}
      <button onClick={handleRoll} style={{position:'absolute', top:'20px', left:'20px', zIndex:10}}>Roll the Dice</button>
      <button onClick={handleNudge} style={{position:'absolute', top:'60px', left:'20px', zIndex:10}}>Nudge Rotation</button>
      <button onClick={handleLogTopFace} style={{position:'absolute', top:'100px', left:'20px', zIndex:10}}>Log Top Face</button>

      {/* Control Buttons for rotation adjustments OUTSIDE the Dice component */}
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

      <Canvas shadows camera={{ position: [0, 2, .8], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight 
          intensity={1} 
          position={[1, 7, 5]} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Physics gravity={[0, -9.81, 0]}>
          {/* Pass rotation as props to Dice */}
          <Dice ref={diceRef} rotation={rotation} />
          <InvisibleWalls />
          <Floor />
        </Physics>
      </Canvas>
    </div>
  )
}
