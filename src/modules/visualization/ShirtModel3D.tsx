import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  Fabric,
  CustomizationOption,
  FinishedGarmentMeasurements
} from '../../types';
import { createFabricTexture } from './fabricTextures';

interface ShirtModel3DProps {
  fabric: Fabric;
  selectedOptions: Record<string, CustomizationOption>;
  garmentMeasurements?: FinishedGarmentMeasurements;
}

export const ShirtModel3D: React.FC<ShirtModel3DProps> = ({
  fabric,
  selectedOptions,
  garmentMeasurements
}) => {
  // 1. Procedural PBR Fabric Material
  const fabricMaterial = useMemo(() => {
    const textures = createFabricTexture(fabric.weaveType, fabric.colorHex);
    return new THREE.MeshStandardMaterial({
      map: textures.map,
      bumpMap: textures.bumpMap,
      bumpScale: 0.05,
      roughness: fabric.weaveType.toLowerCase().includes('linen') ? 0.85 : 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
  }, [fabric.weaveType, fabric.colorHex]);

  // 2. Button Material
  const buttonMaterial = useMemo(() => {
    const btnCode = selectedOptions.buttons?.code;
    if (btnCode === 'button_horn_smoke') {
      return new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.3, metalness: 0.2 });
    }
    if (btnCode === 'button_mother_pearl') {
      return new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2, metalness: 0.4 });
    }
    return new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4, metalness: 0.1 });
  }, [selectedOptions.buttons?.code]);

  // Proportional scale relative to standard M shirt
  const torsoScale = useMemo(() => {
    if (!garmentMeasurements) return { x: 1, y: 1, z: 1 };
    const x = garmentMeasurements.chestMm / 1100;
    const y = garmentMeasurements.shirtLengthMm / 780;
    const z = garmentMeasurements.chestMm / 1100;
    return { x, y, z };
  }, [garmentMeasurements]);

  const collarCode = selectedOptions.collar?.code || 'collar_spread';
  const sleeveCode = selectedOptions.sleeve?.code || 'sleeve_long';
  const cuffCode = selectedOptions.cuff?.code || 'cuff_barrel';
  const placketCode = selectedOptions.placket?.code || 'placket_front';
  const pocketCode = selectedOptions.pocket?.code || 'pocket_none';
  const hemCode = selectedOptions.hem?.code || 'hem_curved';

  const isShortSleeve = sleeveCode === 'sleeve_short';
  const hasPocket = pocketCode === 'pocket_single_chest';

  return (
    <group position={[0, -0.6 * torsoScale.y, 0]}>
      {/* ================= MAIN SHIRT TORSO ================= */}
      {/* Front & Back Torso Shell */}
      <mesh
        position={[0, 0.9 * torsoScale.y, 0]}
        scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
        material={fabricMaterial}
      >
        <cylinderGeometry args={[0.22, 0.21, 0.65, 32, 1, true]} />
      </mesh>

      {/* Shoulder Yoke */}
      <mesh
        position={[0, 1.22 * torsoScale.y, 0]}
        scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
        material={fabricMaterial}
      >
        <cylinderGeometry args={[0.14, 0.22, 0.1, 32]} />
      </mesh>

      {/* ================= HEMLINE ================= */}
      {hemCode === 'hem_curved' ? (
        // Curved Tails (Front & Rear scoop)
        <group position={[0, 0.54 * torsoScale.y, 0]}>
          <mesh
            position={[0, 0, 0.08]}
            rotation={[0.3, 0, 0]}
            scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
            material={fabricMaterial}
          >
            <cylinderGeometry args={[0.21, 0.19, 0.12, 16, 1, true, 0, Math.PI]} />
          </mesh>
          <mesh
            position={[0, 0, -0.08]}
            rotation={[-0.3, 0, 0]}
            scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
            material={fabricMaterial}
          >
            <cylinderGeometry args={[0.21, 0.19, 0.12, 16, 1, true, Math.PI, Math.PI]} />
          </mesh>
        </group>
      ) : (
        // Straight Hem
        <mesh
          position={[0, 0.55 * torsoScale.y, 0]}
          scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
          material={fabricMaterial}
        >
          <cylinderGeometry args={[0.21, 0.21, 0.06, 32, 1, true]} />
        </mesh>
      )}

      {/* ================= FRONT PLACKET ================= */}
      <mesh
        position={[0, 0.9 * torsoScale.y, 0.215 * torsoScale.z]}
        scale={[1, torsoScale.y, 1]}
        material={fabricMaterial}
      >
        <boxGeometry args={[0.045, 0.65, 0.008]} />
      </mesh>

      {/* Front Placket Buttons (Hidden if fly front concealed) */}
      {placketCode !== 'placket_concealed' && (
        <group>
          {[0.65, 0.77, 0.89, 1.01, 1.13].map((yOffset, i) => (
            <mesh
              key={i}
              position={[0, yOffset * torsoScale.y, 0.222 * torsoScale.z]}
              rotation={[Math.PI / 2, 0, 0]}
              material={buttonMaterial}
            >
              <cylinderGeometry args={[0.009, 0.009, 0.004, 16]} />
            </mesh>
          ))}
        </group>
      )}

      {/* Fly Front Concealed Flap */}
      {placketCode === 'placket_concealed' && (
        <mesh
          position={[0.008, 0.9 * torsoScale.y, 0.224 * torsoScale.z]}
          scale={[1, torsoScale.y, 1]}
          material={fabricMaterial}
        >
          <boxGeometry args={[0.035, 0.64, 0.004]} />
        </mesh>
      )}

      {/* ================= CHEST POCKET ================= */}
      {hasPocket && (
        <mesh
          position={[0.09 * torsoScale.x, 1.02 * torsoScale.y, 0.218 * torsoScale.z]}
          material={fabricMaterial}
        >
          <boxGeometry args={[0.08, 0.09, 0.004]} />
        </mesh>
      )}

      {/* ================= COLLAR ================= */}
      {/* Collar Band / Stand */}
      <mesh position={[0, 1.27 * torsoScale.y, 0]} material={fabricMaterial}>
        <cylinderGeometry args={[0.085, 0.095, 0.05, 32, 1, true]} />
      </mesh>

      {/* Collar Points / Leaves */}
      {collarCode === 'collar_spread' && (
        <group position={[0, 1.26 * torsoScale.y, 0]}>
          {/* Left Wing */}
          <mesh position={[0.05, -0.02, 0.08]} rotation={[0.4, -0.4, -0.2]} material={fabricMaterial}>
            <boxGeometry args={[0.065, 0.065, 0.006]} />
          </mesh>
          {/* Right Wing */}
          <mesh position={[-0.05, -0.02, 0.08]} rotation={[0.4, 0.4, 0.2]} material={fabricMaterial}>
            <boxGeometry args={[0.065, 0.065, 0.006]} />
          </mesh>
        </group>
      )}

      {collarCode === 'collar_cutaway' && (
        <group position={[0, 1.26 * torsoScale.y, 0]}>
          <mesh position={[0.06, -0.015, 0.07]} rotation={[0.3, -0.7, -0.1]} material={fabricMaterial}>
            <boxGeometry args={[0.07, 0.055, 0.006]} />
          </mesh>
          <mesh position={[-0.06, -0.015, 0.07]} rotation={[0.3, 0.7, 0.1]} material={fabricMaterial}>
            <boxGeometry args={[0.07, 0.055, 0.006]} />
          </mesh>
        </group>
      )}

      {collarCode === 'collar_buttondown' && (
        <group position={[0, 1.26 * torsoScale.y, 0]}>
          {/* Rolled Wings */}
          <mesh position={[0.045, -0.03, 0.08]} rotation={[0.5, -0.25, -0.1]} material={fabricMaterial}>
            <boxGeometry args={[0.06, 0.07, 0.006]} />
          </mesh>
          <mesh position={[-0.045, -0.03, 0.08]} rotation={[0.5, 0.25, 0.1]} material={fabricMaterial}>
            <boxGeometry args={[0.06, 0.07, 0.006]} />
          </mesh>
          {/* Miniature Roll Buttons */}
          <mesh position={[0.06, -0.06, 0.09]} rotation={[Math.PI / 2, 0, 0]} material={buttonMaterial}>
            <cylinderGeometry args={[0.005, 0.005, 0.002, 12]} />
          </mesh>
          <mesh position={[-0.06, -0.06, 0.09]} rotation={[Math.PI / 2, 0, 0]} material={buttonMaterial}>
            <cylinderGeometry args={[0.005, 0.005, 0.002, 12]} />
          </mesh>
        </group>
      )}

      {/* ================= SLEEVES & CUFFS ================= */}
      {/* Left Sleeve */}
      <group position={[0.26 * torsoScale.x, 1.15 * torsoScale.y, 0]}>
        <mesh
          position={[0.06, isShortSleeve ? -0.1 : -0.32, 0]}
          rotation={[0, 0, -0.18]}
          material={fabricMaterial}
        >
          <cylinderGeometry
            args={[
              0.065,
              isShortSleeve ? 0.06 : 0.048,
              isShortSleeve ? 0.24 : 0.62,
              24,
              1,
              true
            ]}
          />
        </mesh>

        {/* Left Cuff (Only for long sleeves) */}
        {!isShortSleeve && cuffCode !== 'cuff_none' && (
          <group position={[0.115, -0.63, 0]}>
            <mesh rotation={[0, 0, -0.18]} material={fabricMaterial}>
              <cylinderGeometry
                args={[
                  0.052,
                  0.052,
                  cuffCode === 'cuff_french' ? 0.085 : 0.06,
                  24,
                  1,
                  true
                ]}
              />
            </mesh>
            {/* Cuff Button / Link */}
            <mesh position={[0.053, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={buttonMaterial}>
              <cylinderGeometry args={[0.007, 0.007, 0.003, 12]} />
            </mesh>
          </group>
        )}
      </group>

      {/* Right Sleeve */}
      <group position={[-0.26 * torsoScale.x, 1.15 * torsoScale.y, 0]}>
        <mesh
          position={[-0.06, isShortSleeve ? -0.1 : -0.32, 0]}
          rotation={[0, 0, 0.18]}
          material={fabricMaterial}
        >
          <cylinderGeometry
            args={[
              0.065,
              isShortSleeve ? 0.06 : 0.048,
              isShortSleeve ? 0.24 : 0.62,
              24,
              1,
              true
            ]}
          />
        </mesh>

        {/* Right Cuff (Only for long sleeves) */}
        {!isShortSleeve && cuffCode !== 'cuff_none' && (
          <group position={[-0.115, -0.63, 0]}>
            <mesh rotation={[0, 0, 0.18]} material={fabricMaterial}>
              <cylinderGeometry
                args={[
                  0.052,
                  0.052,
                  cuffCode === 'cuff_french' ? 0.085 : 0.06,
                  24,
                  1,
                  true
                ]}
              />
            </mesh>
            {/* Cuff Button / Link */}
            <mesh position={[-0.053, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={buttonMaterial}>
              <cylinderGeometry args={[0.007, 0.007, 0.003, 12]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};
