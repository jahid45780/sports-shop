import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-lime-400" />
            <h3 className="text-lg font-bold font-display uppercase tracking-wide text-white">
              Official Sports Jersey Size Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          <p className="text-zinc-400 leading-relaxed">
            Our matchday and player edition football shirts are tailored with an athletic performance cut. If you prefer a loose or relaxed fit for everyday casual wear, we recommend ordering one size up.
          </p>

          {/* Measurements Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left font-mono text-[11px] tabular-nums">
              <thead className="bg-zinc-900 text-zinc-400 font-sans uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Size</th>
                  <th className="py-2.5 px-3 font-semibold">Chest (Inches)</th>
                  <th className="py-2.5 px-3 font-semibold">Length (Inches)</th>
                  <th className="py-2.5 px-3 font-semibold">Weight (KG)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-lime-400">S (Small)</td>
                  <td className="py-2.5 px-3">38" (96 cm)</td>
                  <td className="py-2.5 px-3">27" (68 cm)</td>
                  <td className="py-2.5 px-3">50 - 62 kg</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-lime-400">M (Medium)</td>
                  <td className="py-2.5 px-3">40" (101 cm)</td>
                  <td className="py-2.5 px-3">28" (71 cm)</td>
                  <td className="py-2.5 px-3">63 - 72 kg</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-lime-400">L (Large)</td>
                  <td className="py-2.5 px-3">42" (106 cm)</td>
                  <td className="py-2.5 px-3">29" (74 cm)</td>
                  <td className="py-2.5 px-3">73 - 82 kg</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-lime-400">XL (Extra Large)</td>
                  <td className="py-2.5 px-3">44" (112 cm)</td>
                  <td className="py-2.5 px-3">30" (76 cm)</td>
                  <td className="py-2.5 px-3">83 - 92 kg</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-lime-400">XXL (Double XL)</td>
                  <td className="py-2.5 px-3">46" (117 cm)</td>
                  <td className="py-2.5 px-3">31" (79 cm)</td>
                  <td className="py-2.5 px-3">93 - 105 kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Measuring Instructions */}
          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-1.5">
            <div className="font-bold text-white text-xs uppercase font-sans">
              How to Measure at Home:
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
              <li><strong>Chest:</strong> Measure horizontally around the fullest part of your chest, keeping tape level under arms.</li>
              <li><strong>Length:</strong> Measure from highest shoulder seam point down to the bottom hem.</li>
              <li><strong>Exchange Policy:</strong> If the fit is not ideal, you can exchange sizes within 48 hours after delivery.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
