'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedOrb() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.2
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.5}>
      <MeshDistortMaterial 
        color="#d2bbff" 
        attach="material" 
        distort={0.4} 
        speed={2} 
        roughness={0.2}
        metalness={0.8}
        emissive="#3f008e"
        emissiveIntensity={0.5}
      />
    </Sphere>
  )
}

export function AiOrb() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedOrb />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
