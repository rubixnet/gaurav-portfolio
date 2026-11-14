'use client';

import * as THREE from 'three';
import { createContext } from 'react';

export type V3 = [number, number, number];
export const ReducedMotionContext = createContext(false);

export function Box({
  position, size, color, rotation, roughness = 0.9, metalness = 0, castShadow = true,
  receiveShadow = true, materialSide,
}: {
  position: V3; size: V3; color: THREE.ColorRepresentation; rotation?: V3;
  roughness?: number; metalness?: number; castShadow?: boolean; receiveShadow?: boolean;
  materialSide?: THREE.Side;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} flatShading side={materialSide} />
    </mesh>
  );
}
