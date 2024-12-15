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
// Similar to how we did for D20, but now for D12.
// Dodecahedron has 20 vertices and 12 faces, each face is a pentagon divided into triangles.
// But THREE's geometry will be triangulated. We can just rely on index and attribute position.
const positionAttr = perfectD12Geometry.attributes.position
const indexAttr = perfectD12Geometry.index

// Face values for a D12 (1 through 12)
const d12FaceValues = Array.from({ length: 12 }, (_, i) => i + 1)

// For simplicity, we can map the face index directly to a face value.
// If you have a custom mapping, define it here. For now, let's assume direct mapping:
const d12FaceMap = {}
d12FaceValues.forEach((val) => {
  d12FaceMap[val] = val // Identity mapping, adjust if you have a custom mapping
})

// Similar scale factor and physics args as D20, you may adjust as needed
const scaleFactor = 0.2

// Extract convex polyhedron data (vertices and faces) from the DodecahedronGeometry
// We'll get unique vertices from the position attribute
const d12Verts = []
for (let i = 0; i < positionAttr.count; i++) {
  d12Verts.push([positionAttr.getX(i), positionAttr.getY(i), positionAttr.getZ(i)])
}

// We get faces (groups of three indices) from the index
const d12Faces = []
for (let i = 0; i < indexAttr?.count; i += 3) {
  d12Faces.push([indexAttr.array[i], indexAttr.array[i+1], indexAttr.array[i+2]])
}

const D12 = forwardRef(({ diceType, rotation, position = [0,0,0] },ref) => {
  const originalFBX = useFBX('/assets/d12/d12.fbx')
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX])

  const [d12Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [d12Verts.map(([x,y,z]) => [x * scaleFactor, y * scaleFactor, z * scaleFactor]), d12Faces],
    position: [0,0,0],
    friction: 0.6,
    
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.1
  }))

  useEffect(() => {
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
      }
    });
  
    const box = new THREE.Box3().setFromObject(fbx);
    const center = new THREE.Vector3();
    box.getCenter(center);
  
    fbx.position.sub(center); // Now the FBX center is at (0,0,0)

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
      const topFaceValue = d12FaceValues[topFaceIndex]
      return topFaceValue
    }
  }

  useImperativeHandle(ref, () => ({
    rollDice: () => {
      // Impulse only, no reset
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
          let mappedValue
          if (diceType === '12') {
            mappedValue = d12FaceMap[topFaceValue]
            console.log(`D12 Face: ${topFaceValue}, Shown: ${mappedValue}`)
          } else if (diceType === '20') {
            mappedValue = d20FaceMap[topFaceValue]
            console.log(`D20 Face: ${topFaceValue}, Shown: ${mappedValue}`)
          }
          // Add more conditions if you have more dice types
        }
      }, 2200)
    },
  }))

  return (
    <mesh ref={d12Ref} geometry={perfectD12Geometry} scale={[scaleFactor, scaleFactor, scaleFactor]}>
      {/* Green overlay to help align */}
      <meshStandardMaterial color="green" opacity={0.5} transparent={true} visible={true} />
      <group rotation={[0.25, 0.15, -1.05]}>
        <primitive object={fbx} scale={.9} />
      </group>
    </mesh>
  )
})

export default D12
