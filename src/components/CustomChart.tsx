import React, { useState } from 'react';
import { HealthLog } from '../types';
import { Activity, Heart, Info } from 'lucide-react';

interface CustomChartProps {
  logs: HealthLog[];
  type: 'gula' | 'tensi';
}

export function CustomChart({ logs, type }: CustomChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter and sort logs ascending to draw lines
  const sortedLogs = [...logs]
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    .slice(-8); // Show last 8 readings for high-fidelity density

  if (sortedLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl h-64 text-center">
        <Activity className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-sm font-medium text-gray-500">Belum ada rekaman medis di periode ini</p>
        <p className="text-xs text-gray-400 mt-1">Gunakan formulir di atas untuk menginput catatan pertama Anda</p>
      </div>
    );
  }

  // Dimension setup
  const width = 500;
  const height = 220;
  const paddingX = 45;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Find Min / Max bounds for dynamic scaling
  let minVal = 0;
  let maxVal = 200;

  if (type === 'gula') {
    const values = sortedLogs.map(l => l.gulaDarah);
    minVal = Math.max(0, Math.min(...values) - 15);
    maxVal = Math.max(160, Math.max(...values) + 15);
  } else {
    const sistoliks = sortedLogs.map(l => l.sistolik);
    const diastoliks = sortedLogs.map(l => l.diastolik);
    minVal = Math.max(40, Math.min(...diastoliks, ...sistoliks) - 15);
    maxVal = Math.max(170, Math.max(...sistoliks) + 15);
  }

  const getX = (index: number) => {
    if (sortedLogs.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (sortedLogs.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return height - paddingY - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Threshold markers
  const sugarThreshold = 140; // mg/dL post-prandial BPJS limit
  const bpSistolikThreshold = 130; // mmHg Prehypertension boundary
  const bpDiastolikThreshold = 80;

  // Generate SVG Points
  let points1 = ''; // Gula or Sistolik
  let points2 = ''; // Diastolik (Only for BP)

  sortedLogs.forEach((log, index) => {
    const x = getX(index);
    if (type === 'gula') {
      const y = getY(log.gulaDarah);
      points1 += `${index === 0 ? 'M' : 'L'} ${x} ${y} `;
    } else {
      const ySis = getY(log.sistolik);
      const yDia = getY(log.diastolik);
      points1 += `${index === 0 ? 'M' : 'L'} ${x} ${ySis} `;
      points2 += `${index === 0 ? 'M' : 'L'} ${x} ${yDia} `;
    }
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {type === 'gula' ? (
            <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
              <Heart className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              {type === 'gula' ? 'Tren Gula Darah Sewaktu' : 'Tren Tekanan Darah'}
            </h4>
            <p className="text-xs text-gray-400">
              {type === 'gula' ? 'Batas aman: <140 mg/dL' : 'Batas aman: <130/80 mmHg'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {type === 'gula' ? (
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Gula (mg/dL)
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sistolik
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span> Diastolik
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[340px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * chartHeight;
            const val = Math.round(maxVal - ratio * (maxVal - minVal));
            return (
              <g key={idx} className="opacity-45">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x={paddingX - 8} y={y + 4} textAnchor="end" fill="#9CA3AF" className="text-[9px] font-mono">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Reference Threshold Bands */}
          {type === 'gula' && sugarThreshold >= minVal && sugarThreshold <= maxVal && (
            <g className="opacity-30">
              <line
                x1={paddingX}
                y1={getY(sugarThreshold)}
                x2={width - paddingX}
                y2={getY(sugarThreshold)}
                stroke="#EF4444"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text x={width - paddingX - 4} y={getY(sugarThreshold) - 4} textAnchor="end" fill="#EF4444" className="text-[8px] font-medium">
                Ambang Batas Gula (140)
              </text>
            </g>
          )}

          {type === 'tensi' && bpSistolikThreshold >= minVal && bpSistolikThreshold <= maxVal && (
            <g className="opacity-30">
              <line
                x1={paddingX}
                y1={getY(bpSistolikThreshold)}
                x2={width - paddingX}
                y2={getY(bpSistolikThreshold)}
                stroke="#10B981"
                strokeWidth="1"
              />
              <text x={width - paddingX - 4} y={getY(bpSistolikThreshold) - 4} textAnchor="end" fill="#10B981" className="text-[8px] font-medium">
                Batas Sistolik (130)
              </text>
            </g>
          )}

          {/* Draw Main Lines */}
          <path d={points1} fill="none" stroke={type === 'gula' ? '#EF4444' : '#10B981'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {type === 'tensi' && (
            <path d={points2} fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Interaction dots */}
          {sortedLogs.map((log, index) => {
            const x = getX(index);
            const isHovered = hoveredIndex === index;

            if (type === 'gula') {
              const y = getY(log.gulaDarah);
              return (
                <g key={index} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                  {isHovered && <circle cx={x} cy={y} r="8" fill="#EF4444" fillOpacity="0.2" />}
                  <circle cx={x} cy={y} r={isHovered ? "5" : "4.0"} fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
                </g>
              );
            } else {
              const ySis = getY(log.sistolik);
              const yDia = getY(log.diastolik);
              return (
                <g key={index} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                  {isHovered && (
                    <>
                      <circle cx={x} cy={ySis} r="8" fill="#10B981" fillOpacity="0.15" />
                      <circle cx={x} cy={yDia} r="8" fill="#2DD4BF" fillOpacity="0.15" />
                      <line x1={x} y1={ySis} x2={x} y2={yDia} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="2 2" />
                    </>
                  )}
                  <circle cx={x} cy={ySis} r={isHovered ? "5" : "4"} fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
                  <circle cx={x} cy={yDia} r={isHovered ? "5" : "4"} fill="#2DD4BF" stroke="#FFF" strokeWidth="1.5" />
                </g>
              );
            }
          })}

          {/* Dates bottom markers */}
          {sortedLogs.map((log, index) => {
            const x = getX(index);
            const formattedDate = new Date(log.tanggal).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short'
            });
            return (
              <text key={index} x={x} y={height - 8} textAnchor="middle" fill="#9CA3AF" className="text-[9px] font-semibold">
                {formattedDate}
              </text>
            );
          })}
        </svg>
      </div>

      {hoveredIndex !== null && (
        <div className="mt-2.5 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600 animate-fadeIn">
          <div>
            <span className="font-semibold text-slate-800">
              Tanggal: {new Date(sortedLogs[hoveredIndex].tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {sortedLogs[hoveredIndex].catatan && (
              <p className="italic text-gray-400 mt-0.5">Catatan: &quot;{sortedLogs[hoveredIndex].catatan}&quot;</p>
            )}
          </div>
          <div className="text-right whitespace-nowrap font-semibold">
            {type === 'gula' ? (
              <span className="text-red-500 font-mono text-sm bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                {sortedLogs[hoveredIndex].gulaDarah} mg/dL
              </span>
            ) : (
              <span className="text-emerald-600 font-mono text-sm bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                {sortedLogs[hoveredIndex].sistolik}/{sortedLogs[hoveredIndex].diastolik} mmHg
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
