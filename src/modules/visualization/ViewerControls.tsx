import React from 'react';
import { RotateCcw, Eye, EyeOff, Play, Pause } from 'lucide-react';

interface ViewerControlsProps {
  onSetCameraAngle: (angle: 'front' | 'side' | 'back' | 'reset') => void;
  showAvatar: boolean;
  onToggleAvatar: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  onSetCameraAngle,
  showAvatar,
  onToggleAvatar,
  autoRotate,
  onToggleAutoRotate
}) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
      {/* View Presets */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => onSetCameraAngle('front')}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          Front
        </button>
        <button
          onClick={() => onSetCameraAngle('side')}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          Side
        </button>
        <button
          onClick={() => onSetCameraAngle('back')}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          Back
        </button>
        <button
          onClick={() => onSetCameraAngle('reset')}
          title="Reset Camera"
          className="p-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={onToggleAvatar}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
            showAvatar
              ? 'bg-sky-600/30 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {showAvatar ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Mannequin</span>
        </button>

        <button
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
            autoRotate
              ? 'bg-sky-600/30 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>Rotate</span>
        </button>
      </div>
    </div>
  );
};
