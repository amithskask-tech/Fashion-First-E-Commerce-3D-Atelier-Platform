import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  Fabric,
  CustomizationOption,
  BodyMeasurements,
  FinishedGarmentMeasurements
} from '../../types';
import { AvatarViewer } from '../avatar/AvatarViewer';
import { ShirtModel3D } from './ShirtModel3D';
import { ViewerControls } from './ViewerControls';
import { Info } from 'lucide-react';

interface GarmentCanvasProps {
  fabric: Fabric;
  selectedOptions: Record<string, CustomizationOption>;
  bodyMeasurements: BodyMeasurements;
  garmentMeasurements?: FinishedGarmentMeasurements;
}

export const GarmentCanvas: React.FC<GarmentCanvasProps> = ({
  fabric,
  selectedOptions,
  bodyMeasurements,
  garmentMeasurements
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [showAvatar, setShowAvatar] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  const handleCameraAngle = (angle: 'front' | 'side' | 'back' | 'reset') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    switch (angle) {
      case 'front':
        controls.object.position.set(0, 0.2, 2.5);
        break;
      case 'side':
        controls.object.position.set(2.5, 0.2, 0);
        break;
      case 'back':
        controls.object.position.set(0, 0.2, -2.5);
        break;
      case 'reset':
        controls.object.position.set(0, 0.2, 2.4);
        break;
    }
    controls.target.set(0, 0.2, 0);
    controls.update();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Disclaimer Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800/80 text-xs text-slate-400 pointer-events-none">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <strong className="text-slate-200">Interactive 3D Visualizer:</strong> Proportions reflect selected options and body sizing. Not a certified tailor body scan.
        </span>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas
          camera={{ position: [0, 0.2, 2.4], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Studio 3-Point Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 3, -2]} intensity={0.6} color="#bae6fd" />
          <directionalLight position={[0, -2, -3]} intensity={0.3} color="#f8fafc" />

          {/* Mannequin Avatar (Decoupled Layer) */}
          <AvatarViewer
            measurements={bodyMeasurements}
            visible={showAvatar}
          />

          {/* Garment Mesh Projection */}
          <ShirtModel3D
            fabric={fabric}
            selectedOptions={selectedOptions}
            garmentMeasurements={garmentMeasurements}
          />

          {/* Soft Ground Contact Shadow */}
          <ContactShadows
            position={[0, -1.3, 0]}
            opacity={0.6}
            scale={4}
            blur={2}
            far={4}
          />

          {/* Interactive Camera Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={1.2}
            maxDistance={4.2}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minPolarAngle={Math.PI / 6}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            target={[0, 0.2, 0]}
          />
        </Canvas>
      </div>

      {/* Floating View Controls */}
      <ViewerControls
        onSetCameraAngle={handleCameraAngle}
        showAvatar={showAvatar}
        onToggleAvatar={() => setShowAvatar((prev) => !prev)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
      />
    </div>
  );
};
