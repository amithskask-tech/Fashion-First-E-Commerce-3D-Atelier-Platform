import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  Fabric,
  CustomizationOption,
  FinishedGarmentMeasurements
} from '../../types';
import { createFabricTexture, createZariTexture } from './fabricTextures';

interface KurtaModel3DProps {
  fabric: Fabric;
  selectedOptions: Record<string, CustomizationOption>;
  garmentMeasurements?: FinishedGarmentMeasurements;
}

export const KurtaModel3D: React.FC<KurtaModel3DProps> = ({
  fabric,
  selectedOptions,
  garmentMeasurements
}) => {
  // 1. Procedural PBR Fabric Material
  const fabricMaterial = useMemo(() => {
    const textures = createFabricTexture(fabric.weaveType, fabric.colorHex);
    const isSilk = fabric.weaveType.toLowerCase().includes('silk');
    const isLinen = fabric.weaveType.toLowerCase().includes('linen');

    return new THREE.MeshStandardMaterial({
      map: textures.map,
      bumpMap: textures.bumpMap,
      bumpScale: 0.05,
      roughness: isSilk ? 0.35 : isLinen ? 0.85 : 0.65,
      metalness: isSilk ? 0.15 : 0.04,
      side: THREE.DoubleSide
    });
  }, [fabric.weaveType, fabric.colorHex]);

  // 2. Metallic Kasavu Gold Zari Material
  const zariMaterial = useMemo(() => {
    const textures = createZariTexture();
    return new THREE.MeshStandardMaterial({
      map: textures.map,
      bumpMap: textures.bumpMap,
      bumpScale: 0.08,
      roughness: 0.25,
      metalness: 0.82,
      side: THREE.DoubleSide
    });
  }, []);

  // 3. Button Material (Brass, Wooden, Potli)
  const buttonMaterial = useMemo(() => {
    const btnCode = selectedOptions.buttons?.code;
    if (btnCode === 'kurta_btn_brass') {
      return new THREE.MeshStandardMaterial({
        color: '#c59b27',
        roughness: 0.3,
        metalness: 0.8
      });
    }
    if (btnCode === 'kurta_btn_wooden') {
      return new THREE.MeshStandardMaterial({
        color: '#5c3a21',
        roughness: 0.7,
        metalness: 0.05
      });
    }
    if (btnCode === 'kurta_btn_potli') {
      // Potli buttons are handmade cloth balls matching the fabric color
      return new THREE.MeshStandardMaterial({
        color: fabric.colorHex,
        roughness: 0.6,
        metalness: 0.1
      });
    }
    // Default brass
    return new THREE.MeshStandardMaterial({
      color: '#c59b27',
      roughness: 0.3,
      metalness: 0.8
    });
  }, [selectedOptions.buttons?.code, fabric.colorHex]);

  // 4. Proportional Scale relative to standard Kurta (Chest ~1140mm, Length ~1040mm)
  const torsoScale = useMemo(() => {
    if (!garmentMeasurements) return { x: 1, y: 1, z: 1 };
    const x = garmentMeasurements.chestMm / 1140;
    const y = garmentMeasurements.shirtLengthMm / 1040;
    const z = garmentMeasurements.chestMm / 1140;
    return { x, y, z };
  }, [garmentMeasurements]);

  const necklineCode = selectedOptions.neckline?.code || 'kurta_neck_mandarin';
  const pattiCode = selectedOptions.kurta_patti?.code || 'kurta_patti_classic';
  const sleeveCode = selectedOptions.sleeve?.code || 'kurta_sleeve_full';
  const borderCode = selectedOptions.borders_zari?.code || 'kurta_border_kasavu';
  const pocketCode = selectedOptions.pocket?.code || 'kurta_pocket_dual_inseam';
  const silhouetteCode = selectedOptions.silhouette?.code || 'kurta_sil_straight';

  const isShortSleeve = sleeveCode === 'kurta_sleeve_short';
  const isRollupSleeve = sleeveCode === 'kurta_sleeve_rollup';
  const hasChestPocket = pocketCode === 'kurta_pocket_chest';
  const hasKasavuBorder = borderCode === 'kurta_border_kasavu';
  const isALine = silhouetteCode === 'kurta_sil_aline';
  const isShortKurta = silhouetteCode === 'kurta_sil_short';

  // Bottom flare radius for A-Line vs Straight
  const bottomFlare = isALine ? 0.28 : 0.22;
  const bottomY = isShortKurta ? 0.2 : -0.15;

  return (
    <group position={[0, -0.4 * torsoScale.y, 0]}>
      {/* ================= UPPER CHEST & SHOULDERS ================= */}
      {/* Upper Torso (From waist to shoulders) */}
      <mesh
        position={[0, 0.95 * torsoScale.y, 0]}
        scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
        material={fabricMaterial}
      >
        <cylinderGeometry args={[0.22, 0.21, 0.55, 32, 1, true]} />
      </mesh>

      {/* Shoulder Yoke */}
      <mesh
        position={[0, 1.25 * torsoScale.y, 0]}
        scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
        material={fabricMaterial}
      >
        <cylinderGeometry args={[0.13, 0.22, 0.1, 32]} />
      </mesh>

      {/* ================= LOWER TUNIC WITH SIDE SLITS (CHAK) ================= */}
      {/* Front Panel (from waist y: 0.68 down to bottom hem) */}
      <mesh
        position={[0, ((0.68 + bottomY) / 2) * torsoScale.y, 0.01]}
        scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
        material={fabricMaterial}
      >
        <cylinderGeometry
          args={[0.21, bottomFlare, 0.68 - bottomY, 24, 1, true, -Math.PI / 2.3, Math.PI / 1.15]}
        />
      </mesh>

      {/* Back Panel (separated at sides to represent 320mm side slits) */}
      <mesh
        position={[0, ((0.68 + bottomY) / 2) * torsoScale.y, -0.01]}
        scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
        material={fabricMaterial}
      >
        <cylinderGeometry
          args={[0.21, bottomFlare, 0.68 - bottomY, 24, 1, true, Math.PI / 2 + 0.15, Math.PI / 1.15]}
        />
      </mesh>

      {/* Side Slit Reinforced Piping Edge Trim */}
      <mesh
        position={[0.218 * torsoScale.x, 0.67 * torsoScale.y, 0]}
        material={hasKasavuBorder ? zariMaterial : fabricMaterial}
      >
        <boxGeometry args={[0.008, 0.02, 0.03]} />
      </mesh>
      <mesh
        position={[-0.218 * torsoScale.x, 0.67 * torsoScale.y, 0]}
        material={hasKasavuBorder ? zariMaterial : fabricMaterial}
      >
        <boxGeometry args={[0.008, 0.02, 0.03]} />
      </mesh>

      {/* ================= KASAVU GOLD ZARI BORDER HEM ================= */}
      {hasKasavuBorder ? (
        <group position={[0, (bottomY + 0.025) * torsoScale.y, 0]}>
          {/* Front Hem Zari Band */}
          <mesh
            position={[0, 0, 0.01]}
            scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
            material={zariMaterial}
          >
            <cylinderGeometry
              args={[bottomFlare - 0.002, bottomFlare, 0.05, 24, 1, true, -Math.PI / 2.3, Math.PI / 1.15]}
            />
          </mesh>
          {/* Back Hem Zari Band */}
          <mesh
            position={[0, 0, -0.01]}
            scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
            material={zariMaterial}
          >
            <cylinderGeometry
              args={[bottomFlare - 0.002, bottomFlare, 0.05, 24, 1, true, Math.PI / 2 + 0.15, Math.PI / 1.15]}
            />
          </mesh>
        </group>
      ) : (
        /* Clean Self-Fabric Hem Band */
        <group position={[0, (bottomY + 0.015) * torsoScale.y, 0]}>
          <mesh
            position={[0, 0, 0.01]}
            scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
            material={fabricMaterial}
          >
            <cylinderGeometry
              args={[bottomFlare - 0.002, bottomFlare, 0.03, 24, 1, true, -Math.PI / 2.3, Math.PI / 1.15]}
            />
          </mesh>
          <mesh
            position={[0, 0, -0.01]}
            scale={[torsoScale.x, torsoScale.y, torsoScale.z]}
            material={fabricMaterial}
          >
            <cylinderGeometry
              args={[bottomFlare - 0.002, bottomFlare, 0.03, 24, 1, true, Math.PI / 2 + 0.15, Math.PI / 1.15]}
            />
          </mesh>
        </group>
      )}

      {/* ================= NECKLINE & COLLAR ================= */}
      {necklineCode === 'kurta_neck_mandarin' && (
        /* Classic 35mm Mandarin Band Collar */
        <group position={[0, 1.32 * torsoScale.y, 0]}>
          <mesh
            scale={[torsoScale.x, 1, torsoScale.z]}
            material={hasKasavuBorder ? zariMaterial : fabricMaterial}
          >
            <cylinderGeometry args={[0.098, 0.108, 0.055, 32, 1, true, 0.25, Math.PI * 2 - 0.5]} />
          </mesh>
        </group>
      )}

      {necklineCode === 'kurta_neck_nehru' && (
        /* Structured 42mm Royal Nehru Collar */
        <group position={[0, 1.33 * torsoScale.y, 0]}>
          <mesh
            scale={[torsoScale.x, 1, torsoScale.z]}
            material={fabricMaterial}
          >
            <cylinderGeometry args={[0.095, 0.105, 0.07, 32, 1, true, 0.2, Math.PI * 2 - 0.4]} />
          </mesh>
          {/* Subtle gold zari inner piping if Kasavu border selected */}
          {hasKasavuBorder && (
            <mesh
              position={[0, 0.032, 0]}
              scale={[torsoScale.x, 1, torsoScale.z]}
              material={zariMaterial}
            >
              <cylinderGeometry args={[0.097, 0.097, 0.01, 32, 1, true]} />
            </mesh>
          )}
        </group>
      )}

      {necklineCode === 'kurta_neck_round' && (
        /* Collarless Round Neck with Piping */
        <group position={[0, 1.28 * torsoScale.y, 0]}>
          <mesh
            scale={[torsoScale.x, 1, torsoScale.z]}
            material={hasKasavuBorder ? zariMaterial : fabricMaterial}
          >
            <torusGeometry args={[0.105, 0.009, 12, 32]} />
          </mesh>
        </group>
      )}

      {/* ================= KURTA PATTI (FRONT CHEST PLACKET) ================= */}
      {/* Front Placket Base */}
      <mesh
        position={[0, 1.05 * torsoScale.y, 0.218 * torsoScale.z]}
        scale={[1, torsoScale.y, 1]}
        material={pattiCode === 'kurta_patti_contrast' ? zariMaterial : fabricMaterial}
      >
        <boxGeometry args={[0.042, 0.38, 0.009]} />
      </mesh>

      {/* Placket Side Piping (Kasavu Trim) */}
      {pattiCode === 'kurta_patti_contrast' && (
        <group>
          <mesh position={[-0.023, 1.05 * torsoScale.y, 0.22 * torsoScale.z]}>
            <boxGeometry args={[0.005, 0.38, 0.008]} />
            <primitive object={zariMaterial} attach="material" />
          </mesh>
          <mesh position={[0.023, 1.05 * torsoScale.y, 0.22 * torsoScale.z]}>
            <boxGeometry args={[0.005, 0.38, 0.008]} />
            <primitive object={zariMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* Placket Buttons (Concealed fly skips visible buttons) */}
      {pattiCode !== 'kurta_patti_concealed' && (
        <group>
          {[1.22, 1.12, 1.02, 0.92].map((yOffset, i) => (
            <mesh
              key={i}
              position={[0, yOffset * torsoScale.y, 0.226 * torsoScale.z]}
              rotation={[Math.PI / 2, 0, 0]}
              material={buttonMaterial}
            >
              <cylinderGeometry args={[0.008, 0.008, 0.005, 16]} />
            </mesh>
          ))}
        </group>
      )}

      {/* ================= SLEEVES ================= */}
      {/* Left Sleeve */}
      <group position={[0.24 * torsoScale.x, 1.15 * torsoScale.y, 0]} rotation={[0, 0, -0.22]}>
        {isShortSleeve ? (
          /* Short Sleeve */
          <group>
            <mesh position={[0.04, -0.12, 0]} material={fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.078, 0.22, 24]} />
            </mesh>
            {hasKasavuBorder && (
              <mesh position={[0.04, -0.21, 0]} material={zariMaterial}>
                <cylinderGeometry args={[0.079, 0.08, 0.04, 24, 1, true]} />
              </mesh>
            )}
          </group>
        ) : isRollupSleeve ? (
          /* Roll-up Sleeve with Buttoned Tab */
          <group>
            <mesh position={[0.05, -0.22, 0]} material={fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.075, 0.42, 24]} />
            </mesh>
            {/* Folded Cuff */}
            <mesh position={[0.07, -0.4, 0]} material={hasKasavuBorder ? zariMaterial : fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.082, 0.06, 24]} />
            </mesh>
            {/* Roll-up tab strap and button */}
            <mesh position={[0.088, -0.36, 0.01]} material={fabricMaterial}>
              <boxGeometry args={[0.018, 0.07, 0.005]} />
            </mesh>
            <mesh position={[0.09, -0.34, 0.012]} rotation={[0, 0, Math.PI / 2]} material={buttonMaterial}>
              <cylinderGeometry args={[0.006, 0.006, 0.004, 16]} />
            </mesh>
          </group>
        ) : (
          /* Full Straight Sleeve */
          <group>
            <mesh position={[0.06, -0.32, 0]} material={fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.068, 0.62, 24]} />
            </mesh>
            {/* Sleeve Cuff Trim */}
            {hasKasavuBorder ? (
              <mesh position={[0.09, -0.61, 0]} material={zariMaterial}>
                <cylinderGeometry args={[0.068, 0.069, 0.045, 24, 1, true]} />
              </mesh>
            ) : (
              <mesh position={[0.09, -0.61, 0]} material={fabricMaterial}>
                <cylinderGeometry args={[0.068, 0.069, 0.025, 24, 1, true]} />
              </mesh>
            )}
          </group>
        )}
      </group>

      {/* Right Sleeve */}
      <group position={[-0.24 * torsoScale.x, 1.15 * torsoScale.y, 0]} rotation={[0, 0, 0.22]}>
        {isShortSleeve ? (
          /* Short Sleeve */
          <group>
            <mesh position={[-0.04, -0.12, 0]} material={fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.078, 0.22, 24]} />
            </mesh>
            {hasKasavuBorder && (
              <mesh position={[-0.04, -0.21, 0]} material={zariMaterial}>
                <cylinderGeometry args={[0.079, 0.08, 0.04, 24, 1, true]} />
              </mesh>
            )}
          </group>
        ) : isRollupSleeve ? (
          /* Roll-up Sleeve with Buttoned Tab */
          <group>
            <mesh position={[-0.05, -0.22, 0]} material={fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.075, 0.42, 24]} />
            </mesh>
            {/* Folded Cuff */}
            <mesh position={[-0.07, -0.4, 0]} material={hasKasavuBorder ? zariMaterial : fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.082, 0.06, 24]} />
            </mesh>
            {/* Roll-up tab strap and button */}
            <mesh position={[-0.088, -0.36, 0.01]} material={fabricMaterial}>
              <boxGeometry args={[0.018, 0.07, 0.005]} />
            </mesh>
            <mesh position={[-0.09, -0.34, 0.012]} rotation={[0, 0, Math.PI / 2]} material={buttonMaterial}>
              <cylinderGeometry args={[0.006, 0.006, 0.004, 16]} />
            </mesh>
          </group>
        ) : (
          /* Full Straight Sleeve */
          <group>
            <mesh position={[-0.06, -0.32, 0]} material={fabricMaterial}>
              <cylinderGeometry args={[0.082, 0.068, 0.62, 24]} />
            </mesh>
            {/* Sleeve Cuff Trim */}
            {hasKasavuBorder ? (
              <mesh position={[-0.09, -0.61, 0]} material={zariMaterial}>
                <cylinderGeometry args={[0.068, 0.069, 0.045, 24, 1, true]} />
              </mesh>
            ) : (
              <mesh position={[-0.09, -0.61, 0]} material={fabricMaterial}>
                <cylinderGeometry args={[0.068, 0.069, 0.025, 24, 1, true]} />
              </mesh>
            )}
          </group>
        )}
      </group>

      {/* ================= OPTIONAL CHEST POCKET ================= */}
      {hasChestPocket && (
        <group position={[0.085 * torsoScale.x, 1.08 * torsoScale.y, 0.218 * torsoScale.z]}>
          <mesh material={fabricMaterial}>
            <boxGeometry args={[0.065, 0.075, 0.006]} />
          </mesh>
          {/* Pocket top welt edge */}
          <mesh position={[0, 0.038, 0.002]} material={hasKasavuBorder ? zariMaterial : fabricMaterial}>
            <boxGeometry args={[0.068, 0.012, 0.006]} />
          </mesh>
        </group>
      )}
    </group>
  );
};
