import React, { forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFBX } from '@react-three/drei'
import { useConvexPolyhedron } from '@react-three/cannon'

const d8BaseColorMap = new THREE.TextureLoader().load('/assets/d20/dice-basecolors.jpeg')
const d8NormalMap = new THREE.TextureLoader().load('/assets/d20/dice-normal.jpeg')
const d8RoughnessMap = new THREE.TextureLoader().load('/assets/d20/dice-roughness.jpeg')

// If you want to map the top face index to [1..8], you can do something like:
const faceValues = [5, 2, 7, 4, 1, 9, 3, 8]


const D8 = forwardRef(({  position }, ref) => {
  // 1) Build *fresh* geometry for this instance
  const octaGeo = useMemo(() => {
    // Create & center the octahedron
    const geo = new THREE.OctahedronGeometry(1, 0)
    geo.computeBoundingBox()
    const center = new THREE.Vector3()
    geo.boundingBox.getCenter(center)
    geo.translate(-center.x, -center.y, -center.z)
    
    // Convert to non-indexed so faces are straightforward
    return geo.toNonIndexed()
  }, [])

  // 2) Extract vertices/faces for Cannon
  const { d8Verts, d8Faces } = useMemo(() => {
    const posAttr = octaGeo.attributes.position
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
    return { d8Verts: verts, d8Faces: faces }
  }, [octaGeo])

  // 3) Load and clone your D8 FBX for the *visuals*
  const originalFBX = useFBX('/assets/d8/d8.fbx')
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX])

  // 4) Create a physics body using *this instance's* geometry
  const scaleFactor = 0.2
  const [d8Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [
      d8Verts.map(([x, y, z]) => [x * scaleFactor, y * scaleFactor, z * scaleFactor]),
      d8Faces,
    ],
    position,
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
    friction: 0.6,
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.1,
  }))

  // 5) Center the FBX so it lines up with our geometry
  useEffect(() => {
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox()
      }
    })
    const box = new THREE.Box3().setFromObject(fbx)
    const center = new THREE.Vector3()
    box.getCenter(center)
    fbx.position.sub(center)

    // Apply textures
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: d8BaseColorMap,
          normalMap: d8NormalMap,
          roughnessMap: d8RoughnessMap,
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

  // 6) Example top-face detection (optional)
  const findTopFace = () => {
    if (!d8Ref.current) return null
    const geom = d8Ref.current.geometry
    if (!geom) return null

    const posAttr = geom.attributes.position
    if (!posAttr) return null

    const idx = geom.index
    let maxY = -Infinity
    let topFaceIndex = -1

    d8Ref.current.updateMatrixWorld(true)
    const worldMatrix = d8Ref.current.matrixWorld
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix)

    const vA = new THREE.Vector3()
    const vB = new THREE.Vector3()
    const vC = new THREE.Vector3()
    const edge1 = new THREE.Vector3()
    const edge2 = new THREE.Vector3()
    const faceNormal = new THREE.Vector3()

    const processFace = (a, b, c, faceIdx) => {
      vA.fromBufferAttribute(posAttr, a)
      vB.fromBufferAttribute(posAttr, b)
      vC.fromBufferAttribute(posAttr, c)

      edge1.subVectors(vB, vA)
      edge2.subVectors(vC, vA)
      faceNormal.crossVectors(edge1, edge2).normalize()

      faceNormal.applyMatrix3(normalMatrix).normalize()
      if (faceNormal.y > maxY) {
        maxY = faceNormal.y
        topFaceIndex = faceIdx
      }
    }

    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        processFace(idx.array[i], idx.array[i + 1], idx.array[i + 2], i / 3)
      }
    } else {
      for (let i = 0; i < posAttr.count; i += 3) {
        processFace(i, i + 1, i + 2, i / 3)
      }
    }

    if (topFaceIndex === -1) {
      return null
    }
    // Map the face index to some "face value" if you want
    return faceValues[topFaceIndex % faceValues.length]
  }

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
          console.log(`D8 landed on face: ${val}`)
        }
      }, 2200)
    },
  }))

  return (
    <mesh
      ref={d8Ref}
      geometry={octaGeo}
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      position={position}
    >
      <meshStandardMaterial color="green" opacity={0.35} transparent visible={false} />
      <group rotation={[3.1, -6.80, -3.00]}>
        <primitive object={fbx} scale={0.7} />
      </group>
    </mesh>
  )
})

export default D8
