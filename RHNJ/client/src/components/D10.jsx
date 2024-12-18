import React, { forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFBX } from '@react-three/drei'
import { useConvexPolyhedron } from '@react-three/cannon'

const D10 = forwardRef(({ rotation, position = [0, 0, 0] }, ref) => {
  const originalFBX = useFBX('/assets/d10/d10.fbx')
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX])
  
  let d10Mesh = null
  fbx.traverse((child) => {
    if (child.isMesh) {
      d10Mesh = child
    }
  })

  const d10BaseColorMap = new THREE.TextureLoader().load('/assets/d20/dice-basecolors.jpeg')
  const d10NormalMap = new THREE.TextureLoader().load('/assets/d20/dice-normal.jpeg')
  const d10RoughnessMap = new THREE.TextureLoader().load('/assets/d20/dice-roughness.jpeg')

  useEffect(() => {
    if (!d10Mesh) return
    
    // Compute bounding box before transformations
    d10Mesh.geometry.computeBoundingBox()
    let box = new THREE.Box3().setFromObject(d10Mesh)
    let center = new THREE.Vector3()
    box.getCenter(center)

    // Center the FBX so its centroid is at the origin
    fbx.position.sub(center)

    // Recompute bounding box after centering
    box.setFromObject(d10Mesh)
    let minY = box.min.y

    // If bottom isn't at y=0, shift it so minY=0
    if (minY !== 0) {
      fbx.position.y -= minY
    }

    // Log values to debug
    console.log('D10 Bounding Box after centering:', box)
    console.log('Center:', center.toArray())
    console.log('minY before lifting:', minY)

    // Recalculate after lifting to ensure minY=0 now
    box.setFromObject(d10Mesh)
    console.log('D10 Bounding Box after lifting:', box)
    console.log('New minY:', box.min.y, ' (should be 0)')

    d10Mesh.material = new THREE.MeshStandardMaterial({
      map: d10BaseColorMap,
      normalMap: d10NormalMap,
      roughnessMap: d10RoughnessMap,
      metalness: 0,
      roughness: 1,
      transparent: true,
      opacity: 1
    })

    d10Mesh.castShadow = true
    d10Mesh.receiveShadow = true
  }, [fbx, d10Mesh, d10BaseColorMap, d10NormalMap, d10RoughnessMap])

  // If no mesh yet, return null
  if (!d10Mesh) return null

  // Update matrix world to "bake" current transformations
  d10Mesh.updateMatrixWorld(true)

  // Clone geometry and apply all transformations
  const transformedGeometry = d10Mesh.geometry.clone()
  transformedGeometry.applyMatrix4(d10Mesh.matrixWorld)

  // We'll scale both visually and physically
  const scaleFactor = 0.2

  const posAttr = transformedGeometry.attributes.position
  const geometryIndex = transformedGeometry.index
  const vertices = []
  const faces = []

  // Extract scaled vertices
  for (let i = 0; i < posAttr.count; i++) {
    vertices.push([
      posAttr.getX(i) * scaleFactor,
      posAttr.getY(i) * scaleFactor,
      posAttr.getZ(i) * scaleFactor
    ])
  }

  // Construct faces
  if (geometryIndex && geometryIndex.count > 0) {
    for (let i = 0; i < geometryIndex.count; i += 3) {
      faces.push([
        geometryIndex.array[i],
        geometryIndex.array[i + 1],
        geometryIndex.array[i + 2]
      ])
    }
  } else {
    // If there's no index, every 3 vertices form a face
    for (let i = 0; i < posAttr.count; i += 3) {
      faces.push([i, i+1, i+2])
    }
  }

  // Log to debug
  console.log('Sample of scaled vertices:', vertices.slice(0, 5))
  console.log('Number of vertices:', vertices.length)
  console.log('Number of faces:', faces.length)

  // Create physics body
  const [d10Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [vertices, faces],
    position: position,
    friction: 0.6,
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.1
  }))

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
    }
  }))

  return (
    <mesh ref={d10Ref}  scale={[scaleFactor, scaleFactor, scaleFactor]}>
      <primitive object={fbx} />
    </mesh>
  )
})

export default D10
