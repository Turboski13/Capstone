import React, { forwardRef, useRef, useImperativeHandle, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFBX } from '@react-three/drei'
import { useConvexPolyhedron } from '@react-three/cannon'

// Load your D12 textures
const d12BaseColorMap = new THREE.TextureLoader().load('/assets/d20/dice-basecolors.jpeg')
const d12NormalMap = new THREE.TextureLoader().load('/assets/d20/dice-normal.jpeg')
const d12RoughnessMap = new THREE.TextureLoader().load('/assets/d20/dice-roughness.jpeg')

// Create a perfect D12 geometry (dodecahedron)
const perfectD12Geometry = new THREE.DodecahedronGeometry(1, 0)

// Extract vertices and faces from the D12 geometry
const positionAttr = perfectD12Geometry.attributes.position
const indexAttr = perfectD12Geometry.index

const scaleFactor = 0.2

const d12FaceMap = {
    1: 5,
    9: 8,
    11: 4,
    3: 2,
    4: 7,
    6: 3,
    10: 9,
    7: 6,
    2: 1,
    12: 10,
    5: 12,
    8: 11,
  }

// Extract convex polyhedron data (vertices and faces) from the DodecahedronGeometry
const d12Verts = []
for (let i = 0; i < positionAttr.count; i++) {
  d12Verts.push([positionAttr.getX(i), positionAttr.getY(i), positionAttr.getZ(i)])
}

const d12Faces = [
  [8, 4, 14, 12, 0],
  [1, 9, 5, 15, 13],
  [2, 10, 6, 16, 12],
  [3, 11, 7, 17, 13],
  [4, 8, 0, 18, 6],
  [5, 9, 1, 19, 7],
  [18, 0, 12, 16, 6],
  [7, 19, 1, 13, 17],
  [2, 14, 4, 6, 10],
  [3, 15, 5, 7, 11],
  [2, 12, 14, 8, 10],
  [3, 13, 15, 9, 11]
];

d12Faces[0] = d12Faces[0].reverse();
d12Faces[1] = d12Faces[1].reverse();
d12Faces[6] = d12Faces[6].reverse();
d12Faces[10] = d12Faces[10].reverse();
d12Faces[7] = d12Faces[7].reverse();

const D12 = forwardRef(({ rotation, position }, ref) => {
  const originalFBX = useFBX('/assets/d12/d12.fbx')
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX])

  const [d12Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [d12Verts.map(([x,y,z]) => [x * scaleFactor, y * scaleFactor, z * scaleFactor]), d12Faces],
    position: position,
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
    friction: 0.6,
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.1
  }))

  useEffect(() => {
    // Compute bounding box to center the FBX
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
      }
    });
  
    const box = new THREE.Box3().setFromObject(fbx);
    const center = new THREE.Vector3();
    box.getCenter(center);
  
    fbx.position.sub(center); // FBX center is now at (0,0,0)

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: d12BaseColorMap,
          normalMap: d12NormalMap,
          roughnessMap: d12RoughnessMap,
          metalness: 0,
          roughness: 1,
          transparent: true,
          opacity: 1
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [fbx]);

  const logTopFace = () => {
    if (!d12Ref.current) return null
    const geom = d12Ref.current.geometry
    if (!geom) return null
  
    const posAttr = geom.attributes.position
    if (!posAttr) return null
  
    const idx = geom.index
    const normal = new THREE.Vector3()
    let topFaceIndex = -1
    let maxY = -Infinity
  
    d12Ref.current.updateMatrixWorld(true)
    const worldMatrix = d12Ref.current.matrixWorld
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix)
  
    const vA = new THREE.Vector3()
    const vB = new THREE.Vector3()
    const vC = new THREE.Vector3()
    const edge1 = new THREE.Vector3()
    const edge2 = new THREE.Vector3()
  
    const processFace = (a, b, c, faceIndex) => {
      vA.fromBufferAttribute(posAttr, a)
      vB.fromBufferAttribute(posAttr, b)
      vC.fromBufferAttribute(posAttr, c)
  
      edge1.subVectors(vB, vA)
      edge2.subVectors(vC, vA)
      normal.crossVectors(edge1, edge2).normalize()
  
      normal.applyMatrix3(normalMatrix).normalize()
  
      if (normal.y > maxY) {
        maxY = normal.y
        topFaceIndex = faceIndex
      }
    }
  
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = idx.array[i]
        const b = idx.array[i+1]
        const c = idx.array[i+2]
        processFace(a, b, c, i / 3)
      }
    } else {
      for (let i = 0; i < posAttr.count; i += 3) {
        processFace(i, i+1, i+2, i / 3)
      }
    }
  
    if (topFaceIndex === -1) {
      console.warn("No top face found for D12.")
      return null
    } else {
      // Map the triangulated face index to one of the 12 faces
      const topFaceValue = Math.floor(topFaceIndex / 3) + 1;
      return topFaceValue
    }
  }
  
  useImperativeHandle(ref, () => ({
    rollDice: () => {
      api.velocity.set(0,0,0)
      api.angularVelocity.set(0,0,0)
  
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
          const mappedValue = d12FaceMap[topFaceValue]
          console.log(`D12 Face: ${topFaceValue}, Shown: ${mappedValue}`)
          return mappedValue;
        }
      }, 2200)
    },
  }))

  return (
    <mesh ref={d12Ref} geometry={perfectD12Geometry} scale={[scaleFactor, scaleFactor, scaleFactor]} position={position}>
      {/* Green overlay to help align */}
      <meshStandardMaterial color="green" opacity={0.5} transparent={true} visible={false} />
      <group rotation={[0.25, 0.15, -1.05]}>
        <primitive object={fbx} scale={.7} />
      </group>
    </mesh>
  )
})

export default D12
