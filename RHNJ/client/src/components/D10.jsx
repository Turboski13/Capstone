import React, { forwardRef, useRef, useImperativeHandle, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFBX } from '@react-three/drei'
import { useConvexPolyhedron } from '@react-three/cannon'

// Load your D10 textures
const d10BaseColorMap = new THREE.TextureLoader().load('/assets/d10/dice-basecolors.jpeg')
const d10NormalMap = new THREE.TextureLoader().load('/assets/d10/dice-normal.jpeg')
const d10RoughnessMap = new THREE.TextureLoader().load('/assets/d10/dice-roughness.jpeg')

const scaleFactor = 0.2

// Define the D10 vertices and faces FIRST
const d10Verts = [
  [1,      0,      0.5],  
  [0.309,  0.951,  0.5],  
  [-0.809, 0.588,  0.5],  
  [-0.809,-0.588,  0.5],  
  [0.309, -0.951,  0.5], 
  [0.809,  0.588, -0.5], 
  [-0.309, 0.951, -0.5], 
  [-1,     0,     -0.5], 
  [-0.309,-0.951, -0.5], 
  [0.809, -0.588, -0.5]   
];

let d10Faces = [
  [0, 1, 6, 5],
  [1, 2, 7, 6],
  [2, 3, 8, 7],
  [3, 4, 9, 8],
  [4, 0, 5, 9],
 
  [0, 4, 8, 5],
  [1, 0, 9, 6],
  [2, 1, 5, 7],
  [3, 2, 6, 8],
  [4, 3, 7, 9]
];

// If needed, define a mapping (once you know it)
// For now, just pass through the values or define a simple map
const d10FaceMap = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10
};

// Now create the geometry AFTER d10Verts and d10Faces are defined
const d10Geometry = new THREE.BufferGeometry();
const verticesArray = new Float32Array(d10Verts.length * 3);
d10Verts.forEach((v, i) => {
  verticesArray[i*3] = v[0];
  verticesArray[i*3+1] = v[1];
  verticesArray[i*3+2] = v[2];
});
d10Geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

const indices = [];
for (let face of d10Faces) {
  const [a,b,c,d] = face;
  // Create two triangles (a,b,c) and (a,c,d)
  indices.push(a, b, c, a, c, d);
}
d10Geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
d10Geometry.computeVertexNormals();

const D10 = forwardRef(({ rotation, position }, ref) => {
  const originalFBX = useFBX('/assets/d10/d10.fbx')
  const fbx = useMemo(() => originalFBX.clone(), [originalFBX])

  const [d10Ref, api] = useConvexPolyhedron(() => ({
    mass: 0.5,
    args: [d10Verts, d10Faces], // No scaling here since we scaled visually below if needed
    position: position,
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
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
  
    fbx.position.sub(center);

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: d10BaseColorMap,
          normalMap: d10NormalMap,
          roughnessMap: d10RoughnessMap,
          metalness: 0,
          roughness: 1,
          transparent: true,
          opacity: 0.5
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [fbx]);

  const logTopFace = () => {
    if (!d10Ref.current) return null
    const geom = d10Ref.current.geometry
    if (!geom) return null

    const posAttr = geom.attributes.position
    if (!posAttr) return null

    const idx = geom.index
    const normal = new THREE.Vector3()
    let topFaceIndex = -1
    let maxY = -Infinity

    d10Ref.current.updateMatrixWorld(true)
    const worldMatrix = d10Ref.current.matrixWorld
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
      console.warn("No top face found for d10.")
      return null
    } else {
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
          const mappedValue = d10FaceMap[topFaceValue]
          console.log(`d10 Face: ${topFaceValue}, Shown: ${mappedValue}`)
        }
      }, 2200)
    },
  }))

  return (
    <mesh ref={d10Ref} geometry={d10Geometry} position={position}>
      <meshStandardMaterial color="green" opacity={0.5} transparent={true} visible={true} />
      <group rotation={[0.25, 0.15, -1.05]}>
        <primitive object={fbx} scale={0.6} />
      </group>
    </mesh>
  )
})

export default D10
