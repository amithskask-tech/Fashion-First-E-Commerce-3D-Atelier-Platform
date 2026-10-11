import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BodyMeasurements } from '../../types';

interface AvatarViewerProps {
  measurements: BodyMeasurements;
  visible?: boolean;
}

/**
 * 3D Anatomical Mannequin Avatar.
 * Applies controlled proportional scaling derived from customer body measurements.
 * Kept strictly decoupled from garment rendering.
 */
export const AvatarViewer: React.FC<AvatarViewerProps> = ({
  measurements,
  visible = true
}) => {
  if (!visible) return null;

  // Compute normalized proportional scale factors against 180cm / 78kg baseline
  const scales = useMemo(() => {
    const heightScale = measurements.heightMm ? measurements.heightMm / 1800 : 1;
    const shoulderScale = measurements.shoulderWidthMm ? measurements.shoulderWidthMm / 465 : 1;
    const chestScale = measurements.chestCircMm ? measurements.chestCircMm / 1010 : 1;
    const waistScale = measurements.waistCircMm ? measurements.waistCircMm / 860 : 1;
    const armScale = measurements.sleeveLengthMm ? measurements.sleeveLengthMm / 840 : 1;

    return {
      heightScale: Math.max(0.85, Math.min(1.25, heightScale)),
      shoulderScale: Math.max(0.85, Math.min(1.25, shoulderScale)),
      chestScale: Math.max(0.85, Math.min(1.3, chestScale)),
      waistScale: Math.max(0.85, Math.min(1.3, waistScale)),
      armScale: Math.max(0.85, Math.min(1.25, armScale))
    };
  }, [measurements]);

  const mannequinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#64748b', // Slate 500 matte mannequin
        roughness: 0.65,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      }),
    []
  );

  return (
    <group position={[0, -0.6 * scales.heightScale, 0]}>
      {/* Head & Neck */}
      <mesh position={[0, 1.45 * scales.heightScale, 0]} material={mannequinMaterial}>
        <sphereGeometry args={[0.13, 32, 32]} />
      </mesh>
      <mesh position={[0, 1.25 * scales.heightScale, 0]} material={mannequinMaterial}>
        <cylinderGeometry args={[0.065, 0.08, 0.16 * scales.heightScale, 24]} />
      </mesh>

      {/* Torso: Shoulders & Upper Chest */}
      <mesh
        position={[0, 1.05 * scales.heightScale, 0]}
        scale={[scales.shoulderScale, scales.heightScale, scales.chestScale]}
        material={mannequinMaterial}
      >
        <boxGeometry args={[0.42, 0.28, 0.22]} />
      </mesh>

      {/* Mid Torso & Waist */}
      <mesh
        position={[0, 0.78 * scales.heightScale, 0]}
        scale={[scales.waistScale, scales.heightScale, scales.waistScale]}
        material={mannequinMaterial}
      >
        <cylinderGeometry args={[0.18, 0.16, 0.32 * scales.heightScale, 24]} />
      </mesh>

      {/* Pelvis / Hips */}
      <mesh
        position={[0, 0.52 * scales.heightScale, 0]}
        scale={[scales.waistScale * 1.05, scales.heightScale, scales.waistScale * 1.05]}
        material={mannequinMaterial}
      >
        <cylinderGeometry args={[0.16, 0.19, 0.22 * scales.heightScale, 24]} />
      </mesh>

      {/* Left Arm */}
      <group position={[0.24 * scales.shoulderScale, 1.12 * scales.heightScale, 0]}>
        {/* Shoulder Joint */}
        <mesh material={mannequinMaterial}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Bicep & Forearm */}
        <mesh
          position={[0.06, -0.32 * scales.armScale, 0]}
          rotation={[0, 0, -0.15]}
          material={mannequinMaterial}
        >
          <cylinderGeometry args={[0.05, 0.038, 0.6 * scales.armScale, 16]} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[-0.24 * scales.shoulderScale, 1.12 * scales.heightScale, 0]}>
        {/* Shoulder Joint */}
        <mesh material={mannequinMaterial}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Bicep & Forearm */}
        <mesh
          position={[-0.06, -0.32 * scales.armScale, 0]}
          rotation={[0, 0, 0.15]}
          material={mannequinMaterial}
        >
          <cylinderGeometry args={[0.05, 0.038, 0.6 * scales.armScale, 16]} />
        </mesh>
      </group>

      {/* Legs (Base stand) */}
      <mesh position={[0.1, 0.18 * scales.heightScale, 0]} material={mannequinMaterial}>
        <cylinderGeometry args={[0.075, 0.06, 0.5 * scales.heightScale, 16]} />
      </mesh>
      <mesh position={[-0.1, 0.18 * scales.heightScale, 0]} material={mannequinMaterial}>
        <cylinderGeometry args={[0.075, 0.06, 0.5 * scales.heightScale, 16]} />
      </mesh>
    </group>
  );
};
