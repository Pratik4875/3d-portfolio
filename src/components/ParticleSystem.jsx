// src/components/ParticleSystem.jsx

import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'

function ParticleField(props) {
  const ref = useRef()
  const { viewport } = useThree()

  const [sphere] = useMemo(() => {
    const points = random.inSphere(new Float32Array(5000), { radius: 1.5 })
    return [points]
  }, [])

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10
    ref.current.rotation.y -= delta / 15
    // Make particles react to mouse movement
    if (state.pointer) {
      const { x, y } = state.pointer
      const targetX = (x * viewport.width) / 2
      const targetY = (y * viewport.height) / 2
      ref.current.rotation.y += (targetX - ref.current.rotation.y) * 0.02
      ref.current.rotation.x += (-targetY - ref.current.rotation.x) * 0.02
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#00ff00" size={0.015} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  )
}

export function ParticleSystem() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ParticleField />
    </Canvas>
  )
}
