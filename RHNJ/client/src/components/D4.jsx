import React, { forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFBX } from '@react-three/drei'
import { useConvexPolyhedron } from '@react-three/cannon'

// Load your D4 textures
const d4BaseColorMap = new THREE.TextureLoader().load('/assets/d20/dice-basecolors.jpeg')
const d4NormalMap = new THREE.TextureLoader().load('/assets/d20/dice-normal.jpeg')
const d4RoughnessMap = new THREE.TextureLoader().load('/assets/d20/dice-roughness.jpeg')
const scaleFactor = 0.2

const D4 = forwardRef(({ rotation, position }, ref) => {
  const geometry = new THREE.TetrahedronGeometry(1, 0).toNonIndexed()
  geometry.computeBoundingBox()


  const d4Center = new THREE.Vector3()
  geometry.boundingBox.getCenter(d4Center)
  geometry.translate(-d4Center.x, -d4Center.y, -d4Center.z)

  const positionAttr = geometry.attributes.position


  const epsilon = 1e-6
  const uniqueCorners = []
  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i)
    const y = positionAttr.getY(i)
    const z = positionAttr.getZ(i)

    let found = false
    for (const c of uniqueCorners) {
      if (
        Math.abs(c[0] - x) < epsilon &&
        Math.abs(c[1] - y) < epsilon &&
        Math.abs(c[2] - z) < epsilon
      ) {
        found = true
        break
      }
    }
    if (!found) {
      uniqueCorners.push([x, y, z])
    }
  }

  const d4Verts = []
  for (let i = 0; i < positionAttr.count; i++) {
    d4Verts.push([
      positionAttr.getX(i),
      positionAttr.getY(i),
      positionAttr.getZ(i),
    ])
  }
  const d4Faces = []
  for (let i = 0; i < positionAttr.count; i += 3) {
    d4Faces.push([i, i + 1, i + 2])
  }

  
const originalFBX = useFBX('/assets/d4/d4.fbx')
const fbx = useMemo(() => originalFBX.clone(), [originalFBX])


  
  const [d4Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [
      // Scale each vertex so physics shape matches your desired size
      d4Verts.map(([x, y, z]) => [x * scaleFactor, y * scaleFactor, z * scaleFactor]),
      d4Faces,
    ],
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
    position,
    friction: 0.6,
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.1,
  }))

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

    // Apply your textures
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: d4BaseColorMap,
          normalMap: d4NormalMap,
          roughnessMap: d4RoughnessMap,
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

  const d4CornerMap = {
    0: 4,
    1: 2,
    2: 3,
    3: 1,
  }

  const getTopCornerValue = () => {
    if (!d4Ref.current) return null

    const worldMatrix = d4Ref.current.matrixWorld
    const localPos = new THREE.Vector3()
    const worldPos = new THREE.Vector3()

    let highestY = -Infinity
    let topCornerIndex = -1

    uniqueCorners.forEach(([x, y, z], idx) => {
      localPos.set(x, y, z)
      worldPos.copy(localPos).applyMatrix4(worldMatrix)
      if (worldPos.y > highestY) {
        highestY = worldPos.y
        topCornerIndex = idx
      }
    })

    if (topCornerIndex === -1) {
      console.warn('No top corner found for d4.')
      return null
    }
    return d4CornerMap[topCornerIndex]
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
        const topCornerValue = getTopCornerValue()
        if (topCornerValue != null) {
          console.log(`D4 corner result: ${topCornerValue}`)
          return topCornerValue
        }
      }, 2200)
    },
  }))

  return (
    <mesh ref={d4Ref} geometry={geometry} scale={[scaleFactor, scaleFactor, scaleFactor]} position={position}>
      {/* Green debug material, set visible={false} if you don't want to see it */}
      <meshStandardMaterial color="green" opacity={0.35}visible={false} />
      
        <group rotation={[-0.8, 0.95, -1.6]} position={[0.35, 0, 0]}>
        <primitive object={fbx} scale={1} />
      </group>
    </mesh>
  )
})

export default D4

    