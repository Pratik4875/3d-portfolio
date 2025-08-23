// src/components/InteractiveCard.jsx

import * as THREE from 'three'
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture, Html, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

extend({ MeshLineGeometry, MeshLineMaterial })

// Preload assets for better performance
useGLTF.preload('/models/devcard.glb')
useTexture.preload('/band.png')

/**
 * CardContent component renders the 2D HTML content on the card.
 */
function CardContent() {
  return (
    <div className="w-[330px] h-[490px] p-6 flex flex-col items-center font-mono text-white select-none bg-black bg-opacity-50 rounded-3xl">
      <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-green-400 mt-10 shadow-lg">
        <img src="/pratik-photo.jpg" alt="Pratik Kadam" className="w-full h-full object-cover" />
      </div>
      <h2 className="text-3xl font-bold mt-8">Pratik Kadam</h2>
      <p className="text-green-400 text-md text-center">// R&D Electronics Engineer</p>
      <div className="mt-auto mb-4">
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://www.linkedin.com/in/pratik-kadam-robotics" 
          alt="QR Code for LinkedIn Profile" 
          className="bg-white p-1 rounded-md" 
        />
      </div>
    </div>
  )
}

/**
 * Band component sets up the physics for the card and the elastic band.
 */
function Band({ maxSpeed = 50, minSpeed = 10 }) {
  // Refs for the different parts of the physics simulation
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef()
  
  // Reusable vectors to avoid creating new ones in the render loop
  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  
  // Common properties for the rigid body segments
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 }
  
  // Load the 3D model and texture
  const { nodes, materials } = useGLTF('/models/devcard.glb')
  const texture = useTexture('/band.png')
  
  const { width, height } = useThree((state) => state.size)
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]))
  
  // State for drag and hover interactions
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  // Setup physics joints
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

  // Handle cursor style based on interaction state
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => void (document.body.style.cursor = 'auto')
    }
  }, [hovered, dragged])

  // This frame loop runs 60 times a second, updating the physics and visuals
  useFrame((state, delta) => {
    if (dragged) {
      // Move the card based on pointer position when dragged
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }
    if (fixed.current) {
      // Smoothly interpolate the band's curve points for a more natural look
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
      })
      
      // Update the CatmullRomCurve points to draw the band
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32))
      
      // Stabilize the card's rotation
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  // Configure the curve and texture properties
  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        {/* Physics bodies for the band segments and the card */}
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.08]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}>
            {/* The 3D model of the card */}
            <mesh geometry={nodes.card.geometry}>
              <meshStandardMaterial transparent opacity={0} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            {/* The HTML content is projected onto the card */}
            <Html transform occlude position={[0, 0.01, 0.05]} scale={0.235} rotation={[0, Math.PI, 0]}>
              <CardContent />
            </Html>
          </group>
        </RigidBody>
      </group>
      {/* The visual representation of the elastic band */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={[width, height]} useMap map={texture} repeat={[-3, 1]} lineWidth={1} />
      </mesh>
    </>
  )
}

/**
 * The main export component that sets up the R3F Canvas and the scene.
 */
export function InteractiveCardCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 35], fov: 25 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={Math.PI} />
        {/* Physics component wraps everything that should be affected by physics */}
        <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
          <Band />
        </Physics>
        {/* Environment for lighting and background */}
        <Environment background blur={0.75}>
          <color attach="background" args={['black']} />
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  )
}
