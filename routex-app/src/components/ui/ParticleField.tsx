'use client'
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 1500 }) {
  const mesh = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    // Standard seeded random to maintain React 19 purity (idempotency)
    let seed = 123;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (random() - 0.5) * 50;
      temp[i * 3 + 1] = (random() - 0.5) * 50;
      temp[i * 3 + 2] = (random() - 0.5) * 50;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.y = time * 0.05;
    mesh.current.rotation.x = time * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#00f1fe"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function ParticleField() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={['#0b0e11']} />
        <ambientLight intensity={0.5} />
        <Particles />
      </Canvas>
    </div>
  );
}
