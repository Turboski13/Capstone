import React, { forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFBX } from '@react-three/drei'
import { useConvexPolyhedron } from '@react-three/cannon'

// Load your textures
const d6BaseColorMap = new THREE.TextureLoader().load('/assets/d20/dice-basecolors.jpeg')
const d6NormalMap = new THREE.TextureLoader().load('/assets/d20/dice-normal.jpeg')
const d6RoughnessMap = new THREE.TextureLoader().load('/assets/d20/dice-roughness.jpeg')

// A lookup that maps each triangle index (0..11) → a d6 face (1..6)
// Tweak these numbers until it visually matches the actual top face
const triangleToFaceMap = {
  0: 5,
  1: 5,
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 4,
  7: 4,
  8: 1,
  9: 1,
  10: 6,
  11: 6,
}

const D6 = forwardRef(({ rotation, position }, ref) => {
  const boxGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.computeBoundingBox()
    const center = new THREE.Vector3()
    geo.boundingBox.getCenter(center)
    geo.translate(-center.x, -center.y, -center.z)
    return geo.toNonIndexed()
  }, [])

  const { d6Verts, d6Faces } = useMemo(() => {
    const posAttr = boxGeo.attributes.position
    const verts = []
    for (let i = 0; i < posAttr.count; i++) {
      verts.push([
        posAttr.getX(i),
        posAttr.getY(i),
        posAttr.getZ(i),
      ])
    }
    const faces = []
    for (let i = 0; i < posAttr.count; i += 3) {
      faces.push([i, i + 1, i + 2])
    }
    return { d6Verts: verts, d6Faces: faces }
  }, [boxGeo])

  // Load FBX for visuals
  const originalFBX = useFBX('/assets/d6/d6.fbx')
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX])

  // Create Cannon shape
  const scaleFactor = 0.2
  const [d6Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [
      d6Verts.map(([x, y, z]) => [x * scaleFactor, y * scaleFactor, z * scaleFactor]),
      d6Faces,
    ],
    position,
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
    friction: 0.6,
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.1,
  }))

  // Center the FBX
  useEffect(() => {
    fbx.traverse((child) => {
      if (child.isMesh) child.geometry.computeBoundingBox()
    })
    const box = new THREE.Box3().setFromObject(fbx)
    const center = new THREE.Vector3()
    box.getCenter(center)
    fbx.position.sub(center)

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: d6BaseColorMap,
          normalMap: d6NormalMap,
          roughnessMap: d6RoughnessMap,
          metalness: 0,
          roughness: 1,
          transparent: true,
          opacity: 1,
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [fbx])

  // Face detection
  const findTopFace = () => {
    if (!d6Ref.current) return null
    const geom = d6Ref.current.geometry
    if (!geom) return null

    const posAttr = geom.attributes.position
    if (!posAttr) return null

    let maxY = -Infinity
    let topFaceIndex = -1

    d6Ref.current.updateMatrixWorld(true)
    const worldMatrix = d6Ref.current.matrixWorld
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix)

    const vA = new THREE.Vector3()
    const vB = new THREE.Vector3()
    const vC = new THREE.Vector3()
    const edge1 = new THREE.Vector3()
    const edge2 = new THREE.Vector3()
    const faceNormal = new THREE.Vector3()

    // We'll read the positions in groups of 3
    for (let i = 0; i < posAttr.count; i += 3) {
      vA.fromBufferAttribute(posAttr, i)
      vB.fromBufferAttribute(posAttr, i + 1)
      vC.fromBufferAttribute(posAttr, i + 2)

      edge1.subVectors(vB, vA)
      edge2.subVectors(vC, vA)
      faceNormal.crossVectors(edge1, edge2).normalize()

      faceNormal.applyMatrix3(normalMatrix).normalize()

      if (faceNormal.y > maxY) {
        maxY = faceNormal.y
        topFaceIndex = i / 3
      }
    }

    if (topFaceIndex === -1) {
      console.warn('No top face found for d6.')
      return null
    }
    // topFaceIndex is a *triangle* index 0..11
    return triangleToFaceMap[topFaceIndex]
  }

  // Expose rollDice
  useImperativeHandle(ref, () => ({
    rollDice: () => {
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
        const val = findTopFace()
        if (val != null) {
          console.log(`D6 landed on face: ${val}`)
          return val
        }
      }, 2200)
    },
  }))

  return (
    <mesh
      ref={d6Ref}
      geometry={boxGeo}
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      position={position}
    >
      <meshStandardMaterial color="green" opacity={0.35} transparent visible={false} />
      <group rotation={[0.3, -1.55, -1.25]}>
        <primitive object={fbx} scale={0.7} />
      </group>
    </mesh>
  )
})

export default D6
